var should = require('should');
var ed2k = require('../index.js');

describe('Ed2kLink', function () {
  //example ed2k links
  var urlShort = 'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/';
  var urlWithAICH = 'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|h=MYVDX3FYUY22RWXHZZ5WK45PHZIPPEKI|/';
  var urlWithHashset = 'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|p=FEDCBA98765432100123456789ABCDEF:0123456789ABCDEFFEDCBA9876543210|/';
  var urlWithUrlSources = 'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|s=http://foo.bar/foo.bar|s=http://foobar.foo/bar.foo|/';
  var urlWithClientSources = 'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/|sources,foo.bar:4662,boobar.foo:4711,1.2.3.4:5|/';
  
  var invaildEd2kLinks = [
    'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF/', //unfixed suffix
    'http://foobar.foo/bar.foo', //http url
    'ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEG|/', //ed2k hash must be hex
    'ed2k://|file|foo.bar|123f|0123456789ABCDEF0123456789ABCDEF|/', //file length must be integer
    'ed2k://|file|foo.bar|123.5|0123456789ABCDEF0123456789ABCDEF|/', //file length must be integer
  ];
  
  invaildEd2kLinks.forEach(function(v,i,a){
    it('should throw Error when parse:' + v, function(){
      (function(){ed2k.parse(v);}).should.throw(Error);
    });
  });
  
  describe('should parse/generate', function () {
    
    it('ed2k shortest link correctly', function () {
      var link = ed2k.parse(urlShort);
      link.filename.should.be.exactly('foo.bar');
      link.ed2k.should.be.exactly('0123456789ABCDEF0123456789ABCDEF');
      link.length.should.be.exactly(123);
      link.toString().should.be.exactly(urlShort);
      link.toString({hashset: true}).should.be.exactly(urlShort);
    });
    
    it('ed2k link with AICH Hash correctly', function () {
      var link = ed2k.parse(urlWithAICH);
      link.aich.should.be.exactly('MYVDX3FYUY22RWXHZZ5WK45PHZIPPEKI');
      link.toString().should.be.exactly(urlWithAICH);
    });
    
    it('ed2k link with url sources correctly', function () {
      var link = ed2k.parse(urlWithUrlSources);
      link.sources.url.should.be.eql(['http://foo.bar/foo.bar', 'http://foobar.foo/bar.foo']);
      link.toString().should.be.exactly(urlWithUrlSources);
    });
    
    it('ed2k link with client sources correctly', function (){
      var link = ed2k.parse(urlWithClientSources);
      link.sources.client.should.be.eql(['foo.bar:4662','boobar.foo:4711','1.2.3.4:5']);
      link.toString().should.be.exactly(urlWithClientSources);
    });
    
  });

  describe('Hashset', function () {
    var link = ed2k.parse(urlWithHashset);
    it('should parse ed2k link with Hashset correctly', function () {
      link.hashset.should.be.eql(['FEDCBA98765432100123456789ABCDEF', '0123456789ABCDEFFEDCBA9876543210']);
    });
    it('should convert ed2k link without hashset when option is undefined or option.hashset is false', function () {
      link.toString({ hashset: false }).should.be.equal(urlShort);
      link.toString().should.be.equal(urlShort);
    });
    it('should convert ed2k link without hashset when option.hashset is true', function () {
      link.toString({ hashset: true }).should.be.equal(urlWithHashset);
    });
  });

});