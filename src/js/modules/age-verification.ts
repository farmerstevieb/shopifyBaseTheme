/**
 * Age Verification Module
 *
 * Checks sessionStorage on DOMContentLoaded. If the visitor has not yet
 * verified their age and the theme setting is enabled, the modal is shown
 * (the Liquid snippet renders it hidden by default and this module reveals it).
 *
 * The modal is also rendered inline in the snippet with a small inline script
 * that runs synchronously — this module provides the same guard as a fallback
 * and handles any edge cases around deferred JS loading.
 */

const STORAGE_KEY = 'ecomplete_age_verified';
const MODAL_ID = 'age-verification';
const BODY_LOCK_CLASS = 'age-verification-open';

const init = (): void => {
  const modal = document.getElementById(MODAL_ID) as HTMLElement | null;

  if (!modal) return;

  // If already verified, ensure modal stays hidden and bail
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    modal.setAttribute('hidden', '');
    document.body.classList.remove(BODY_LOCK_CLASS);
    return;
  }

  // Show the modal and lock body scroll
  modal.removeAttribute('hidden');
  document.body.classList.add(BODY_LOCK_CLASS);

  // Block Escape key — no bypass allowed
  const blockEscape = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.addEventListener('keydown', blockEscape, true);

  const yesBtn = document.getElementById('age-verification-yes');
  const noBtn = document.getElementById('age-verification-no');

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      modal.setAttribute('hidden', '');
      document.body.classList.remove(BODY_LOCK_CLASS);
      document.removeEventListener('keydown', blockEscape, true);
    });
  }

  if (noBtn) {
    noBtn.addEventListener('click', () => {
      const redirectUrl = modal.dataset.redirectUrl ?? 'https://www.google.com';
      window.location.href = redirectUrl;
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { init as initAgeVerification };
