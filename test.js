'use strict';

const benchmark = require('./');

const options = {
  thread: 10,
  num: 100,
  timeout: 400,
};

/**
 * 四舍五入
 *
 * @param {Number} num 值
 * @param {Number} n   小数点位数
 * @returns {Number}
 */
function fixed(num, n) {
  n = n || 0;
  return Number(Number(num).toFixed(n));
}

let lastPercent = '';
benchmark
  // 设置并发数量
  .thread(options.thread)
  // 设置总测试次数
  .num(options.num)
  // 设置每次测试的超时时间,ms
  .timeout(options.timeout)
  // 请求任务处理函数
  .request(req => {

    // TODO: 此处可以为任何异步任务
    setTimeout(() => {
      req.time('part1');
      setTimeout(() => {
        req.end(Date.now() % 3 === 0 ? new Error('just for test') : null);
      }, Math.random() * 500);
    }, Math.random() * 500);

  })
  // 进度通知处理函数
  .progress((info, task) => {

    // TODO: 显示当前进度
    const percent = fixed(info.percent, 0);
    if (percent === lastPercent) return;
    lastPercent = percent;
    console.log('进度: %s%%, (%s/%s)', lastPercent, info.finish, info.total);

  })
  .start(function (err, result) {

    // TODO: 显示结果
    if (err) throw err;

    console.log('======================================================');
    console.log('共请求%s次（%s并发）, 其中失败%s次, 共耗时%sms', result.num, options.thread, result.error, fixed(result.spent));
    console.log('----------------');
    const perSpent = result.spent / result.num;
    console.log('处理速率:\t%s次/秒, %s次/分钟', fixed(1000 / perSpent, 1), fixed(60000 / perSpent, 1));
    console.log('单个请求耗时:\t平均%sms, 最大%sms, 最小%sms', fixed(result.avg), fixed(result.max), fixed(result.min));
    console.log('----------------');

  });
