![webDSP Logo](/images/webdsplogo.png)
<br>
## A client-side DSP library utilizing the power of WebAssembly (.wasm)

WebDSP is a collection of highly performant algorithms, which are designed to be building blocks for web applications that aim to operate on media data. The methods are written in C++ and compiled to WASM, and exposed as simple vanilla Javascript functions developers can run on the client side. <br>
<br>
WebAssembly is very young, and this is the first .wasm based library designed to be dropped in to existing production level JS code bases.  With that in mind, there was an explicit goal to optimize and simplify how JS developers can load and use .wasm functionality.  Just as important, was our goal to lay the groundwork for future open source WebAssembly module developers. 

### Demo & Starter Kit

Check out the [demo video editor](http://tiny.cc/webdsp) and [corresponding repo](https://github.com/shamadee/web-dsp-demo).<br>

To quickly start working with WebAssembly and to build your own modules, please see our started WebAssembly work environment you can npm install and launch [wasm-init](https://www.npmjs.com/package/wasm-init).

### Install

Clone this repo and drop only the 'lib' folder into your project. Simply load our library file in a script tag. You can also get the module via `npm install web-dsp`, which comes with a built-in npm executable (`get-dsp`), which will copy the lib folder into your project directory.
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
Note WebAssembly modules need to be loaded with an HTTP request (fetch). Chrome does not support local file access via HTTP, so the files must be loaded using a server. In Firefox, it is possible to load the module without a server as a plain HTML file. 
<br>
After loading, a WebAssembly method can be called with plain JS:
```javascript
//get image data from canvas
pixels = context.getImageData(0,0,width,height);
button.addEventListener('click', () => {
  pixels.data.set(webdsp.invert(pixels.data));
});
```

### Video and Image Filter Methods
These modular filters can execute on an array of RGBA pixel data: <br>
<br>
`webdsp.grayScale(pixelData)` <br>
`webdsp.brighten(pixelData)` <br>
`webdsp.invert(pixelData)` <br>
`webdsp.noise(pixelData)` <br>
`webdsp.sobelFilter(pixelData, width, height, invert=false)` <br>
`webdsp.convFilter(pixelData, width, height, kernel, divisor, bias=0, count=1)` <br>
`webdsp.multiFilter(pixelData, width, filterType, mag, multiplier, adjacentgit )` <br>

Filter templates: <br>

`webdsp.sunset(pixelData, width)` <br>
`webdsp.analogTV(pixelData, width)` <br>
`webdsp.emboss(pixelData, width)` <br>
`webdsp.blur(pixelData, width, height)` <br>
`webdsp.sharpen(pixelData, width, height))` <br>
`webdsp.strongSharpen(pixelData, width, height)` <br>
`webdsp.clarity(pixelData, width, height)` <br>
`webdsp.goodMorning(pixelData, width, height)` <br>
`webdsp.acid(pixelData, width, height)` <br>
`webdsp.urple(pixelData, width)` <br>
`webdsp.forest(pixelData, width)` <br>
`webdsp.romance(pixelData, width)` <br>
`webdsp.hippo(pixelData, width)` <br>
`webdsp.longhorn(pixelData, width)` <br>
`webdsp.underground(pixelData, width)` <br>
`webdsp.rooster(pixelData, width)` <br>
`webdsp.mist(pixelData, width)` <br>
`webdsp.tingle(pixelData, width)` <br>
`webdsp.bacteria(pixelData, width)` <br>
`webdsp.dewdrops(pixelData, width, height)` <br>
`webdsp.destruction(pixelData, width, height)` <br>
`webdsp.hulk(pixelData, width)` <br>
`webdsp.ghost(pixelData, width)` <br>
`webdsp.twisted(pixelData, width)` <br>
`webdsp.security(pixelData, width)` <br>

For production level environments, it's important to note that all available methods have JavaScript fallback functions that are automatically exported with the module so older browsers can still run your code. However, note that the more intensive convolution and edge detection filters will run very slowly or hang the browser completely without WebAssembly support. 

### TODO:

The following filter fallback implementations need to be properly matched with their C++ counterparts: underground, rooster, mist, kaleidoscope, bacteria, hulk edge, ghost, twisted. <br>
Cache .wasm module on client

### Collaborators: [Deep Pulusani](https://github.com/sdeep27), [Shahrod Khalkhali](https://github.com/shahrodkh), [Matthias Wagner](https://github.com/matzewagner) 

