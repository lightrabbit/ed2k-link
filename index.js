var util = require('util');
var stream = require('stream');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var Transform = stream.Transform;

function Ed2kLink() {
  this.filename = "";
  this.ed2k = "";
  this.aich = "";
  this.hashset = [];
  this.sources = {
    client: [],
    url: []
  };
  this.length = 0;
}

Ed2kLink.prototype.toString = function (options) {
  if (!options) {
    options = {};
  }

  var url = 'ed2k://|file|' + encodeURIComponent(this.filename) + '|' + this.length + '|' + this.ed2k.toString('hex') + '|';

  if (options.hashset && this.hashset.length > 0) {
    url += 'p=' + this.hashset.join(':') + '|';
  }

  if (this.aich) {
    url += 'h=' + this.aich + '|';
  }

  if (this.sources.url.length > 0) {
    this.sources.url.forEach(function (v, i, a) {
      url += 's=' + v + '|';
    });
  }

  url += '/';

  if (this.sources.client.length > 0) {
    url += '|sources,' + this.sources.client.join(',') + '|/';
  }

  return url;
};

function parseEd2kLink(url) {
  var match = /^ed2k:\/\/\|file\|(.*?)\|\/(?:\|(.*)\|\/|)$/.exec(url);
  if (!match || match.length !== 3)
    throw new Error('url:' + url + ' is not a ed2k link');

  var link = new Ed2kLink();
  //parse base parts
  var baseParts = match[1].split('|');
  link.filename = decodeURIComponent(baseParts[0]);
  
  if (!baseParts[1].match(/^\d+$/))
    throw new Error('ed2kLink.length must be integer');
  link.length = parseInt(baseParts[1]);
  
  if (!baseParts[2].match(/^[0-9A-F]{32}$/))
    throw new Error('ed2k hash must be hex string with 32 length');
  link.ed2k = baseParts[2];

  for (var i = 3; i < baseParts.length; i++) {
    var part = baseParts[i];
    switch (part.substr(0, 2)) {
      //hashset
      case 'p=':
        link.hashset = part.substr(2).split(':');
        break;
      //source.url
      case 's=':
        link.sources.url.push(part.substr(2));
        break;
      //aich hash
      case 'h=':
        link.aich = part.substr(2);
        break;
    }
  }

  //parse extend part
  var extParts = match[2];
  if (extParts) {
    extParts = extParts.split(',');
    for (var i = 1; i < extParts.length; i++) {
      link.sources.client.push(extParts[i]);
    }
  }

  return link;
}

var HASH_PART_BYTES = 9500 * 1024;

util.inherits(Ed2kLinkHash, Transform);
function Ed2kLinkHash(options) {
  Transform.call(this, options);

  this.link = new Ed2kLink();
  this._hasher = crypto.createHash('md4');

  this._totalRead = 0;
  this._partRead = 0;
}

Ed2kLinkHash.prototype.processEd2k = function (data, input_encoding) {
  if (this._partRead + data.length < HASH_PART_BYTES) {
    this._hasher.update(data, input_encoding);
    this._partRead += data.length;
  } else {
    var leftBytes = HASH_PART_BYTES - this._partRead;
    this._hasher.update(data.slice(0, leftBytes), input_encoding);
    this.link.hashset.push(this._hasher.digest('hex').toUpperCase());

    this._hasher = crypto.createHash('md4');
    this._partRead = 0;
    return data.slice(leftBytes);
  }
};

Ed2kLinkHash.prototype.update = function (data, input_encoding) {
  this.link.length += data.length;
  var ed2kData = data;

  while (ed2kData)
    ed2kData = this.processEd2k(ed2kData, input_encoding);
};

Ed2kLinkHash.prototype.digest = function (encoding) {

  this.link.hashset.push(this._hasher.digest('hex').toUpperCase());

  if (this.link.hashset.length > 1) {
    var ed2kHash = crypto.createHash('md4');
    for (var i = 0; i < this.link.hashset.length; i++) {
      ed2kHash.update(this.link.hashset[i], 'hex');
    }
    this.link.ed2k = ed2kHash.digest('hex').toUpperCase();
  } else {
    this.link.ed2k = this.link.hashset.pop();
  }
  
  return this.link;
};

Ed2kLinkHash.prototype._transform = function (chunk, encoding, callback) {
  this.update(chunk, encoding);
  callback();
};

Ed2kLinkHash.prototype._flush = function (callback) {
  this.digest();
  callback();
};

function generate(filename, callback) {
  var hash = new Ed2kLinkHash();
  var input = fs.createReadStream(filename);
  input.pipe(hash);
  hash.link.filename = path.basename(filename);
  
  if (callback instanceof Function) {
    //support for node-like callback
    input.on('error', function (err) {
      callback(err);
    });
    hash.on('finish', function () {
      callback(null, hash.link);
    });
  } else if (Promise instanceof Function) {
    //support for promise or cocurrent
    return new Promise(function (resolve, reject) {
      input.on('error', function (err) {
        reject(err);
      });
      hash.on('finish', function () {
        resolve(hash.link);
      });
    });
  }
}



module.exports = {
  Ed2kLinkHash: Ed2kLinkHash,
  Ed2kLink: Ed2kLink,
  generate: generate,
  parse: parseEd2kLink
};