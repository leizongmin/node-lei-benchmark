/**
 * lei-benchmark Request
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var async = require('async');
var utils = require('./utils');


function Request (id) {
  this.id = id;
  this._debug = utils.debug('request:' + id);
  this._timestamps = [];
  this._debug('created');
  this.time('start');
}

Request.prototype.time = function (name) {
  name = name || '';
  var data = {
    name: name,
    timestamp: Date.now()
  };
  this._timestamps.push(data);
  this._debug('time: name=%s, timestamp=%s', data.name, data.timestamp);
};

Request.prototype.end = function () {
  this.time('end');
  this._onEnd();
};

Request.prototype.result = function () {
  return this._timestamps.slice();
};

Request.prototype.onEnd = function (fn) {
  this._onEnd = fn;
};


module.exports = exports = Request;
