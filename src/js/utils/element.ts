export function get(selector: string, node: Document | HTMLElement = document) {
  return node.querySelector(selector);
}

export function getAll<K extends keyof HTMLElementTagNameMap | string>(
  selector: K,
  node: Document | HTMLElement = document,
) {
  return [...node.querySelectorAll(selector)] as K extends (
    keyof HTMLElementTagNameMap
  ) ?
    HTMLElementTagNameMap[K][]
  : HTMLElement[];
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
