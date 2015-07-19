# ed2k-link

A simple module to parse/generate ed2k link for nodejs.   
[![NPM](https://nodei.co/npm/ed2k-link.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/ed2k-link)

## Installation
You can use this command to install:

    npm install ed2k-link

## Usage
You should require the module first:
```JavaScript
ed2k = require('ed2k-link');
```

## Example

#### Parse a ed2k url

Code:
```JavaScript
ed2k.parse("ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/");
```
Output:
```Javascript
{ filename: 'foo.bar',
  ed2k: '0123456789ABCDEF0123456789ABCDEF',
  aich: '',
  hashset: [],
  sources: { client: [], url: [] },
  length: 123 }
```

#### Convert `Ed2kLink` to ed2k url string

Code:
```JavaScript
var link = ed2k.parse("ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/");
link.toString();
```
Output:
```JavaScript
ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/
```

#### Generate `Ed2kLink` from file:

Code:

```JavaScript
//node-like callback
ed2k.generate("./foo.bar", function(err, link) {
  console.log(link);
});
//Promise
ed2k.generate("./foo.bar").then(function(link) {
  console.log(link);
});
```
Output:
```Javascript
{ filename: 'foo.bar',
  ed2k: '0123456789ABCDEF0123456789ABCDEF',
  aich: '',
  hashset: [],
  sources: { client: [], url: [] },
  length: 123 }
```


## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
Author: lightpacerabbit@gmail.com