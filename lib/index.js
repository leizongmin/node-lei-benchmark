/**
 * lei-benchmark
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

var Task = require('./task');
var Request = require('./request');


function createTask () {
  return new Task();
}

module.exports = exports = createTask;


exports.create = createTask;
exports.Task = Task;
exports.Request = Request;

exports.thread = function (n) {
  return createTask().thread(n);
};

exports.num = function (n) {
  return createTask().num(n);
};

exports.request = function (fn) {
  return createTask().request(fn);
};

exports.start = function (cb) {
  return createTask().start(cb);
};
