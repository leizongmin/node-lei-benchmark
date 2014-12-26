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

Request.prototype.end = function (err) {
  this.time('end');
  this._onEnd(err);
};

Request.prototype.result = function () {
  var ret = {};
  for (var i = 1; i < this._timestamps.length; i++) {
    var item = this._timestamps[i];
    var last = this._timestamps[i - 1];
    ret[item.name] = item.timestamp - last.timestamp;
  }
  ret.total = this._timestamps[this._timestamps.length - 1].timestamp - this._timestamps[0].timestamp;
  return ret;
};

Request.prototype.onEnd = function (fn) {
  this._onEnd = fn;
};


module.exports = exports = Request;
