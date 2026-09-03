export function get(selector: string, node: Document | HTMLElement | null = document) {
  // node is explicitly nullable -- callers regularly pass the result of an
  // earlier get() straight through (e.g. setupMobileMenu(elHeader, elNav)),
  // and a simple header legitimately has no .js-header-nav to find. The
  // default param only covers an omitted/undefined argument, not an
  // explicitly-passed null, so without this guard a null node throws
  // "Cannot read properties of null (reading 'querySelector')" and, since
  // this runs during synchronous page-init, silently kills every script
  // still queued to run after it (confirmed: this stopped the lazy-load
  // image loader from ever running on a page whose header doesn't have
  // every optional element -- images were correctly referenced but never
  // appeared).
  return node ? node.querySelector(selector) : null;
}

export function getAll<K extends keyof HTMLElementTagNameMap | string>(
  selector: K,
  node: Document | HTMLElement | null = document,
) {
  type Result = K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K][] : HTMLElement[];
  if (!node) return [] as Result;
  return [...node.querySelectorAll(selector)] as Result;
}

export function getSiblings(element: Element) {
  const nodes = [...element.parentElement!.children];
  return nodes.filter((node) => node !== element);
}

export function createElement({
  type,
  props = {},
}: {
  type: keyof HTMLElementTagNameMap;
  props: Record<string, any>;
}) {
  const element = document.createElement(type);

  const isListener = (p: any): p is string => p.startsWith("on");
  const isAttribute = (p: any) => !isListener(p) && p !== "children";

  const { innerHTML, ...rest } = props;

  for (const p of Object.keys(rest)) {
    // @ts-expect-error TODO: types
    if (isAttribute(p)) element[p] = props[p];
    if (isListener(p))
      element.addEventListener(p.toLowerCase().slice(2), props[p], false);
  }

  if (innerHTML) element.insertAdjacentHTML("afterbegin", innerHTML);

  if (props.children)
    for (const childElement of props.children)
      renderElement(childElement, element);

  return element;
}

export function renderElement(
  elements:
    | { type: keyof HTMLElementTagNameMap; props: Record<string, any> }
    | { type: keyof HTMLElementTagNameMap; props: Record<string, any> }[],
  container: Element | DocumentFragment,
) {
  if (!Array.isArray(elements)) elements = [elements];
  container.append(...elements.map((el) => createElement(el)));
}
