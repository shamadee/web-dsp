const expect = require('chai').expect;
const assert = require('assert');
const Browser = require('zombie');

Browser.localhost('example.com', 3000);

describe('Should get to the page and', function () {
  let app, browser;
  before(function() {
    app = require('./../server');
    browser = new Browser();
    return browser.visit('/');
  });
  it('should have a title element with text "WASM Example"', function () {
    browser.assert.text('title', 'WASM Example');
  });
  it('should have the loadWASM function', function () {
    assert(browser.window.document._global.loadWASM);
  });
});
