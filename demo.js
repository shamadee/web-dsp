let m = {};
let jsActive = true;
let filter = 'Normal', prevFilter;
let t0, t1 = Infinity, t2, t3 = Infinity, line1, line2, perf1, perf2, perfStr1, perfStr2, avg1, avg2, wasmStats, jsStats, percent=0;
let counter=0, sum1=0, sum2=0;
let pixels, pixels2;
let cw, cw2, ch, ch2;
let speedDiv = document.getElementsByTagName('h2')[0];
let avgDisplay = document.getElementById('avg');
loadWASM()
  .then(cMath => {
    m = cMath;
}).catch((obj) => {
  jsFallback();
}).then(() => {
    window.onload = (() => { 
      createStats();
      addButtons();
      graphStats();
    })();
});

function disableJS() {
  jsActive = !jsActive;
  if (!jsActive) document.getElementById('jsButton').innerHTML = 'Enable JavaScript';
  else document.getElementById('jsButton').innerHTML = 'Disable JavaScript';
}

//wasm video
var vid = document.getElementById('v');
var canvas = document.getElementById('c');
var context = canvas.getContext('2d');
vid.addEventListener("loadeddata", function() {
  canvas.setAttribute('height', vid.videoHeight);
  canvas.setAttribute('width', vid.videoWidth);
  cw = canvas.clientWidth; //usually same as canvas.height
  ch = canvas.clientHeight;
  draw();
});

//javascript video
var vid2 = document.getElementById('v2');
var canvas2 = document.getElementById('c2');
var context2 = canvas2.getContext('2d');
vid2.addEventListener("loadeddata", function() {
  canvas2.setAttribute('height', vid2.videoHeight);
  canvas2.setAttribute('width', vid2.videoWidth);
  cw2 = canvas2.clientWidth; //usually same as canvas.height
  ch2 = canvas2.clientHeight;
  draw2();
});

function draw() {
  context.drawImage(vid, 0, 0);
  // console.log('check', vid, context);
  pixels = context.getImageData(0, 0, vid.videoWidth, vid.videoHeight);
  if (filter !== 'Normal') {
    t0 = performance.now();
    setPixels(filter, 'wasm');
    t1 = performance.now();
  }
  context.putImageData(pixels, 0, 0);
  requestAnimationFrame(draw); 
}

//for javascript example
function draw2() {
  context2.drawImage(vid2, 0, 0);
  pixels2 = context2.getImageData(0, 0, vid2.videoWidth, vid2.videoHeight);
  if (filter !== 'Normal') {
    t2 = performance.now();
    setPixels(filter, 'js');
    t3 = performance.now();
  }
  context2.putImageData(pixels2, 0, 0);
  requestAnimationFrame(draw2);  
}


//STATS, Buttons adding, SetPixels function stuff starts below
function graphStats () {
  // reset values;
  if (prevFilter !== filter) {
    perf1 = 0;
    perf2 = 0;
    sum1 = 0;
    sum2 = 0;
    avg1 = 0;
    avg2 = 0;
    counter = 0;
  };

  if (filter !== 'Normal') {
    perf1 = t1 - t0;
    perf2 = t3 - t2;
    sum1 += perf1;
    sum2 += perf2;
    counter += 1;
    if (counter % 5 === 0) {
      avg1 = sum1 / counter;
      avg2 = sum2 / counter;
      avgDisplay.innerText = `Average computation time WASM: ${avg1.toString().slice(0, 4)} ms, JS: ${avg2.toString().slice(0, 4)} ms`;
      line1.append(new Date().getTime(), 1000 / perf1);
      line2.append(new Date().getTime(), 1000 / perf2);
    }
    perfStr1 = perf1.toString().slice(0, 4);
    perfStr2 = perf2.toString().slice(0, 5);
    wasmStats = `WASM computation time: ${perfStr1} ms`;
    jsStats = ` JS computation time: ${perfStr2} ms`;
    document.getElementById("stats").textContent = wasmStats + jsStats;
    percent = Math.round(((perf2 - perf1) / perf1) * 100);
  }
  if (filter !== 'Normal') {
    speedDiv.innerText = `Speed Stats: WASM is currently ${percent}% faster than JS`;
  }
  else speedDiv.innerText = 'Speed Stats';

  prevFilter = filter;
  setTimeout(graphStats, 500);
}

function createStats() {
  let smoothie = new SmoothieChart({
    maxValueScale: 1.1,
    minValueScale: 0.5,
    grid: {
      strokeStyle: 'rgb(60, 60, 60)',
      fillStyle: 'rgb(30, 30, 30)',
      lineWidth: 1,
      millisPerLine: 250,
      verticalSections: 5,
    },
    labels: {
      fillStyle: 'rgb(255, 255, 255)',
      fontSize: 14,
    },
  });
  // send smoothie data to canvas
  smoothie.streamTo(document.getElementById('statsCanvas'), 500);
  
  // declare smoothie timeseries 
  line1 = new TimeSeries();
  line2 = new TimeSeries();
  
  // define graph lines and colors
  smoothie.addTimeSeries(line1,
    {
      strokeStyle: 'rgb(0, 255, 0)',
      fillStyle: 'rgba(0, 255, 0, 0.075)',
      lineWidth: 3,
    }
  );
  smoothie.addTimeSeries(line2,
    { strokeStyle: 'rgb(0, 0, 255)',
      fillStyle: 'rgba(0, 0, 255, 0.075)',
      lineWidth: 3,
    }
  );
}

