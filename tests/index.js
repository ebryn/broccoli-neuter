'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('expect.js');
var broccoli = require('broccoli');

// require('mocha-jshint')();

var Neuter = require('..');

describe('broccoli-neuter', function(){
  var fixturePath = path.join(__dirname, 'fixtures');
  var builder;

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });

  it('works', function() {
    var inputPath = path.join(fixturePath, 'dir1');
    var tree = new Neuter(inputPath, {src: 'a.js', dest: 'output.js'});

    builder = new broccoli.Builder(tree);
    return builder.build()
      .then(function(results) {
        var outputPath = results.directory;
        var outputFiles = fs.readdirSync(outputPath);
        expect(outputFiles).to.eql(["output.js"]);

        var outputFileContents = fs.readFileSync(path.join(outputPath, "output.js"));
        var expectedOutputContents = fs.readFileSync(path.join(inputPath, "expected.js"));
        expect(outputFileContents.toString()).to.eql(expectedOutputContents.toString());
      });
  });
});
