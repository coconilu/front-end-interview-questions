/**
 * 埃拉托斯特尼筛法（Sieve of Eratosthenes）
 * 高效找出指定范围内的所有素数
 *
 * 时间复杂度：O(n log log n)
 * 空间复杂度：O(n)
 *
 * @param {number} n 查找小于等于n的所有素数
 * @returns {Array} 素数列表
 */
function sieveOfEratosthenes(n) {
  // 创建一个布尔数组，初始假设所有数都是素数
  const isPrime = new Array(n + 1).fill(true);

  // 0和1不是素数
  isPrime[0] = isPrime[1] = false;

  // 从2开始，对于每个素数，将其倍数标记为非素数
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      // 从i*i开始标记，因为更小的倍数已经被标记过了
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
      }
    }
  }

  // 收集所有素数
  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) {
      primes.push(i);
    }
  }

  return primes;
}

/**
 * 线性筛法（更高效的素数筛法）
 * 时间复杂度：O(n)
 * 空间复杂度：O(n)
 *
 * @param {number} n 查找小于等于n的所有素数
 * @returns {Array} 素数列表
 */
function linearSieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  const primes = [];

  isPrime[0] = isPrime[1] = false;

  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) {
      primes.push(i);
    }

    // 对于每个已知素数，标记其与当前数i的乘积为非素数
    for (let j = 0; j < primes.length && i * primes[j] <= n; j++) {
      isPrime[i * primes[j]] = false;

      // 如果i能被当前素数整除，则退出循环
      // 这确保每个合数只被其最小质因数筛掉一次
      if (i % primes[j] === 0) {
        break;
      }
    }
  }

  return primes;
}

/**
 * 判断一个数是否为素数
 * @param {number} num
 * @returns {boolean}
 */
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  // 所有素数都可以表示为 6k ± 1 的形式，其中 k 是大于等于1的整数
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) {
      return false;
    }
  }

  return true;
}

// 测试
console.log('小于等于100的素数:');
console.log(sieveOfEratosthenes(100));

console.log('线性筛法 - 小于等于100的素数:');
console.log(linearSieve(100));

console.log('23是素数:', isPrime(23)); // true
console.log('25是素数:', isPrime(25)); // false

// 性能比较
const n = 1000000;
console.time('埃拉托斯特尼筛法');
const count1 = sieveOfEratosthenes(n).length;
console.timeEnd('埃拉托斯特尼筛法');

console.time('线性筛法');
const count2 = linearSieve(n).length;
console.timeEnd('线性筛法');

console.log(`小于等于${n}的素数个数: ${count1}`);

module.exports = {
  sieveOfEratosthenes,
  linearSieve,
  isPrime,
};
