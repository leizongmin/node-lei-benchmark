'use strict';

/**
 * lei-benchmark Task
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const async = require('async');
const utils = require('./utils');
const Request = require('./request');

let taskCounter = 0;

const TimeoutError = utils.customError('TimeoutError', {
  code: 'REQUEST_TIMEOUT',
});

class Task {

  constructor() {
    this.id = taskCounter++;
    this._debug = utils.debug('task:' + this.id);
    this._threadNum = 1;
    this._requestNum = 1000;
    this._doRequest = null;
    this._results = [];
    this._timestamp = {};
    this._timeout = 0;
    this._debug('created');
  }

  thread(num) {
    this._debug('set thread num: %s', num);
    this._threadNum = num;
    return this;
  }

  num(num) {
    this._debug('set request num: %s', num);
    this._requestNum = num;
    return this;
  }

  timeout(ms) {
    this._debug('set timeout: %sms', ms);
    this._timeout = ms;
    return this;
  }

  request(doRequest) {
    this._debug('set request function: %s', doRequest);
    this._doRequest = doRequest;
    return this;
  }

  progress(updateProgress) {
    this._debug('set update progress function: %s', updateProgress);
    this._updateProgress = updateProgress;
    return this;
  }

  start(callback) {

    const nums = divide(this._requestNum, this._threadNum);
    this._debug('start: threadNum=%s, requestNum=%s, parts=%s', this._threadNum, this._requestNum, nums);

    let id = 0;
    this._timestamp.start = Date.now();

    async.each(nums, (num, next) => {
      id++;
      this._startThread(id, num, next);
    }, err => {
      callback(err, this.result());
    });

    return this;
  }

  _startThread(id, num, callback) {
    this._debug('start thread #%s: num=%s', id, num);
    async.timesSeries(num, (n, next) => {
      this._startRequest(id, n, next);
    }, callback);
  }

  _startRequest(id, n, callback) {
    let hasCallback = false;
    let tid;

    const oneCallback = err => {
      if (hasCallback) return;
      hasCallback = true;
      clearTimeout(tid);
      this._addResult(req.id, req.result(), err);
      if (this._updateProgress) this._updateProgress(this._getProgress(), this);
      callback();
    };

    if (this._timeout > 0) {
      tid = setTimeout(function () {
        oneCallback(new TimeoutError('timeout'));
      }, this._timeout);
    }

    const req = new Request(id + '-' + n);
    req.onEnd(oneCallback);
    this._doRequest(req, this);
  }

  _addResult(id, data, err) {
    this._debug('add result: %s = %s', id, data);
    this._results.push({
      id: id,
      data: data,
      error: err,
    });
  }

  _getProgress() {
    return {
      finish: this._results.length,
      total: this._requestNum,
      percent: this._results.length / this._requestNum * 100,
    };
  }

  result() {
    const listTotal = this._results.filter(item => {
      return !item.error;
    }).map(item => {
      return item.data.total;
    });

    const avg = getAvgMaxMin(listTotal);

    let errorCounter = 0;
    this._results.forEach(item => {
      if (item.error) errorCounter++;
    });

    return {
      spent: Date.now() - this._timestamp.start,
      num: this._requestNum,
      error: errorCounter,
      list: this._results.slice(),
      avg: avg.avg,
      max: avg.max,
      min: avg.min,
    };
  }

}


// 划分任务
function divide(total, parts) {
  const ret = [];
  let num = Math.ceil(total / parts);
  while (total > num) {
    ret.push(num);
    total = total - num;
  }
  ret.push(total);
  return ret;
}

// 计算平均值，最大值，最小值
function getAvgMaxMin(arr) {
  if (arr.length < 1) return {avg: 0, max: 0, min: 0};
  let sum = 0;
  let max = arr[0];
  let min = arr[0];
  arr.forEach(v => {
    sum += v;
    if (v > max) {
      max = v;
    } else if (v < min) {
      min = v;
    }
  });
  return {avg: sum / arr.length, max: max, min: min}
}


module.exports = exports = Task;
