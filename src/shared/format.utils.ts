export const toCurrency = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

export const toPercent = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
};
