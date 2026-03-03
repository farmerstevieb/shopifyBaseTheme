/**
 * Brand Colours
 * - The global part used to keep consistent
 *   dialog settings across multiple sections.
 *
 * -
 * Example:
 *  ...dialogPresets(),
 *  ...dialogSettings(),
 *  ...dialogBlocks()
 *
 */

const dialogPresets = ({
  name = "Modal/Drawer Name",
  presets_header = [],
  presets_main = [],
  presets_footer = [],
} = {}) => ({
  presets: [
    {
      name: name,
      blocks: [
        {
          type: "header-open"
        },
        {
          type: "header-controls"
        },
        ...presets_header,
        {
          type: "header-close"
        },
        {
          type: "main-open"
        },
        ...presets_main,
        {
          type: "main-close"
        },
        {
          type: "footer-open"
        },
        ...presets_footer,
        {
          type: "footer-close"
        },
      ],
    },
  ]
});

const dialogBlocks = ({
  blocks_header = [],
  blocks_main = [],
  blocks_footer = [],
  header_controls_settings = []
} = {}) => ({
  blocks: [
    {
      type: "header-open",
      name: "[---- Header start ----]",
      limit: 1,
    },
    {
      type: "header-controls",
      name: "Header (Controls)",
      limit: 1,
      settings: [
        ...header_controls_settings
      ]
    },
    ...blocks_header,
    {
      type: "header-close",
      name: "[---- Header end ----]",
      limit: 1,
    },
    {
      type: "main-open",
      name: "[---- Main start ----]",
      limit: 1,
    },
    ...blocks_main,
    {
      type: "main-close",
      name: "[---- Main end ----]",
      limit: 1,
    },
    {
      type: "footer-open",
      name: "[---- Footer start ----]",
      limit: 1,
    },
    ...blocks_footer,
    {
      type: "footer-close",
      name: "[---- Footer end ----]",
      limit: 1,
    },
  ].filter(Boolean),
});


const dialogSettings = (
  {
    additional_settings = [], // Adds additional settings to the parent object of the schema.
    is_drawer = true, // Returns drawer-specific settings or notices inside the schema.
  } = {}) => ({
    enabled_on: {
      groups: ["custom.dialogs"],
    },
    limit: 1,
    settings: [
      is_drawer && {
        type: "paragraph",
        content: "This section requres that all blocks that are wrapped in square brackets, like '[---- Header start ----], are included as blocks, because without them the section may fail to function properly. They must be organised vertically as such: header, main, footer."
      },
      {
        type: "checkbox",
        id: "no_redirect",
        label: "Stay on the current page after submitting the form?",
        info: "Enable to prevent redirection after form submission.",
        default: true
      },
      {
        type: "checkbox",
        id: "testing",
        label: "Test Mode",
        info: "This will ensure the dialog remains open as you edit it in the theme customiser.",
        default: false
      },
      ...additional_settings
    ].filter(Boolean)
  })

module.exports = {
  dialogSettings,
  dialogBlocks,
  dialogPresets
}
