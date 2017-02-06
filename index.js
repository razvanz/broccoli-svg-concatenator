const fs = require('fs')
const path = require('path')

const _ = require('lodash')
const Plugin = require('broccoli-plugin')
const Promise = require('bluebird')
const findFiles = Promise.promisify(require('glob'))
const mkdirp = Promise.promisify(require('mkdirp'))
const readFile = Promise.promisify(fs.readFile)
const writeFile = Promise.promisify(fs.writeFile)

function SvgConcatenator(inputNodes, options) {
    if (!(this instanceof SvgConcatenator))
        return new SvgConcatenator(inputNodes, options)

    options = _.defaults(options, SvgConcatenator.DEFAULTS)
    Plugin.call(this, [inputNodes], options)
    this.options = options
}

SvgConcatenator.prototype = Object.create(Plugin.prototype)
SvgConcatenator.prototype.constructor = SvgConcatenator

SvgConcatenator.prototype.build = function() {
  var name = this.options.name
  var inputPath = this.inputPaths[0]
  var outputPath = path.join(this.outputPath, this.options.outputFile)

  return findFiles(`${inputPath}/**/**.svg`)
      .then(readSvgFiles)
      .then(saveSvgs)

  function readSvgFiles(svgFiles) {
      return Promise.all(
          svgFiles.map(filePath => readFile(filePath)
              .then(contents => ({
                  name: filePath.substring(inputPath.length + 1).replace(/\.svg$/, ''),
                  contents,
              }))
      ))
  }

  function saveSvgs(files) {
    return mkdirp(path.dirname(outputPath))
        .then(() => {
            var hash = files.reduce((map, file) => {
                map[file.name] = file.contents
                return map
            }, {})

            return writeFile(
                outputPath,
                `window.${name} = ${JSON.stringify(hash, null, '  ')};`
            )
        })
  }
}

SvgConcatenator.DEFAULTS = {
    name: 'SvgConcat',
    annotation: true,
    needsCache: false,
    minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true
    }
}


module.exports = SvgConcatenator
