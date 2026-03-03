import { attachEvent, debounce, get, rIC } from "./utils";

// Lazy CSS custom properties
rIC(() => {
  const html = document.documentElement;

  const htmlWidth = +html.getBoundingClientRect().width.toFixed(2);
  html.style.setProperty(
    "--scrollbar-width",
    `${window.innerWidth - htmlWidth}`,
  );

  const debouncedFn = debounce(() => {
    html.style.setProperty(
      "--vh",
      `${(visualViewport?.height ?? window.innerHeight) * 0.01}px`,
    );
  }, 32);
  // TODO: Resize observer?
  (visualViewport ?? window).addEventListener("resize", debouncedFn);
  debouncedFn();
});

attachEvent(
  "load",
  window,
  () => {
    const isLoginPage = window.location.pathname.includes("account/login");
    // Toggle Login/Recover forms
    Shopify.theme.showLoginForm = () => {
      let recoverFormSelector = "form#RecoverPasswordForm";
      let loginFormSelector = "form#LoginForm";

      // Handle `/account/login` page
      if (isLoginPage) {
        recoverFormSelector = ".js-main-recover";
        loginFormSelector = ".js-main-login";
      } else {
        event?.preventDefault();
      }

      // Toggle forms
      const elRecoverForm = get(recoverFormSelector);
      if (elRecoverForm) elRecoverForm.hidden = true;

      const elLoginForm = get(loginFormSelector);
      if (elLoginForm) elLoginForm.hidden = false;

      return isLoginPage;
    };

    Shopify.theme.showRecoverForm = (event: Event) => {
      let recoverFormSelector = "form#RecoverPasswordForm";
      let loginFormSelector = "form#LoginForm";

      // Handle `/account/login` page
      if (isLoginPage) {
        recoverFormSelector = ".js-main-recover";
        loginFormSelector = ".js-main-login";
      } else {
        event.preventDefault();
      }

      // Toggle forms
      const elLoginForm = get(loginFormSelector);
      if (elLoginForm) elLoginForm.hidden = true;

      const elRecoverForm = get(recoverFormSelector);
      if (elRecoverForm) elRecoverForm.hidden = false;

      return isLoginPage;
    };

    // Execute on `/account/login` page
    if (isLoginPage) {
      if (window.location.hash === "#recover") {
        Shopify.theme.showRecoverForm();
      } else {
        Shopify.theme.showLoginForm();
      }
    }
  },
  { once: true },
);
