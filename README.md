node-lei-benchmark
==================

基于Node.js的Benchmark工具

## 安装

```bash
$ npm i lei-benchmark --save
```

```javascript
var benchmark = require('lei-benchmark');

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
```


## License

```
The MIT License (MIT)

Copyright (c) 2014-2016 Zongmin Lei <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
