var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = require('fs'),
    readFile = Promise.promisify(fs.readFile),
    writeFile = Promise.promisify(fs.writeFile),
    path = require('path'),
    mkdirp = Promise.promisify(require('mkdirp')),
    Writer = require('broccoli-writer'),
    recursiveReaddir = Promise.promisify(require('recursive-readdir'));

module.exports = SvgConcatenator;

SvgConcatenator.prototype = Object.create(Writer.prototype);
SvgConcatenator.prototype.constructor = SvgConcatenator;

function SvgConcatenator(inputTree, options) {
    if (!(this instanceof SvgConcatenator)) {
        return new SvgConcatenator(inputTree, options);
    }

    options = _.defaults(options, {
        name: 'Svg'
    });

    _.extend(this, options);

    this.inputTree = inputTree;
}

SvgConcatenator.prototype.write = function(readTree, destDir) {
    var outputFile = path.join(destDir, this.outputFile),
        name = this.name,
        srcDir,
        svgFiles,
        svgContents = [];

    var minifyOptions = {
        collapseWhitespace: true,
        removeAttributeQuotes: true
    };

    return readTree(this.inputTree)
        .then(function(foundSrcDir) {
            srcDir = foundSrcDir;
        })
        .then(findSvgFiles)
        .then(readSvgFiles)
        .then(createDir)
        .then(saveSvgs.bind(null, outputFile));

    function findSvgFiles() {
        return recursiveReaddir(srcDir)
            .then(function(files) {
                svgFiles = files.filter(function(file) {
                    return path.extname(file) === '.svg';
                });
            });
    }

    function readSvgFiles() {
        return Promise.all(svgFiles.map(function(file) {
            var name = path.relative(srcDir, file).replace(/\.svg$/, '');
            //TODO: Use read file cache
            return readFile(file)
                .then(function(contents) {
                    svgContents.push({
                        name: name,
                        contents: contents.toString()
                    });
                });
        }));
    }

    function createDir() {
        return mkdirp(path.dirname(outputFile));
    }

    function saveSvgs() {
        var hash = svgContents
            .sort(function(a, b) {
                return a.name.localeCompare(b.name);
            })
            .reduce(function(hash, item) {
                hash[item.name] = item.contents;
                return hash;
            }, {});

        var contents = 'window.'+name+' = '+JSON.stringify(hash, null, '  ')+';';

        return writeFile(outputFile, contents);
    }
};
