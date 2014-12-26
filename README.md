node-lei-benchmark
==================

基于Node.js的Benchmark工具

```JavaScript
var benchmark = require('lei-benchmark');

benchmark
  .trhead(2)
  .num(1000)
  .request(function (req) {
    setTimeout(function () {
      req.time('part1');
      setTimeout(function () {
        req.end();
      }, Math.random() * 1000);
    }, Math.random() * 1000);
  })
  .start(function (err, result) {
    if (err) throw err;
    console.log(result);
  });
```
