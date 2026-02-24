export const calcDailyReturn = (close: number, previousClose?: number): number => {
  if (previousClose === undefined || previousClose <= 0) return 0;
  return ((close - previousClose) / previousClose) * 100;
};
