var peg = require("pegjs");

var getFilename = function(path) {
  var parts = path.split('/');
  var name = parts[parts.length - 1].split('.');

  return name.slice(0, name.length - 1).join('.');
}

var createPegjsPreprocessor = function (config, logger, helper) {
  var log = logger.create('preprocessor.pegjs');

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath);

    var parser;

    var defaultOptions = {
      output: 'source'
    };

    var options = helper.merge(defaultOptions, config.options);

    try {
      parser = peg.buildParser(content, options);
    } catch (e) {
      log.error('%s\n  at %s:%d', e.message, file.originalPath);
      return done(e, null);
    }

    var fileName = getFilename(file.path);

    var output;
    if (config.angular) {
      if(config.angular.module && config.angular.factory){
        output = 'angular.module(\'' + config.angular.module + '\', []).factory(\'' + config.angular.factory + '\', function () { return ' + parser + '});';
      }
      else {
        output = 'angular.module(\'' + config.angular.modulePrefix + '.' + fileName + '\', []).factory(\'' + fileName + '\', function () { return ' + parser + '});';
      }
    } else {
      output = (typeof config.exportVar === 'string' ? config.exportVar : 'module.exports') + ' = ' + parser + ';';
    }

    done(null, output);
  }
};

createPegjsPreprocessor.$inject = ['config.pegPreprocessor', 'logger', 'helper'];

module.exports = {
  'preprocessor:pegjs': ['factory', createPegjsPreprocessor]
};
