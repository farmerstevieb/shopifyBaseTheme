import { getAll } from "../../utils";

// Options
const lazyClass = "js-lazyload";

// Shorthands (saves more than a few bytes!)
const win = window;
const ric = "requestIdleCallback";
const io = "IntersectionObserver";
let intersectionListener: IntersectionObserver;

// App stuff
const crawler = /baidu|(?:google|bing|yandex|duckduck)bot/i.test(
  navigator.userAgent,
);
const dataAttrs = ["srcset", "src"];
const queryDOM = (selector?: string, root?: HTMLElement) =>
  getAll(selector || `img.${lazyClass},iframe.${lazyClass}`, root);

// This function handles lazy loading of elements.
const load = (element) => {
  const parentNode = element.parentNode;

  if (parentNode.nodeName == "PICTURE") {
    applyFn(queryDOM("source", parentNode), flipDataAttrs);
  }

  if (
    element.sizes === "auto" &&
    (element.clientWidth || parentNode.clientWidth) > 0
  ) {
    element.sizes = (element.clientWidth || parentNode.clientWidth) + "px";
  }

  flipDataAttrs(element);

  element.classList.remove(lazyClass);
};

// Added because there was a number of patterns like this peppered throughout
// the code. This flips necessary data- attrs on an element.
const flipDataAttrs = (element) => {
  for (const dataAttrIndex in dataAttrs) {
    if (dataAttrs[dataAttrIndex] in element.dataset) {
      element.setAttribute(
        dataAttrs[dataAttrIndex],
        element.dataset[dataAttrs[dataAttrIndex]],
      );
    }
  }
};

// Noticed lots of loops where a function simply gets executed on every
// member of an array. This abstraction eliminates that repetitive code.
const applyFn = (items, fn) => {
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    fn instanceof win[io] ? fn.observe(items[itemIndex]) : fn(items[itemIndex]);
  }
};

const createMutationObserver = (entry) => {
  new MutationObserver(() => {
    applyFn(queryDOM(), (newElement) => {
      if (lazyElements.indexOf(newElement) < 0) {
        lazyElements.push(newElement);

        if (!crawler) {
          intersectionListener.observe(newElement);
        } else {
          applyFn(lazyElements, load);
        }
      }
    });
  }).observe(entry, {
    childList: true,
    subtree: true,
  });
};

let lazyElements = queryDOM();

// If the current user agent is a known crawler, again, we load everything.
if (!crawler) {
  intersectionListener = new win[io](
    (entries) => {
      applyFn(entries, (entry) => {
        if (entry.isIntersecting || entry.intersectionRatio) {
          const element = entry.target;

          if (ric in win) {
            win[ric](
              () => {
                load(element);
              },
              {
                timeout: 200,
              },
            );
          } else {
            load(element);
          }

          intersectionListener.unobserve(element);
          lazyElements = lazyElements.filter(
            (lazyElement) => lazyElement != element,
          );
        }
      });
    },
    {
      rootMargin: "200px 0%",
    },
  );

  applyFn(lazyElements, intersectionListener);

  applyFn(queryDOM("body"), createMutationObserver);
} else {
  applyFn(lazyElements, load);
}
