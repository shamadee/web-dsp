var Module = {};

function isImageData(element) {
  return element instanceof ImageData;
};

function isCanvasImageSource(element) {
  return (
    element instanceof HTMLCanvasElement ||
    element instanceof HTMLImageElement ||
    element instanceof HTMLVideoElement ||
    element instanceof ImageBitmap
  );
};

function toCanvas(source) {
  console.assert(isCanvasImageSource(source));
  if (source instanceof HTMLCanvasElement) {
    return source;
  }
  var canvas = document.createElement('canvas'); // draw to a temp canvas
  canvas.width = source.videoWidth || source.naturalWidth || source.width;
  canvas.height =  source.videoHeight || source.naturalHeight || source.height;
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
};

// Reads image data from ImageData or CanvasImageSource(HTMLCanvasElement or HTMLImageElement or HTMLVideoElement or ImageBitmap)
// TODO: maybe CanvasRenderingContext2D and Blob also?
function readImageData(source) {
  console.assert(source);
  if (isImageData(source)) {
    return source;
  }
  var canvas = toCanvas(source);
  return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
};

function writeImageDataToCanvas(canvas, data, width, height) {
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  var imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas;
};

// Writes image data into ImageData, HTMLCanvasElement, HTMLImageElement or creates a new canvas and appends it
function writeImageData(dest, data, width, height) {
  console.assert(dest);

  if (typeof dest === 'function') {
    dest(data, width, height);
    return;
  }

  if (isImageData(dest)) {
    console.assert(dest.width === width, dest.height === height);
    dest.data.set(data);
    return;
  }

  console.assert(dest instanceof HTMLElement);
  console.assert(!(dest instanceof HTMLVideoElement), 'Cannot write to video element');
  var canvas = (dest instanceof HTMLCanvasElement) ? dest : document.createElement('canvas');
  writeImageDataToCanvas(canvas, data, width, height);

  if (!(dest instanceof HTMLCanvasElement)) {
    if (dest instanceof HTMLImageElement) {
      dest.src = canvas.toDataURL();
    } else {
      dest.appendChild(canvas);
    }
  }
};

function drawVideo(element, destination) {
  const canvas = document.createElement('canvas');
  canvas.width = element.videoWidth;
  canvas.height =  element.videoHeight;
  context = canvas.getContext('2d');
  context.drawImage(element, 0, 0, canvas.width, canvas.height);
  pixels = context.getImageData(0, 0, element.width, element.height);
  pixels.data.set(filter(pixels.data));
  // context.putImageData(pixels, 0, 0);
  if (!destination) {
    const dest = document.querySelector('#wasm-canvas');
    if (!dest) {
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'wasm-canvas';
      const newContext = newCanvas.getContext('2d');
    }
  }
}

function createFilter(filter) {
  return function(element, destination) {
    if (element instanceof HTMLVideoElement) {
      if (!element.paused) requestAnimationFrame(drawVideo(element, destination));
      return;
    }
    if (element instanceof HTMLCanvasElement) {
      const context = element.getContext('2d');
      const pixels = context.getImageData(0, 0, element.width, element.height);
      pixels.data.set(filter(pixels.data));
      context.putImageData(pixels, 0, 0);
    }
  }
}

