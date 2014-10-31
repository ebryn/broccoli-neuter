var fs = require('fs');
var path = require('path');
// var helpers = require('broccoli-kitchen-sink-helpers');
var Writer = require('broccoli-writer');

function Neuter(inputTree, options) {
  if (!(this instanceof Neuter)) return new Neuter(inputTree, options);

  this.inputTree = inputTree;
  this.options = options || {};
};

Neuter.prototype = Object.create(Writer.prototype);
Neuter.prototype.constructor = Neuter;

Neuter.prototype.write = function (readTree, destDir) {
  var self = this;

  return readTree(this.inputTree).then(function(srcDir) {
    var modulesAdded = {};
    var output = [];

    // 1. Starting from the src file, recursively build up output array
    addModule(self.options.src.slice(0, -3));

    // 2. Iterate over the output array and concatenate into a big string
    var outputSrc = output.map(function(obj) {
      return "(function() {\n\n" + obj.src + "\n\n})();";
    }).join("\n\n");

    // 3. Write the big ol' concatenated string to the dest file
    fs.writeFileSync(path.join(destDir, self.options.dest), outputSrc);

    function addModule (moduleName, sourceFile) {
      if (modulesAdded[moduleName]) { return; }

      var modulePath = moduleName + '.js';
      var fullPath = srcDir + '/' + modulePath;

      var src = fs.readFileSync(fullPath).toString();
      modulesAdded[moduleName] = true;

      // matches `require('some/path/file');` statements.
      // no need to include a .js as this will be appended for you.
      var requireSplitter = /^\s*(require\(\s*[\'||\"].*[\'||\"]\s*\));*\n*/m;
      var requireMatcher = /^require\(\s*[\'||\"](.*?)(?:\.js)?[\'||\"]\s*\)/m;

      var sections = src.split(requireSplitter);

      // loop through sections appending to out buffer.
      sections.forEach(function(section){
        if (!section.length) { return; }

        // if the section is a require statement
        // recursively call addModule again. Otherwise
        // push the code section onto the buffer.
        var match = requireMatcher.exec(section);
        if (match) {
          addModule(match[1]);
        } else {
          output.push({filepath: fullPath, src: section});
        }
      });
    }
  });
};

module.exports = Neuter;