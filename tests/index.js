'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('expect.js');
var broccoli = require('broccoli');

// require('mocha-jshint')();

var Neuter = require('..');

describe('broccoli-neuter', function(){
  var fixtureRoot = path.join(__dirname, 'fixtures');
  var builder;

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });

  function runTestFixture(name) {
    it(name, function() {
      var fixturePath = path.join(fixtureRoot, name);
      var inputPath = path.join(fixturePath, 'input');
      var expectedOutput = fs.readFileSync(path.join(fixturePath, 'output', 'expected.js'));

      var tree = new Neuter(inputPath, {src: 'index.js', dest: 'output.js'});

      builder = new broccoli.Builder(tree);
      return builder.build()
        .then(function(results) {
          var outputPath = results.directory;
          var outputFiles = fs.readdirSync(outputPath);
          expect(outputFiles).to.eql(["output.js"]);

          var actualOutput = fs.readFileSync(path.join(outputPath, "output.js"));
          expect(actualOutput.toString()).to.eql(expectedOutput.toString());
        });
    });
  }

  runTestFixture("simple_require_statements");
  runTestFixture("duplicate_require_statements");
  runTestFixture("circular_require_statements");
  runTestFixture("respects_code_order_between_requires");
  runTestFixture("do_not_replace_requires_in_statements");
  runTestFixture("comment_out_require");
  runTestFixture("spaces_allowed_within_require_statement");
  runTestFixture("optional_semicolons");
  runTestFixture("optional_dotjs");
});
