// FORMAT MONEY

declare global {
  interface Window {
    Shopify: {
      locale: string;
      country: string;
      currency: {
        active: string;
      };
    };
  }
}

export function formatMoney({ cents }: { cents: number }): string {
  const shopifyLocale = `${window.Shopify.locale}-${window.Shopify.country}`;
  const currency = window.Shopify.currency.active;

  // Override locale for better currency symbol support
  const currencyMapLocale = shopifyLocale === "en-AU" && currency === "GBP"
    ? "en-GB"
    : shopifyLocale;

  const formatted = new Intl.NumberFormat(currencyMapLocale, {
    style: "currency",
    currency: window.Shopify.currency.active,
  }).format(cents / 100);

  // Fix spacing issues on iPad devices by removing extra spaces between currency and price
  // This handles cases where Intl.NumberFormat adds spaces like "£ 10.00" instead of "£10.00"
  return formatted.replace(/([£$€¥₹₽₩₪₦₨₩₫₴₸₺₼₾₿])\s+(\d)/g, '$1$2');
}
