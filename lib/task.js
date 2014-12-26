/**
 * lei-benchmark Task
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var async = require('async');
var utils = require('./utils');
var Request = require('./request');


function Task () {
  Task._taskCount++;
  this.id = Task._taskCount;
  this._debug = utils.debug('task:' + this.id);
  this._threadNum = 1;
  this._requestNum = 1000;
  this._doRequest = null;
  this._results = [];
  this._timestamp = {};
  this._debug('created');
}

Task._taskCount = 0;

Task.prototype.thread = function (num) {
  this._debug('set thread num: %s', num);
  this._threadNum = num;
  return this;
};

Task.prototype.num = function (num) {
  this._debug('set request num: %s', num);
  this._requestNum = num;
  return this;
};

Task.prototype.request = function (doRequest) {
  this._debug('set request function: %s', doRequest);
  this._doRequest= doRequest;
  return this;
};

Task.prototype.start = function (callback) {
  var me = this;
  var nums = divide(me._requestNum, me._threadNum);
  me._debug('start: threadNum=%s, requestNum=%s, parts=%s', me._threadNum, me._requestNum, nums);

  var id = 0;
  this._timestamp.start = Date.now();
  async.each(nums, function (num, next) {
    id++;
    me._startThread(id, num, next);
  }, function (err) {
    callback(err, me.result());
  });

  return this;
};

Task.prototype._startThread = function (id, num, callback) {
  var me = this;
  me._debug('start thread #%s: num=%s', id, num);

  async.timesSeries(num, function (n, next) {
    me._startRequest(id, n, next);
  }, callback);
};

Task.prototype._startRequest = function (id, n, callback) {
  var me = this;
  var req = new Request(id + '-' + n);
  req.onEnd(function () {
    me._addResult(req.id, req.result());
    callback();
  });
  me._doRequest(req);
};

Task.prototype._addResult = function (id, data) {
  this._debug('add result: %s = %s', id, data);
  this._results.push({
    id: id,
    data: data
  });
};

Task.prototype.result = function () {
  return {
    spent: Date.now() - this._timestamp.start,
    list: this._results.slice()
  };
};



function divide (total, parts) {
  var ret = [];
  var num = Math.ceil(total / parts);
  while (total > num) {
    ret.push(num);
    total = total - num;
  }
  ret.push(total);
  return ret;
}


module.exports = exports = Task;
