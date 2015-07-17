var should = require('should');
var shouldtest_promised = require('should-promised');
var fs = require('fs');
var ed2k = require('../index.js');

function fib(count) {
  var a = 0, b = 1, c;
  var buf = new Buffer(count * 4);
  if (count > 0) {
    buf.writeUInt32LE(a, 0);
  }
  if (count > 1) {
    buf.writeUInt32LE(b, 4);
  }
  for (var i = 2; i < count; i++) {
    c = (a + b) % 0xFFFFFFFF;
    a = b;
    b = c;
    buf.writeUInt32LE(c, i * 4);
  }
  return buf;
}

describe('Ed2kLinkHash', function () {
  describe('Generating Test Data', function () {
    it('less than 9500kB(4500kB)', function () {
      fs.writeFileSync("test/_test0.dat", fib(4500 * 1024 / 4));
    });
    it('equal with 9500kB(9500kB)', function () {
      fs.writeFileSync("test/_test1.dat", fib(9500 * 1024 / 4));
    });
    it('lager than 9500kB(10000kB)', function () {
      fs.writeFileSync("test/_test2.dat", fib(10000 * 1024 / 4));
    });
  });
  describe('Hashing Test Data with promise', function () {
    it('less than 9500kB(4500kB)', function () {
      return ed2k.generate("test/_test0.dat").then(function (link) {
        link.ed2k.should.exactly('179F75D2B2CDF4C21659075C8271DF98');
      });
    });
    it('equal with 9500kB(9500kB)', function () {
      return ed2k.generate("test/_test1.dat").then(function (link) {
        link.ed2k.should.exactly('87591CA83DD2FB4C501E0E45B07DF076');
        link.hashset.should.eql(['F0C83F83598A894C8B97EBEB8A3DBCEA', '31D6CFE0D16AE931B73C59D7E0C089C0']);
      });
    });
    it('lager than 9500kB(10000kB)', function () {
      return ed2k.generate("test/_test2.dat").then(function (link) {
        link.ed2k.should.exactly('AF3553D9D30035341F367BF055E417C8');
        link.hashset.should.eql(['F0C83F83598A894C8B97EBEB8A3DBCEA', '6645C854C25F37FB457A9DEFE3E81671']);
      });
    });
    it('should throw error when hashing a unexisted file', function(){
      ed2k.generate("test/_unexisted.dat").should.be.rejected();
    });
  });
  describe('Hashing Test Data with node-like callback', function () {
    it('should get correct file name', function (done) {
      ed2k.generate("test/_test0.dat", function (err, link) {
        should(err).not.be.ok();
        link.filename.should.exactly("_test0.dat");
        done();
      });
    });
    it('should throw error when hashing a unexisted file', function (done) {
      ed2k.generate("test/_unexisted.dat",function(err, link){
        err.should.instanceOf(Error);
        should(link).not.be.ok();
        done();
      });
    });
  });
  describe('Test Data in memory', function () {
    it('should correct with 10000kB data in a update', function () {
      var hash = new ed2k.Ed2kLinkHash();
      hash.update(fib(10000 * 1024 / 4));
      var link = hash.digest();
      link.ed2k.should.exactly('AF3553D9D30035341F367BF055E417C8');
      link.hashset.should.eql(['F0C83F83598A894C8B97EBEB8A3DBCEA', '6645C854C25F37FB457A9DEFE3E81671']);
    });
  });
  after(function(){
    //clean test data
    fs.unlinkSync("test/_test0.dat");
    fs.unlinkSync("test/_test1.dat");
    fs.unlinkSync("test/_test2.dat");
  });
});