function loadWASM() {
  return new Promise((resolve, reject) => {
    if (!('WebAssembly' in window)) {
      console.log('Couldn\'t load WASM, loading JS Fallback');
      const fbScript = document.createElement('script');
      fbScript.src = './lib/webdsp_polyfill.js';
      fbScript.onload = function() {
        return resolve(jsFallback());
      }
      document.body.appendChild(fbScript);
    } else {
      // TODO: use xmlhttprequest where fetch not supported
      fetch('./lib/webdsp_c.wasm')
        .then(response => response.arrayBuffer())
        .then(buffer => {
          Module.wasmBinary = buffer;
          // GLOBAL -- create custom event for complete glue script execution
          script = document.createElement('script');
          doneEvent = new Event('done');
          script.addEventListener('done', buildWam);
          // END GLOBAL

          // TODO: IN EMSCRIPTEN GLUE INSERT
          // else{doRun()} ...
          // script.dispatchEvent(doneEvent);
          // ... }Module["run"]

          script.src = './lib/webdsp_c.js';
          document.body.appendChild(script);

          function buildWam() {
            console.log('Emscripten boilerplate loaded.');
            const wam = {};

            // filters
            wam['grayScale'] = function (pixelData) {
              const len = pixelData.length
              const mem = _malloc(len);
              HEAPU8.set(pixelData, mem); 
              _grayScale(mem, len);
              const filtered = HEAPU8.subarray(mem, mem + len);
              _free(mem);
              return filtered;
            };
            wam['brighten'] = function (pixelData, brightness=25) {
              const len = pixelData.length;
              const mem = _malloc(len);
              HEAPU8.set(pixelData, mem);
              _brighten(mem, len, brightness);
              const filtered = HEAPU8.subarray(mem, mem + len);
              _free(mem);
              return filtered;
            };
            wam['invert'] = function (pixelData) {
              const len = pixelData.length;
              const mem = _malloc(len);
              HEAPU8.set(pixelData, mem);
              _invert(mem, len);
              const filtered = HEAPU8.subarray(mem, mem + len);
              _free(mem);
              return filtered;
            };
            wam['noise'] = function (pixelData) {
              const len = pixelData.length;
              const mem = _malloc(len * Float32Array.BYTES_PER_ELEMENT);
              HEAPF32.set(pixelData, mem / Float32Array.BYTES_PER_ELEMENT);
              _noise(mem, len);
              const filtered = HEAPF32.subarray(mem / Float32Array.BYTES_PER_ELEMENT, mem / Float32Array.BYTES_PER_ELEMENT + len);
              _free(mem);
              return filtered;
            };
            //MultiFilter Family of Functions
            wam['multiFilter'] = function (pixelData, width, filterType, mag, multiplier, adj) {
              const len = pixelData.length;
              const mem = _malloc(len);
              HEAPU8.set(pixelData, mem);
              _multiFilter(mem, len, width, filterType, mag, multiplier, adj);
              const filtered = HEAPU8.subarray(mem, mem + len);
              _free(mem);
              return filtered;
            };
            wam['multiFilterFloat'] = function (pixelData, width, filterType, mag, multiplier, adj) {
              const len = pixelData.length;
              const mem = _malloc(len * Float32Array.BYTES_PER_ELEMENT);
              HEAPF32.set(pixelData, mem / Float32Array.BYTES_PER_ELEMENT);
              _multiFilterFloat(mem, len, width, filterType, mag, multiplier, adj);
              const filtered = HEAPF32.subarray(mem / Float32Array.BYTES_PER_ELEMENT, mem / Float32Array.BYTES_PER_ELEMENT + len);
              _free(mem);
              return filtered;
            };
            //bindLastArgs is defined and hoisted from below the module load
            let mag = 127, mult = 2, adj = 4;
            let filt = wam['multiFilter'];
            let filtFloat = wam['multiFilterFloat'];
            wam['sunset'] = bindLastArgs(filt, 4, mag, mult, adj);
            wam['analogTV'] = bindLastArgs(filt, 7, mag, mult, adj);
            wam['emboss'] = bindLastArgs(filt, 1, mag, mult, adj);
            wam['urple'] = bindLastArgs(filt, 2, mag, mult, adj);
            wam['forest'] = bindLastArgs(filtFloat, 5, mag, 3, 1);
            wam['romance'] = bindLastArgs(filtFloat, 8, mag, 3, 2);
            wam['hippo'] = bindLastArgs(filtFloat, 2, 80, 3, 2);  
            wam['longhorn'] = bindLastArgs(filtFloat, 2, 27, 3, 2);
            wam['underground'] = bindLastArgs(filt, 8, mag, 1, 4); 
            wam['rooster'] = bindLastArgs(filt, 8, 60, 1, 4); 
            wam['moss'] = bindLastArgs(filtFloat, 1, mag, 1, 1); 
            wam['mist'] = bindLastArgs(filt, 1, mag, 1, 1); 
            wam['kaleidoscope'] = bindLastArgs(filt, 1, 124, 4, 3);
            wam['tingle'] = bindLastArgs(filtFloat, 1, 124, 4, 3);
            wam['bacteria'] = bindLastArgs(filt, 4, 0, 2, 4);
            wam['hulk'] = bindLastArgs(filt, 2, 10, 2, 4);
            wam['ghost'] = bindLastArgs(filt, 1, 5, 2, 4);
            wam['swamp'] = bindLastArgs(filtFloat, 1, 40, 2, 3);
            wam['twisted'] = bindLastArgs(filt, 1, 40, 2, 3);
            wam['security'] = bindLastArgs(filt, 1, 120, 1, 0);
            wam['robbery'] = bindLastArgs(filtFloat, 1, 120, 1, 0);
            //end filters from multiFilter family

            wam['sobelFilter'] = function (pixelData, width, height, invert=false) {
              const len = pixelData.length;
              const mem = _malloc(len);
              HEAPU8.set(pixelData, mem);
              _sobelFilter(mem, width, height, invert);
              const filtered = HEAPU8.subarray(mem, mem + len);
              _free(mem);
              return filtered;
            };
            //convFilter family of filters
            wam['convFilter'] = function(pixelData, width, height, kernel, divisor, bias=0, count=1) {
              const arLen = pixelData.length;
              const memData = _malloc(arLen * Float32Array.BYTES_PER_ELEMENT);
              HEAPF32.set(pixelData, memData / Float32Array.BYTES_PER_ELEMENT);
              const kerWidth = kernel[0].length;
              const kerHeight = kernel.length;
              const kerLen = kerWidth * kerHeight;
              const flatKernel = kernel.reduce((acc, cur) => acc.concat(cur));
              const memKernel = _malloc(kerLen * Float32Array.BYTES_PER_ELEMENT);
              HEAPF32.set(flatKernel, memKernel / Float32Array.BYTES_PER_ELEMENT);                
              _convFilter(memData, width, height, memKernel, 3, 3, divisor, bias, count);
              const filtered = HEAPF32.subarray(memData / Float32Array.BYTES_PER_ELEMENT, memData / Float32Array.BYTES_PER_ELEMENT + arLen);
              _free(memData);
              _free(memKernel);
              return filtered;
            }
            //defining kernel and other parameters before each function definition
            let kernel = [[1, 1, 1], [1, 1, 1], [1, 1, 1]], divisor = 9, bias = 0, count = 1;
            let conv = wam['convFilter'];
            wam['blur'] = bindLastArgs(conv, kernel, divisor, bias, 3);
            kernel = [[-1, -1, -1], [-1,  8, -1], [-1, -1, -1]], divisor = 1;
            wam['strongSharpen'] = bindLastArgs(conv, kernel, divisor);
            kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], divisor = 2;
            wam['sharpen'] = bindLastArgs(conv, kernel, divisor);
            kernel = [[1, -1, -1], [-1,  8, -1], [-1, -1, 1]], divisor = 3;
            wam['clarity'] = bindLastArgs(conv, kernel, divisor);
            kernel = [[-1, -1, 1], [-1,  14, -1], [1, -1, -1]], divisor = 3;
            wam['goodMorning'] = bindLastArgs(conv, kernel, divisor);
            kernel = [[4, -1, -1], [-1,  4, -1], [0, -1, 4]], divisor = 3;
            wam['acid'] = bindLastArgs(conv, kernel, divisor);
            kernel = [[0, 0, -1], [-1,  12, -1], [0, -1, -1]], divisor = 2;
            wam['dewdrops'] = bindLastArgs(conv, kernel, divisor);
            kernel = [[-1, -1, 4], [-1,  9, -1], [0, -1, 0]], divisor = 2;
            wam['destruction'] = bindLastArgs(conv, kernel, divisor);
            //end convFilter family of filters
            resolve(wam);
          };
        });
    }
  });
}
//to bind arguments in the right order
function bindLastArgs (func, ...boundArgs){
  return function (...baseArgs) {
    return func(...baseArgs, ...boundArgs);
  }
}
