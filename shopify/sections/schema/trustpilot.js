const sectionSettings = require("./parts/sectionSettings");
const sectionHeader = require("./parts/section-header");
const slider = require("./parts/slider");

module.exports = {
  name: "Trustpilot",
  tag: "section",
  class: "o-row",
  disabled_on: {
    groups: ["header", "footer"],
  },
  presets: [
    {
      name: "Trustpilot",
      blocks: [
        {
          type: "section_header",
        },
      ],
    },
  ],
  settings: [
    ...sectionSettings({
      width: false,
      default_spacing: "lg",
    }),
    ...slider(),
    {
      type: "header",
      content: "Trustpilot API Configuration",
    },
    {
      type: "text",
      id: "api_key",
      label: "Trustpilot API Key",
      info: "Your Trustpilot Public API key (Client ID). Find this in your Trustpilot Business account under Integrations > Developers > APIs.",
    },
    {
      type: "text",
      id: "business_unit_id",
      label: "Business Unit ID",
      info: "Your Trustpilot Business Unit ID. Use the API endpoint to find yours or check your Trustpilot account.",
    },
    {
      type: "header",
      content: "Display Configuration",
    },
    {
      type: "range",
      id: "fetch_count",
      min: 10,
      max: 100,
      step: 10,
      default: 50,
      label: "Number of reviews to fetch",
      info: "How many reviews to fetch from Trustpilot API. Fetch more than you plan to display to account for filtering.",
    },
    {
      type: "range",
      id: "display_count",
      min: 5,
      max: 50,
      step: 5,
      default: 10,
      label: "Number of reviews to display",
      info: "How many reviews to show in the carousel after filtering.",
    },
    {
      type: "header",
      content: "Filtering Options",
    },
    {
      type: "paragraph",
      content:
        "Select which star ratings to display. Leave all unchecked to show all reviews.",
    },
    {
      type: "checkbox",
      id: "star_1",
      label: "Show 1-star reviews",
      default: true,
    },
    {
      type: "checkbox",
      id: "star_2",
      label: "Show 2-star reviews",
      default: true,
    },
    {
      type: "checkbox",
      id: "star_3",
      label: "Show 3-star reviews",
      default: true,
    },
    {
      type: "checkbox",
      id: "star_4",
      label: "Show 4-star reviews",
      default: true,
    },
    {
      type: "checkbox",
      id: "star_5",
      label: "Show 5-star reviews",
      default: true,
    },
    {
      type: "checkbox",
      id: "verified_only",
      label: "Show only verified reviews",
      default: false,
      info: "Filter to show only verified Trustpilot reviews.",
    },
    {
      type: "header",
      content: "Performance",
    },
    {
      type: "range",
      id: "cache_expiration",
      min: 15,
      max: 240,
      step: 15,
      unit: "min",
      default: 60,
      label: "Cache expiration time",
      info: "How long to cache reviews in the browser before fetching fresh data. Helps reduce API calls and improve performance.",
    },
  ],
  blocks: [
    ...sectionHeader({
      additional_settings: [
        {
          type: "checkbox",
          id: "show_trustpilot_stats",
          label: "Show Trustpilot Business Stats",
          default: false,
          info: 'Display overall Trustpilot score and total review count (e.g., "Great" and "Based on 514 reviews")',
        },
      ],
    }),
  ],
};
