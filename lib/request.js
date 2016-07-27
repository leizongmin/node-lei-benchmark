'use strict';

/**
 * lei-benchmark Request
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const utils = require('./utils');

class Request {

  constructor(id) {
    this.id = id;
    this._debug = utils.debug('request:' + id);
    this._timestamps = [];
    this._debug('created');
    this.time('start');
  }

  time(name) {
    name = name || '';
    const data = {
      name: name,
      timestamp: Date.now(),
    };
    this._timestamps.push(data);
    this._debug('time: name=%s, timestamp=%s', data.name, data.timestamp);
  }

  end(err) {
    this.time('end');
    this._onEnd(err);
  }

  result() {
    const ret = {};
    for (let i = 1; i < this._timestamps.length; i++) {
      const item = this._timestamps[i];
      const prev = this._timestamps[i - 1];
      ret[item.name] = item.timestamp - prev.timestamp;
    }
    ret.total = utils.array.last(this._timestamps).timestamp - this._timestamps[0].timestamp;
    return ret;
  }

  onEnd(fn) {
    this._onEnd = fn;
  }

}


module.exports = exports = Request;