function addButtons (filtersArr) {
  let filters = ['Normal', 'Grayscale', 'Brighten', 'Invert', 'Noise', 'Sunset', 
                 'Analog TV', 'Emboss', 'Super Edge', 'Super Edge Inv',
                 'Gaussian Blur', 'Sharpen', 'Sharpen2'];
  let buttonDiv = document.createElement('div');
  buttonDiv.id = 'buttons';
  document.body.appendChild(buttonDiv);
  for (let i = 0; i < filters.length; i++) {
    let button = document.createElement('button');
    button.innerText = filters[i];
    button.addEventListener('click', function() {
      filter = filters[i];
      this.classList.add('selected');
    });
    buttonDiv.appendChild(button);
  }
}

function setPixels (filter, language) {
  if (language === 'wasm') {
    let kernel, divisor;
    switch (filter) {
      case 'Grayscale': pixels.data.set(m.grayScale(pixels.data)); break;
      case 'Brighten': pixels.data.set(m.brighten(pixels.data)); break;
      case 'Invert': pixels.data.set(m.invert(pixels.data)); break;
      case 'Noise': pixels.data.set(m.noise(pixels.data)); break;
      case 'Sunset': pixels.data.set(m.edgeManip(pixels.data, 4, cw)); break;
      case 'Analog TV': pixels.data.set(m.edgeManip(pixels.data, 7, cw)); break;
      case 'Emboss': pixels.data.set(m.edgeManip(pixels.data, 1, cw)); break;
      case 'Super Edge': pixels.data.set(m.sobelFilter(pixels.data, vid.videoWidth, vid.videoHeight)); break;
      case 'Super Edge Inv': pixels.data.set(m.sobelFilter(pixels.data, vid.videoWidth, vid.videoHeight, true)); break;
      case 'Gaussian Blur':
        kernel = [1, 1, 1, 1, 1, 1, 1, 1, 1];
        divisor = kernel.reduce((a, b) => a + b, 0) || 1;
        // pixels.data.set(m.convFilter(pixels.data, kernel, 3, divisor, vid.videoWidth, vid.videoHeight)); 
        pixels.data.set(m.convFilter(pixels.data, vid.videoWidth, vid.videoHeight, kernel, divisor, 0, 3));
        break;
      case 'Sharpen':
        kernel = [-1, -1, -1, -1,  8, -1, -1, -1, -1];
        divisor = kernel.reduce((a, b) => a + b, 0) || 1;
        // pixels.data.set(m.convFilter(pixels.data, kernel, 1, divisor, vid.videoWidth, vid.videoHeight));
        pixels.data.set(m.convFilter(pixels.data, vid.videoWidth, vid.videoHeight, kernel, divisor, 0, 1));
        break;
      case 'Sharpen2':
        kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        divisor = kernel.reduce((a, b) => a + b, 0) || 1;
        // pixels.data.set(m.convFilter(pixels.data, kernel, 1, 1.99, vid.videoWidth, vid.videoHeight));
        pixels.data.set(m.convFilter(pixels.data, vid.videoWidth, vid.videoHeight, kernel, 1.99, 0, 1));
        break;      
    }
  } else if (jsActive) {
    switch (filter) {
      case 'Grayscale': pixels2.data.set(jsGrayScale(pixels2.data)); break;
      case 'Brighten': pixels2.data.set(jsBrighten(pixels2.data)); break;
      case 'Invert': pixels2.data.set(jsInvert(pixels2.data)); break;
      case 'Noise': pixels2.data.set(jsNoise(pixels2.data)); break;
      case 'Sunset': pixels2.data.set(jsEdgeManip(pixels2.data, 4, cw2)); break;
      case 'Analog TV': pixels2.data.set(jsEdgeManip(pixels2.data, 7, cw2)); break;
      case 'Emboss': pixels2.data.set(jsEdgeManip(pixels2.data, 1, cw2)); break;
      case 'Super Edge': pixels2.data.set(jsConvFilter(pixels2.data, vid2.videoWidth, vid2.videoHeight)); break;
      case 'Super Edge Inv': pixels2.data.set(jsConvFilter(pixels2.data, vid2.videoWidth, vid2.videoHeight, true)); break;
      case 'Gaussian Blur': 
        kernel = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        pixels2.data.set(jsMatrixConvolution(pixels2.data, vid2.videoWidth, vid2.videoHeight, kernel, 9, 0, 3));
        break;
      case 'Sharpen':
        kernel = [[-1, -1, -1], [-1,  8, -1], [-1, -1, -1]];
        pixels2.data.set(jsMatrixConvolution(pixels2.data, vid2.videoWidth, vid2.videoHeight, kernel, 1, 0, 1));
        break;
      case 'Sharpen2':
        kernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
        pixels2.data.set(jsMatrixConvolution(pixels2.data, vid2.videoWidth, vid2.videoHeight, kernel, 1.99, 0, 1));
        break;
    }
  }
}
