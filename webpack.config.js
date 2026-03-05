/**
 * Ecomplete Base Theme — Webpack Build Configuration
 *
 * Compiles:
 *   src/js/index.ts      → dist/assets/main.min.js
 *   src/scss/main.scss   → dist/assets/main.min.css
 *
 * Copies:
 *   shopify/**\/*         → dist/
 */

const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const RemoveEmptyScripts = require("webpack-remove-empty-scripts");

module.exports = (env = {}) => {
  const isProd = !!env.production;

  return {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "source-map",

    entry: {
      "main.min": [
        "./src/js/index.ts",
        "./src/scss/main.scss",
      ],
    },

    output: {
      path: path.resolve(__dirname, "dist/assets"),
      filename: "[name].js",
      chunkFilename: "[name].js",
      publicPath: "",
      clean: false,
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },

    module: {
      rules: [
        // TypeScript + JSX via Babel
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { targets: "> 0.5%, last 2 versions, Firefox ESR, not dead, iOS >= 16" }],
                "@babel/preset-typescript",
                ["@babel/preset-react", { runtime: "automatic" }],
              ],
              plugins: ["@babel/plugin-transform-runtime"],
            },
          },
        },

        // SCSS → CSS extraction
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    require("tailwindcss"),
                    require("autoprefixer"),
                  ],
                },
              },
            },
            "sass-loader",
          ],
        },

        // SVG files (inline as React components via @svgr/webpack)
        {
          test: /\.svg$/,
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"],
        },
      ],
    },

    plugins: [
      new RemoveEmptyScripts(),

      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      // Copy Shopify theme files to dist/
      // JSON files have their /* comment */ headers stripped (Shopify adds these
      // automatically but they make the JSON invalid for theme push/check)
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "shopify",
            to: path.resolve(__dirname, "dist"),
            globOptions: { ignore: ["**/.DS_Store", "**/sections/schema/**"] },
            transform(content, absoluteFilename) {
              if (absoluteFilename.endsWith(".json")) {
                // Strip leading /* ... */ block comment added by Shopify admin
                return content.toString().replace(/^\/\*[\s\S]*?\*\/\s*/m, "").trim();
              }
              return content;
            },
          },
        ],
      }),
    ],

    optimization: {
      minimizer: [
        "...",
        new CssMinimizerPlugin(),
      ],
    },

    // Suppress noisy size warnings in dev
    performance: {
      hints: isProd ? "warning" : false,
    },
  };
};
