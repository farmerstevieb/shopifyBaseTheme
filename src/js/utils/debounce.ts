export const debounce = <T extends (...args: never[]) => unknown>(
  fn: T,
  ms = 0,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};
