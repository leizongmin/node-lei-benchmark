'use strict';

const benchmark = require('./');

benchmark
  .thread(10)
  .num(100)
  .timeout(400)
  .request(function (req) {
    setTimeout(function () {
      req.time('part1');
      setTimeout(function () {
        req.end(Date.now() % 3 === 0 ? new Error('just for test') : null);
      }, Math.random() * 500);
    }, Math.random() * 500);
  })
  .start(function (err, result) {
    if (err) throw err;
    console.log(result, result.list[0]);
  });
