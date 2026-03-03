export const throttle = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
) => {
  let inThrottle: boolean,
    lastFn: ReturnType<typeof setTimeout>,
    lastTime: number;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (inThrottle) {
      clearTimeout(lastFn);
      lastFn = setTimeout(
        () => {
          if (Date.now() - lastTime >= wait) {
            fn.apply(this, args);
            lastTime = Date.now();
          }
        },
        Math.max(wait - (Date.now() - lastTime), 0),
      );
    } else {
      fn.apply(this, args);
      lastTime = Date.now();
      inThrottle = true;
    }
  };
};
