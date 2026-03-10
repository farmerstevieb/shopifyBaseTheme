/**
 * Ecomplete Base Theme — Tailwind Configuration
 *
 * HOW TO CUSTOMISE FOR A NEW CLIENT:
 * 1. Update the `brand` colour palette below with client hex values
 * 2. CSS variables (--c-brand-*) are driven by Shopify settings_schema.json
 *    colour pickers — they feed into TailwindCSS via var() references
 * 3. The design system tokens (spacing, fontSize, screens) are shared across
 *    all clients and should rarely need changing
 * 4. To add client-specific fonts: add @font-face blocks in
 *    shopify/snippets/theme/_head.liquid, upload font files to
 *    shopify/assets/, and update fontFamily below
 */

/** @type {import('tailwindcss').Config} */
const baseThemePreset = {
  theme: {
    screens: {
      "max-xs": { max: "413px" },
      xs: "414px",
      "max-sm": { max: "639px" },
      sm: "640px",
      "max-md": { max: "767px" },
      md: "768px",
      "max-xmd": { max: "819px" },
      xmd: "820px",
      "max-lg": { max: "1023px" },
      lg: "1024px",
      "large-mobile": {
        raw: "(min-width: 1024px) and (pointer: coarse) and (hover: none)",
      },
      "desktop-fine": {
        raw: "(min-width: 1024px) and (pointer: fine)",
      },
      "max-xl": { max: "1279px" },
      xl: "1280px",
      "max-2xl": { max: "1439px" },
      "2xl": "1440px",
      "max-3xl": { max: "1535px" },
      "3xl": "1536px",
      "max-4xl": { max: "1680px" },
      "4xl": "1680px",
      "md-lg": { min: "768px", max: "1023px" },
      coarse: { raw: "(pointer: coarse)" },
      fine: { raw: "(pointer: fine)" },
    },
    colors: {
      black: "#000",
      white: "#fff",
      transparent: "transparent",
      highlight: "var(--c-highlight)",

      // Semantic colours — driven by Shopify theme settings (CSS vars set in theme/_head.liquid)
      primary: "var(--c-primary-claret)",
      primaryInverse: "var(--c-primary-petal)",
      secondary: "var(--c-secondary-bramble)",
      secondaryInverse: "var(--c-secondary-moss)",
      primaryButtonHover: "var(--buttons-primary-border-hover)",

      // Pricing
      sale: "var(--c-pricing-sale)",
      compare: "var(--c-pricing-compare)",
      "sale-inverse": "var(--c-pricing-sale-inverse)",
      "compare-inverse": "var(--c-pricing-compare-inverse)",

      /**
       * CLIENT BRAND COLOURS
       * All map to CSS variables set in theme/_head.liquid via settings_schema.json.
       * Named tokens match schema naming convention; numeric aliases for generic use.
       */
      brand: {
        // Primary palette
        claret: "var(--c-primary-claret)",   // Primary brand colour (darkest)
        petal: "var(--c-primary-petal)",     // Primary light tint
        carrara: "var(--c-primary-carrara)", // Primary lighter tint
        orchid: "var(--c-primary-orchid)",   // Primary accent light
        sable: "var(--c-primary-sable)",     // Near-black
        // Secondary palette
        bramble: "var(--c-secondary-bramble)", // Secondary brand / accent
        moss: "var(--c-secondary-moss)",       // Secondary mid
        sage: "var(--c-secondary-sage)",       // Secondary light
        kelime: "var(--c-secondary-kelime)",   // Secondary lighter
        // Generic numeric aliases (preferred for new code)
        1: "var(--c-primary-claret)",
        2: "var(--c-primary-petal)",
        3: "var(--c-primary-carrara)",
        accent1: "var(--c-secondary-bramble)",
        accent2: "var(--c-secondary-moss)",
        surface1: "var(--c-primary-carrara)",
        surface2: "var(--c-primary-orchid)",
      },

      border: {
        light: "var(--c-border-light)",
        dark: "var(--c-border-dark)",
        focus: "#191919",
        error: "#b71c1c",
        inverseLighter: "#373737",
        inverseEvenLighter: "rgba(255, 255, 255, 0.15)",
        swatch: "#EDEDED",
      },

      overlay: {
        light: "rgba(255, 255, 255, 0.6)",
        dark: "rgba(0, 0, 0, 0.6)",
      },

      alerts: {
        positive: "#33691E",
        neutral: "#1565C0",
        warning: "#FFCA28",
        negative: "#B71C1C",
      },

      red: {
        20: "#CF142B",
        50: "#B71C1C",
      },
      green: "#27ae60",
      grey: {
        0: "#000",
        5: "#111",
        10: "#191919",
        20: "#222",
        25: "#333",
        30: "#4d4d4d",
        35: "#444",
        40: "#666",
        45: "#616161",
        50: "#808080",
        60: "#999",
        65: "#A5A5A5",
        70: "#b3b3b3",
        80: "#ccc",
        90: "#e6e6e6",
        95: "#e9e9e9",
        100: "#f6f6f6",
        105: "#ebebeb",
        110: "#ddd",
      },
      validation: {
        success: "var(--c-validation-success)",
        error: "var(--c-validation-error)",
      },
      product: {
        blue: "#0000FF",
        red: "#FF0000",
        green: "#008000",
        brown: "#a5a5a5",
        purple: "#800080",
        pink: "#FFC0CB",
        grey: "#ccc",
        black: "#000",
        yellow: "#ffd000",
      },
      input: {
        default: { border: "#ccc" },
        active: { border: "#b3b3b3" },
        disabled: {
          background: "#e9e9e9",
          border: "#ccc",
          text: "rgba(25, 25, 25, 0.5)",
        },
        inverse: {
          default: {
            border: "rgba(255, 255, 255, 0.25)",
            text: "rgba(255, 255, 255, 0.5)",
          },
          active: { border: "rgba(255, 255, 255, 0.35)" },
        },
      },
    },
    fontFamily: {
      // CLIENT: Update when adding a custom font — reference the font-family
      // name defined in your @font-face blocks in theme/_head.liquid
      body: ["var(--font-primary)", "sans-serif"],
      heading: ["var(--font-secondary)", "sans-serif"],
    },
    fontSize: {
      "2xs": "1rem",
      xs: "1.1rem",
      sm: "1.2rem",
      smd: "1.3rem",
      md: "1.4rem",
      base: "1.6rem",
      xbase: "1.7rem",
      lg: "1.8rem",
      xl: "2rem",
      "2xl": "2.4rem",
      "3sm": "2.7rem",
      "3xl": "2.8rem",
      "4xl": "3.2rem",
      "4xxl": "3.4rem",
      "5xl": "3.6rem",
      "6xl": "4.1rem",
      "6xxl": "4.3rem",
      "7xl": ["5.6rem", { lineHeight: 1 }],
      "8xl": ["6.4rem", { lineHeight: 1 }],
      "9xl": ["7.2rem", { lineHeight: 1 }],
    },
    spacing: {
      unset: "unset",
      px: "1px",
      rem: "1rem",
      0: "0px",
      1: "0.4rem",
      2: "0.8rem",
      3: "1.2rem",
      4: "1.6rem",
      5: "2rem",
      6: "2.4rem",
      7: "2.8rem",
      8: "3.2rem",
      9: "3.6rem",
      10: "4rem",
      11: "4.4rem",
      12: "4.8rem",
      13: "5.6rem",
      14: "6.4rem",
      15: "7.2rem",
      16: "8rem",
      17: "9.6rem",
      18: "11.2rem",
      19: "12.8rem",
      20: "25.6rem",
      row: "var(--row-space)",
      page: "var(--page-space)",
      promo: "var(--promo-bar-height)",
      header: "var(--header-height)",
      "header-group": "var(--header-group-height)",
    },
    aspectRatio: {
      auto: "auto",
      square: "1 / 1",
      portrait: "1 / 1.25",
    },
    transition: {
      faster: "0.5s ease-in-out",
    },
    lineHeight: {
      zero: 0,
      none: 1,
      1: 1.1,
      base: 1.5,
      normal: "normal",
    },
    letterSpacing: {
      0: "0px",
      1: "0.01em",
      2: "0.02em",
      3: "2.7px",
      small: "0.2em",
      standard: "0.12em",
      wide: "0.15em",
    },
    animation: {
      "fade-in": "fade-in 1s ease-in-out",
    },
    borderRadius: {
      px: "1px",
      0: "0px",
      1: "0.4rem",
      2: "0.8rem",
      full: "9999px",
    },
    boxShadow: {
      0: "none",
      1: "0px 1px 3.4px rgba(0, 0, 0, 0.1), 0px 6px 14px rgba(0, 0, 0, 0.12)",
      2: "0px 4px 14px rgba(0, 0, 0, 0.18), 0px 25px 57px rgba(0, 0, 0, 0.22)",
    },
    extend: {
      maxWidth: {
        "1/2": "50%",
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
        "6xl": "75.6rem",
        "7xl": "80rem",
      },
      zIndex: {
        1: 1,
        2: 2,
        3: 3,
        "promo-bar": "30",
        header: "30",
        overlay: "29",
        dialog: "100",
      },
      gap: {
        auto: "var(--gap)",
      },
      gridTemplateColumns: {
        "sm-md": "repeat(6, 1fr)",
        "lg-xxl": "repeat(12, 1fr)",
      },
      colors: {
        inherit: "inherit",
      },
      minWidth: ({ theme }) => theme("spacing"),
    },
  },
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*", "./shopify/**/*", "../shopify/**/*", "!./shopify/**/theme-head.liquid"],
  presets: [baseThemePreset],
};
