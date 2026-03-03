export function attachEvent(
  event: keyof WindowEventMap,
  node: Window | Document | HTMLElement = window,
  listener: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | undefined,
) {
  node.addEventListener(event, listener, options);
  return () => {
    node.removeEventListener(event, listener, options);
  };
}
