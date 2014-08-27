broccoli-svg-concatenator
=========================

A Broccoli tree that concatenates all SVG files in a tree into a hash exported
on window.

This way you can include SVG graphics directly in your code and render it to the
DOM without extra network requests.


## Installation

```
npm install --save broccoli-svg-concatenator
```


## Usage

```javascript
var tree = concatSvg(inputTree, options);
```

Example:

```javascript
var concatSvg = require('broccoli-svg-concatenator');

var svg = concatSvg('public/assets/images', {
    outputFile: 'assets/svg.js',
    name: 'MySvg'
});
```

Will find all `.svg` files inside `public/assets/images` and save a file to
`assets/svg.js` like this:

```javascript
window.MySvg = {
    'icons/house': '...svg...',
    'shapes/circle': '...svg...'
};
```


### Options

- `outputFile` **required**: The file to write the SVG contents to.
- `name`: The name of the variable exposed on `window` containing all the SVG contents. Defaults to `Svg`.
