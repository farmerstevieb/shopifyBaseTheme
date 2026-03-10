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
      // Per-section CSS chunks — loaded on demand by each section via render 'theme_assets'
      "section-article.min":                  "./src/scss/sections/article.scss",
      "section-banner-collage.min":           "./src/scss/sections/banner-collage.scss",
      "section-banner-grid.min":              "./src/scss/sections/banner-grid.scss",
      "section-before-after.min":             "./src/scss/sections/before-after.scss",
      "section-bundle-hotspots.min":          "./src/scss/sections/bundle-hotspots.scss",
      "section-content-cards-collection.min": "./src/scss/sections/content-cards-collection.scss",
      "section-content-cards.min":            "./src/scss/sections/content-cards.scss",
      "section-customer-addresses.min":       "./src/scss/sections/customer-addresses.scss",
      "section-customer.min":                 "./src/scss/sections/customer.scss",
      "section-faqs.min":                     "./src/scss/sections/faqs.scss",
      "section-hero.min":                     "./src/scss/sections/hero.scss",
      "section-main-stocklist.min":           "./src/scss/sections/main-stocklist.scss",
      "section-order.min":                    "./src/scss/sections/order.scss",
      "section-product.min":                  "./src/scss/sections/product.scss",
      "section-text-media.min":               "./src/scss/sections/text-media.scss",
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
