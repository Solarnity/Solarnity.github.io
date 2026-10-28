export const MAX_LENGTH = 1_000_000_000;

export const getDivisors = (n) => {
  const small = [];
  const large = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      small.push(i);
      if (i !== n / i) large.push(n / i);
    }
  }
  return small.concat(large.reverse());
};

export const isPerfectSquare = (n) => {
  if (n < 0) return false;
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
};

export const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

export const computeCombos = (x, p) => {
  const remaining = x - p;
  if (remaining <= 0) return { remaining, combos: [] };

  const combos = [];
  for (const n of getDivisors(remaining)) {
    const r = remaining / n - p;
    if (r >= 1) combos.push({ n, r });
  }
  return { remaining, combos };
};

export const suggestLengths = (x, p, limit = 4, range = 40) => {
  const found = [];
  for (let k = 1; k <= range && found.length < limit * 2; k++) {
    for (const delta of [-k, k]) {
      const candidate = x + delta;
      if (candidate <= 2 * p || candidate > MAX_LENGTH) continue;
      const { combos } = computeCombos(candidate, p);
      if (combos.length >= 2) found.push({ x: candidate, delta, count: combos.length });
    }
  }
  return found.slice(0, limit);
};

export const pickBalanced = (combos) =>
  combos.reduce(
    (best, c) => (best === null || Math.abs(c.n - c.r) < Math.abs(best.n - best.r) ? c : best),
    null
  );