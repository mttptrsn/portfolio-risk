export function normalizeWeights(w: number[]) {
  const sum = w.reduce((a, b) => a + b, 0);
  if (sum <= 0) return w.map(() => 0);
  return w.map((x) => x / sum);
}

function matVec(A: number[][], x: number[]) {
  const n = A.length;
  const y = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < x.length; j++) s += (A[i][j] ?? 0) * x[j];
    y[i] = s;
  }
  return y;
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function computeRiskFromCov(cov: number[][], wRaw: number[], annFactor = 252) {
  const w = normalizeWeights(wRaw);
  const sigmaW = matVec(cov, w);
  const varP = dot(w, sigmaW);
  const sigmaP = Math.sqrt(Math.max(varP, 0));

  const mcr = sigmaP > 0 ? sigmaW.map((v) => v / sigmaP) : w.map(() => 0);
  const rc = w.map((wi, i) => wi * mcr[i]);

  const rcSum = rc.reduce((a, b) => a + b, 0);
  const riskShare = rcSum !== 0 ? rc.map((x) => x / rcSum) : w.map(() => 0);

  return { w, volAnn: sigmaP * Math.sqrt(annFactor), mcr, riskContrib: rc, riskShare };
}
