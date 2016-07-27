'use strict';

/**
 * lei-benchmark
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const utils = module.exports = exports = require('lei-utils').extend();
const createDebug = require('debug');


utils.debug = function (name) {
  return createDebug('lei-benchmark:' + name);
};
