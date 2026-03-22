/**
 * NotifyMe — Back-in-Stock notification form handler
 *
 * Reads the API endpoint from body[data-wishlist-api-url].
 * Calls POST /notify on the ecomplete API.
 *
 * Expected request body:
 * {
 *   email: string,
 *   variantId: string,
 *   productId: string,
 *   productTitle: string,
 *   productHandle: string,
 *   shopDomain: string
 * }
 */

function bindNotifyMeForms(): void {
  document.querySelectorAll<HTMLElement>('.js-notify-me-form').forEach((form) => {
    if (form.dataset.notifyBound) return;
    form.dataset.notifyBound = 'true';
    form.addEventListener('submit', handleNotifySubmit);
  });
}

async function handleNotifySubmit(e: Event): Promise<void> {
  e.preventDefault();

  const form = e.currentTarget as HTMLFormElement;
  const wrapper = form.closest('.js-notify-me') as HTMLElement | null;
  const submitBtn = form.querySelector('.js-notify-me-submit') as HTMLButtonElement;
  const btnText = form.querySelector('.js-notify-me-btn-text') as HTMLElement;
  const spinner = form.querySelector('.notify-me__spinner') as HTMLElement;
  const successEl = form.querySelector('.js-notify-me-success') as HTMLElement;
  const errorEl = form.querySelector('.js-notify-me-error') as HTMLElement;

  // Validate email if field is present
  const emailInput = form.querySelector('.js-notify-me-email') as HTMLInputElement | null;
  if (emailInput && !emailInput.validity.valid) {
    emailInput.focus();
    return;
  }

  const email =
    emailInput?.value.trim() ||
    (form.querySelector('[name="email"]') as HTMLInputElement)?.value.trim() ||
    '';

  if (!email) return;

  const variantId = (form.querySelector('[name="variant_id"]') as HTMLInputElement)?.value;
  const productId = (form.querySelector('[name="product_id"]') as HTMLInputElement)?.value;
  const productTitle = (form.querySelector('[name="product_title"]') as HTMLInputElement)?.value;
  const productHandle = (form.querySelector('[name="product_handle"]') as HTMLInputElement)?.value;

  const apiUrl = document.body.dataset.wishlistApiUrl;
  if (!apiUrl) {
    console.warn('NotifyMe: no data-wishlist-api-url on <body>');
    return;
  }

  // Show loading state
  submitBtn.setAttribute('aria-disabled', 'true');
  if (btnText) btnText.classList.add('invisible');
  if (spinner) spinner.classList.remove('invisible');
  successEl.hidden = true;
  errorEl.hidden = true;

  try {
    const response = await fetch(`${apiUrl}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Domain': (window as any).Shopify?.shop || '',
      },
      body: JSON.stringify({
        email,
        variantId,
        productId,
        productTitle,
        productHandle,
        shopDomain: (window as any).Shopify?.shop || '',
      }),
    });

    if (response.ok) {
      successEl.hidden = false;
      form.reset();
      // Optionally hide the form after success
      if (wrapper) wrapper.classList.add('notify-me--success');
    } else {
      errorEl.hidden = false;
    }
  } catch {
    errorEl.hidden = false;
  } finally {
    submitBtn.removeAttribute('aria-disabled');
    if (btnText) btnText.classList.remove('invisible');
    if (spinner) spinner.classList.add('invisible');
  }
}

// Observe DOM for dynamically injected notify-me forms (e.g. via variant switching)
const observer = new MutationObserver(() => {
  bindNotifyMeForms();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial bind
bindNotifyMeForms();

export { bindNotifyMeForms };
