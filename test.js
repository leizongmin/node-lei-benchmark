var benchmark = require('./');

benchmark
  .thread(10)
  .num(10)
  .request(function (req) {
    setTimeout(function () {
      req.time('part1');
      setTimeout(function () {
        req.end();
      }, Math.random() * 500);
    }, Math.random() * 500);
  })
  .start(function (err, result) {
    if (err) throw err;
    console.log(result, result.list[0]);
  });
