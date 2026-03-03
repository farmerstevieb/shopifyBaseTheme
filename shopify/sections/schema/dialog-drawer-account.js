const {
  dialogSettings,
  dialogBlocks,
  dialogPresets,
} = require("./parts/dialog");

module.exports = {
  name: "Account Drawer",
  tag: "section",
  class: "shopify-section--dialog-drawer-account",
  ...dialogSettings(),
  ...dialogBlocks({
    header_controls_settings: [
      {
        type: "header",
        content: "Tab #1 (Login Form)",
      },
      {
        type: "text",
        id: "tab_one_title",
        label: "Tab #1 Title",
        default: "Login",
      },
      {
        type: "header",
        content: "Tab #2 (Register Form)",
      },
      {
        type: "text",
        id: "tab_two_title",
        label: "Tab #2 Title",
        default: "Register",
      },
    ],
    blocks_main: [
      {
        type: "account-tabs",
        name: "Account Tabs",
        limit: 1,
        settings: [
          {
            type: "header",
            content: "Login Tab",
          },
          {
            type: "text",
            id: "login_title",
            label: "'Login' Title",
            default: "Great to see you again",
          },
          {
            type: "text",
            id: "login_text",
            label: "'Login' Text",
            default: "Please log in to your account below",
          },
          {
            type: "url",
            id: "login_text_link",
            label: "'Login' Text Link"
          },
          {
            type: "text",
            id: "forgot_title",
            label: "'Forgot your password' Title",
            default: "Reset your password",
          },
          {
            type: "text",
            id: "forgot_text",
            label: "'Forgot your password' Text",
            default: "We will send you an email to reset your password",
          },
          {
            type: "paragraph",
            content: "Register Prompt",
          },
          {
            type: "text",
            id: "register_prompt_text",
            label: "'Register' Prompt Text",
            default: "Don't have an account?",
          },
          {
            type: "text",
            id: "register_prompt_button_text",
            label: "'Register' Prompt Button Text",
            default: "Register",
          },
          {
            type: "header",
            content: "Register Tab",
          },
          {
            type: "text",
            id: "register_title",
            label: "'Register' Title",
            default: "Create a new account",
          },
          {
            type: "text",
            id: "register_text",
            label: "'Register' Text",
            default:
              "Creating an account is easy, fill in the form below and enjoy the benefits",
          },
          {
            type: "paragraph",
            content: "Login Prompt",
          },
          {
            type: "text",
            id: "login_prompt_text",
            label: "'Login' Prompt Text",
            default: "Already have an account?",
          },
          {
            type: "text",
            id: "login_prompt_button_text",
            label: "'Login' Prompt Button Text",
            default: "Log in",
          },
        ],
      },
    ],
  }),
  ...dialogPresets({
    presets_main: [
      {
        type: "account-tabs",
      },
    ],
  }),
};
