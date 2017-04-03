// fallback extravaganza
jsFallback = function() {
  const wam = {};
  let mag = 127, mult = 2, adj = 4;
  wam['grayScale'] = js_grayScale;
  wam['brighten'] = js_brighten;
  wam['invert'] = js_invert;
  wam['noise'] = js_noise;
  wam['multiFilter'] = js_multiFilter;
  wam['sunset'] = js_sunset;
  wam['analogTV'] = js_analog;
  wam['emboss'] = js_emboss;
  wam['sobelFilter'] = js_sobelFilter;
  wam['convFilter'] = js_convFilter;
  wam['blur'] = js_blur;
  wam['sharpen'] = js_sharpen;
  wam['strongSharpen'] = js_strongSharpen;
  wam['urple'] = js_urple;
  wam['forest'] = js_forest;
  wam['romance'] = js_romance;
  wam['hippo'] = js_hippo; 
  wam['longhorn'] = js_longhorn;
  wam['underground'] = js_underground;
  wam['rooster'] = js_rooster;
  wam['mist'] = js_mist;
  wam['moss'] = js_mist;
  wam['tingle'] = js_tingle;
  wam['kaleidoscope'] = js_tingle;
  wam['bacteria'] = js_bacteria;
  wam['clarity'] = js_clarity;
  wam['goodMorning'] = js_goodMorning;
  wam['acid'] = js_acid;
  wam['dewdrops'] = js_dewdrops;
  wam['destruction'] = js_destruction;
  wam['hulk'] = js_hulk;
  wam['ghost'] = js_ghost; 
  wam['twisted'] = js_twisted;
  wam['swamp'] = js_twisted;
  wam['security'] = js_security;
  wam['robbery'] = js_security;

  return wam;
}
function js_grayScale(data) {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    let a = data[i+3];
    // let brightness = (r*.21+g*.72+b*.07);

    data[i] = r;
    data[i+1] = r;
    data[i+2] = r;
    data[i+3] = a;
  }
  return data;
}
function js_brighten(data, brightness=25) {
  for (let i = 0; i < data.length; i += 4) {
    data[i]   + brightness > 255 ? 255 : data[i] += brightness;
    data[i+1] + brightness > 255 ? 255 : data[i+1] += brightness;
    data[i+2] + brightness > 255 ? 255 : data[i+2] += brightness;
  }
  return data;
}
function js_invert(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; //r
    data[i+1] = 255 - data[i+1]; //g
    data[i+2] = 255 - data[i+2]; //b
  }
  return data;
}
function js_noise(data) {
  let random;
  for (let i = 0; i < data.length; i += 4) {
    random = (Math.random() - 0.5) * 70;
    data[i] = data[i] + random; //r
    data[i+1] = data[i+1] + random; //g
    data[i+2] = data[i+2] + random; //b
  }
  return data;
}
function js_multiFilter(data, width, filterType, mag, mult, adj) {
  for (let i = 0; i < data.length; i += filterType) {
      if (i % 4 != 3) {
        data[i] = mag + mult * data[i] - data[i + adj] - data[i + width * 4];
      }
    }
  return data;
} // output needs to be clamped to match C++ filters
const js_sunset = bindLastArgs(js_multiFilter, 4, 127, 2, 4);
const js_analog = bindLastArgs(js_multiFilter, 7, 127, 2, 4);
const js_emboss = bindLastArgs(js_multiFilter, 1, 127, 2, 4);
const js_urple = bindLastArgs(js_multiFilter, 2, 127, 2, 4);
const js_forest = bindLastArgs(js_multiFilter, 5, 127, 3, 1);
const js_romance = bindLastArgs(js_multiFilter, 8, 127, 3, 2);
const js_hippo = bindLastArgs(js_multiFilter, 2, 80, 3, 2); 
const js_longhorn = bindLastArgs(js_multiFilter, 2, 27, 3, 2);
const js_underground = bindLastArgs(js_multiFilter, 8, 127, 1, 4); 
const js_rooster = bindLastArgs(js_multiFilter, 8, 60, 1, 4); 
const js_mist = bindLastArgs(js_multiFilter, 1, 127, 1, 1); 
const js_tingle = bindLastArgs(js_multiFilter, 1, 124, 4, 3);
const js_bacteria = bindLastArgs(js_multiFilter, 4, 0, 2, 4);
const js_hulk = bindLastArgs(js_multiFilter, 2, 10, 2, 4);
const js_ghost = bindLastArgs(js_multiFilter, 1, 5, 2, 4);  
const js_twisted = bindLastArgs(js_multiFilter, 1, 40, 2, 3);
const js_security = bindLastArgs(js_multiFilter, 1, 120, 1, 0);
function js_convFilter(data, width, height, kernel, divisor, bias=0, count=1) {
  const w = kernel[0].length;
  const h = kernel.length;
  const half = Math.floor(h / 2);
  for (let i = 0; i < count; i += 1) {
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const px = (y * width + x) * 4;  // pixel index
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < h; ++cy) {
          for (let cx = 0; cx < w; ++cx) {
            const cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4;
            r += data[cpx + 0] * kernel[cy][cx];
            g += data[cpx + 1] * kernel[cy][cx];
            b += data[cpx + 2] * kernel[cy][cx];
          }
        }

        data[px + 0] = (1 / divisor) * r + bias;
        data[px + 1] = (1 / divisor) * g + bias;
        data[px + 2] = (1 / divisor) * b + bias;
      }
    }
  }
  return data;
}
const js_blur = bindLastArgs(js_convFilter, [[1, 1, 1], [1, 1, 1], [1, 1, 1]],9,0,3)
const js_sharpen = bindLastArgs(js_convFilter,[[0, -1, 0], [-1, 5, -1], [0, -1, 0]],2)
const js_strongSharpen = bindLastArgs(js_convFilter,[[-1, -1, -1], [-1,  8, -1], [-1, -1, -1]],1)
const js_clarity = bindLastArgs(js_convFilter, [[1, -1, -1], [-1,  8, -1], [-1, -1, 1]], 3);
const js_goodMorning = bindLastArgs(js_convFilter, [[-1, -1, 1], [-1,  14, -1], [1, -1, -1]], 3);
const js_acid = bindLastArgs(js_convFilter, [[4, -1, -1], [-1,  4, -1], [0, -1, 4]], 3);
const js_dewdrops = bindLastArgs(js_convFilter, [[0, 0, -1], [-1,  12, -1], [0, -1, -1]], 2);
const js_destruction = bindLastArgs(js_convFilter, [[-1, -1, 4], [-1,  9, -1], [0, -1, 0]], 2);
function js_sobelFilter(data, width, height, invert=false) {
  const out = [];
  let wid = width;
  let hei = height;
  var grayData = new Int32Array(wid * hei);

        function getPixel(x, y) {
            if (x < 0 || y < 0) return 0;
            if (x >= (wid) || y >= (hei)) return 0;
            return (grayData[((wid * y) + x)]);
        }
        //Grayscale
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var goffset = ((wid * y) + x) << 2; //multiply by 4
                var r = data[goffset];
                var g = data[goffset + 1];
                var b = data[goffset + 2];
                var avg = (r >> 2) + (g >> 1) + (b >> 3);
                grayData[((wid * y) + x)] = avg;
                var doffset = ((wid * y) + x) << 2;
                data[doffset] = avg;
                data[doffset + 1] = avg;
                data[doffset + 2] = avg;
                data[doffset + 3] = 255;
            }
        }
        //Sobel
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {

                var newX;
                var newY;
                if ((x >= width - 1) || (y >= height - 1)) {
                    newX = 0;
                    newY = 0;
                } else {
                    //sobel Filter use surrounding pixels and matrix multiply by sobel       
                    newX = (
                        (-1 * getPixel(x - 1, y - 1)) +
                        (getPixel(x + 1, y - 1)) +
                        (-1 * (getPixel(x - 1, y) << 1)) +
                        (getPixel(x + 1, y) << 1) +
                        (-1 * getPixel(x - 1, y + 1)) +
                        (getPixel(x + 1, y + 1))
                    );
                    newY = (
                        (-1 * getPixel(x - 1, y - 1)) +
                        (-1 * (getPixel(x, y - 1) << 1)) +
                        (-1 * getPixel(x + 1, y - 1)) +
                        (getPixel(x - 1, y + 1)) +
                        (getPixel(x, y + 1) << 1) +
                        (getPixel(x + 1, y + 1))
                    );
                    var mag = Math.floor(Math.sqrt((newX * newX) + (newY * newY)) >>> 0);
                    if (mag > 255) mag = 255;
                    if (invert) mag = 255 - mag;
                    data[((wid * y) + x) * 4] = mag;
                    data[((wid * y) + x) * 4 + 1] = mag;
                    data[((wid * y) + x) * 4 + 2] = mag;
                    data[((wid * y) + x) * 4 + 3] = 255;
                }
            }
        }
    return data; //sobelData;
}
