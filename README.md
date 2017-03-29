
## A client-side DSP library utilizing the power of WebAssembly (.wasm)

webDSP is a collection of highly performant algorithms, which are designed to be building blocks for web applications that aim to operate on media data. The methods are written in C++ and compiled to WASM using Emscripten.<br>
Proper loading of the module accross different browsers is ensured by inserting a custom event listener into the WASM module (something that is currently lacking in WebAssembly).<br>
All available methods have JavaScript fallback functions, which are automatically exported with the module for environments that do not support WebAssembly.


### Install
Drop the 'lib' folder into your project and load the JS  library in a script tag
```html
<script src = '/lib/webdsp.js' type = 'text/javascript'>
```

### Loading the WebAssembly Module
Use loadWASM() to fetch the WebAssembly module as a promise object.
Use jsFallback() in the catch block to handle browsers that don't support .wasm
```javascript
var webdsp = {};
loadWASM().then(module => {
  webdsp = module;
  // things to execute on page load only after module is loaded
});
```
Note that since the WebAssembly module needs to be loaded with an http request (fetch) under the hood, the files need to come from a server, as Google Chrome does not support local file access via http from the client side. In Firefox, it is to load the module without a server.
<br>
<br>
After loading, a WebAssembly method can be called with plain JS:
```javascript
pixels = context.getImageData(0,0,width,height);
button.addEventListener('click', () => {
  webdsp.invert(pixels);
});
```

### Video and Image Filter Methods
These modular filters can execute on an array of RGBA pixel data: <br>
<br>
`webdsp.grayScale(data)` <br>
`webdsp.brighten(data)` <br>
`webdsp.invert(data)` <br>
`webdsp.noise(data)` <br>
`webdsp.sobelFilter(data, width, height, invert=false)` <br>
`webdsp.convFilter(pixelData, width, height, kernel, divisor, bias=0, count=1)` <br>
`webdsp.multiFilter(pixelData, width, filterType, mag, multiplier, adjacentgit )` <br>

Filter templates: <br>

`webdsp.sunset(pixels.data, width)` <br>
`webdsp.analogTV(pixels.data, width)` <br>
`webdsp.emboss(pixels.data, width)` <br>
`webdsp.blur(pixels.data, width, height)` <br>
`webdsp.sharpen(pixels.data, width, height))` <br>
`webdsp.strongSharpen(pixels.data, width, height)` <br>
`webdsp.clarity(pixels.data, width, height)` <br>
`webdsp.goodMorning(pixels.data, width, height)` <br>
`webdsp.acid(pixels.data, width, height)` <br>
`webdsp.urple(pixels.data, width)` <br>
`webdsp.forest(pixels.data, width)` <br>
`webdsp.romance(pixels.data, width)` <br>
`webdsp.hippo(pixels.data, width)` <br>
`webdsp.longhorn(pixels.data, width)` <br>
`webdsp.underground(pixels.data, width)` <br>
`webdsp.rooster(pixels.data, width)` <br>
`webdsp.mist(pixels.data, width)` <br>
`webdsp.tingle(pixels.data, width)` <br>
`webdsp.bacteria(pixels.data, width)` <br>
`webdsp.dewdrops(pixels.data, width, height)` <br>
`webdsp.destruction(pixels.data, width, height)` <br>
`webdsp.hulk(pixels.data, width)` <br>
`webdsp.ghost(pixels.data, width)` <br>
`webdsp.twisted(pixels.data, width)` <br>
`webdsp.security(pixels.data, width)` <br>

### TODO:

The following filter fallback implementations need to be properly matched with their C++ counterparts: <br>
underground, rooster, mist, kaleidoscope, bacteria, hulk edge, ghost, twisted
