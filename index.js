var fs = require('fs');
var path = require('path');
// var helpers = require('broccoli-kitchen-sink-helpers');
var Writer = require('broccoli-writer');

function Neuter(inputTree, options) {
  if (!(this instanceof Neuter)) return new Neuter(inputTree, options);

  this.inputTree = inputTree;
  this.options = options || {};
  this.cache = {};
};

Neuter.prototype = Object.create(Writer.prototype);
Neuter.prototype.constructor = Neuter;

Neuter.prototype.write = function (readTree, destDir) {
  var self = this;

  var tree;

  return tree = readTree(this.inputTree).then(function(srcDir) {
    var modulesAdded = {};
    var output = [];

    addModule(self.options.src.slice(0, -3));

    var outputSrc = output.map(function(obj) { return "(function() {\n" + obj.src + "\n})();"; }).join("\n");
    fs.writeFileSync(path.join(destDir, self.options.dest), outputSrc);

    function addModule (moduleName, sourceFile) {
      if (modulesAdded[moduleName]) { return; }

      var i;
      var modulePath = moduleName + '.js';
      var fullPath = srcDir + '/' + modulePath;

      try {
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
          // recursively call find again. Otherwise
          // push the code section onto the buffer.
          // apply the filepathTransform for matched files.
          var match = requireMatcher.exec(section);
          if (match) {
            addModule(match[1]);
          } else {
            output.push({filepath: fullPath, src: section});
          }
        });
      } catch (err) {
        // Bug: When a non-existent file is referenced, this is the referenced
        // file, not the parent
        err.file = modulePath;
        throw err;
      }
    }
  });
};

module.exports = Neuter;