/**
 * lei-benchmark
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var utils = module.exports = exports = require('lei-utils');
var createDebug = require('debug');


utils.debug = function (name) {
  return createDebug('lei-benchmark:' + name);
};

var debug = utils.debug('utils');

