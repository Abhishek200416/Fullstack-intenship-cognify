// CPU-heavy toy task
export function heavyCompute(n = 200000) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += Math.sqrt(i) * Math.sin(i / 1000);
  }
  return sum;
}
