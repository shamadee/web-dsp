
## A client-side DSP library utilizing the power of WebAssembly (.wasm)

###Install
Drop the 'lib' folder in to your project & only load the JS  library in a script tag
```html
<script src = '/lib/webdsp.js' type = 'text/javascript'>
```

###Loading the WebAssembly Module
Use loadWASM() to fetch the WebAssembly module as a promise object.
Use jsFallback() in the catch block to handle browsers that don't support .wasm
```javascript
var wam = {};
loadWASM().then(module => {
  wam = module;
}).catch(err => {
  jsFallback();
}).then(() => {
  //things to execute on page load only after module is loaded
})
```

Now you can call a WebAssembly method with plain JS:
```javascript
pixels = context.getImageData(0,0,width,height);
button.addEventListener('click', () => {
  wam.invert(pixels);
})
```
###Video and Image Filter Methods
A number of video/image filters you can execute on an array of RGBA pixel data: <br>
wam.grayScale(data) <br>
wam.brighten(data) <br>
wam.invert(data) <br>
wam.noise(data) <br>
wam.edgeManip(data, filt, width) <br>
wam.sobelFilter(data, width, height) <br>
wam.convFilter(data. kernel, int, divisor, width, height)
