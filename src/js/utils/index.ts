export * as device from "./device";
export * as shopifyUtils from "./shopify";

export { attachEvent } from "./attach-event";
export { get, getAll, getSiblings, createElement } from "./element";

export { debounce } from "./debounce";
export { throttle } from "./throttle";
export { lock, release } from "./body-scroll-lock";

export const rIC =
  "requestIdleCallback" in window ?
    (fn: () => void, timeout = 2000) => requestIdleCallback(fn, { timeout })
  : setTimeout;

export * as bodyScrollLock from "./body-scroll-lock";
