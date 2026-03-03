import type {
  BodyScrollOptions,
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll,
} from "body-scroll-lock-upgrade";

type BodyScrollLock = {
  clearAllBodyScrollLocks: typeof clearAllBodyScrollLocks;
  disableBodyScroll: typeof disableBodyScroll;
  enableBodyScroll: typeof enableBodyScroll;
};

let BSL: BodyScrollLock | undefined;
const getBSL = async () => {
  BSL = await import(
    /* webpackChunkName: "body-scroll-lock-upgrade" */ "body-scroll-lock-upgrade"
  );
};

export async function lock(
  elTarget: HTMLElement,
  options: BodyScrollOptions = {},
) {
  if (!BSL) await getBSL();

  BSL?.disableBodyScroll(elTarget, options);
  document.body.dataset.bslScrollPosition = String(scrollY);
  document.body.style.paddingRight = `calc(var(--scrollbar-width) * 1px)`;
}

export async function release(elTarget: HTMLElement, clearAll = false) {
  if (!BSL) await getBSL();
  BSL?.enableBodyScroll(elTarget);

  if (clearAll) BSL?.clearAllBodyScrollLocks();
  if (document.body.dataset.bslScrollPosition)
    window.scrollTo(0, Number(document.body.dataset.bslScrollPosition));
  document.body.style.paddingRight = "";
}
