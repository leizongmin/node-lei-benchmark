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

Task.prototype.timeout = function (ms) {
  this._debug('set timeout: %sms', ms);
  this._timeout = ms;
  return this;
};

Task.prototype.request = function (doRequest) {
  this._debug('set request function: %s', doRequest);
  this._doRequest= doRequest;
  return this;
};

Task.prototype.progress = function (updateProgress) {
  this._debug('set update progress function: %s', updateProgress);
  this._updateProgress = updateProgress;
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

  var hasCallback = false;
  function oneCallback (err) {
    if (hasCallback) return;
    hasCallback = true;
    me._addResult(req.id, req.result(), err);
    if (me._updateProgress) me._updateProgress(me._getProgress(), me);
    callback();
  }

  if (me._timeout > 0) {
    var tid = setTimeout(function () {
      oneCallback(newTimeoutError());
    }, me._timeout);
  }

  var req = new Request(id + '-' + n);
  req.onEnd(oneCallback);
  me._doRequest(req, me);
};

Task.prototype._addResult = function (id, data, err) {
  this._debug('add result: %s = %s', id, data);
  this._results.push({
    id: id,
    data: data,
    error: err
  });
};

Task.prototype._getProgress = function () {
  var info = {
    finish: this._results.length,
    total: this._requestNum,
    percent: this._results.length / this._requestNum * 100
  };
  return info;
};

Task.prototype.result = function () {
  var listTotal = this._results.filter(function (item) {
    return !item.error;
  }).map(function (item) {
    return item.data.total;
  });

  var avg = getAvgMaxMin(listTotal);

  var error = 0;
  this._results.forEach(function (item) {
    if (item.error) error++;
  });

  return {
    spent: Date.now() - this._timestamp.start,
    error: error,
    list: this._results.slice(),
    avg: avg.avg,
    max: avg.max,
    min: avg.min,
    more: [
      {percent: 95, max: getPercentageMax(listTotal, 95)},
      {percent: 90, max: getPercentageMax(listTotal, 90)},
      {percent: 85, max: getPercentageMax(listTotal, 85)},
      {percent: 80, max: getPercentageMax(listTotal, 80)},
      {percent: 70, max: getPercentageMax(listTotal, 50)},
      {percent: 60, max: getPercentageMax(listTotal, 60)},
      {percent: 50, max: getPercentageMax(listTotal, 50)}
    ]
  };
};



// 划分任务
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

// 计算平均值，最大值，最小值
function getAvgMaxMin (arr) {
  if (arr.length < 1) return {avg: 0, max: 0, min: 0};
  var sum = 0;
  var max = arr[0];
  var min = arr[0];
  for (var i in arr) {
    var v = arr[i];
    sum += v;
    if (v > max)
      max = v;
    else if (v < min)
      min = v;
  }
  return {avg: sum / arr.length, max: max, min: min}
}

// 指定百分比的最大值是多少
function getPercentageMax (arr, per) {
  if (arr.length < 1) return 0;
  var arr = arr.sort();
  var i = Math.round((arr.length / 100) * per);
  if (i < 0)
    i = 0;
  else if (i >= arr.length)
    i = arr.length - 1;
  return arr[i];
}

// 超时出错
function newTimeoutError () {
  var err = new Error('timeout');
  err.code = 'REQUEST_TIMEOUT';
  return err;
}


module.exports = exports = Task;
