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

const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const RemoveEmptyScripts = require("webpack-remove-empty-scripts");

// Writes a marker file once webpack has finished emitting ALL assets for a
// compile, including the theme files copied by CopyWebpackPlugin. `shopify
// theme dev` must not start syncing until this exists — otherwise it can
// race the copy step and try (and fail) to delete required theme files
// (theme.liquid, settings_schema.json, ...) that just haven't landed yet.
class BuildCompleteMarkerPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("BuildCompleteMarkerPlugin", () => {
      const distPath = path.resolve(__dirname, "dist");
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
      }
      fs.writeFileSync(path.join(distPath, ".build-complete"), String(Date.now()));
    });
  }
}

module.exports = (env = {}) => {
  const isProd = !!env.production;

  return {
    mode: isProd ? "production" : "development",
    devtool: isProd ? false : "source-map",
    // Disable deterministic chunk IDs to prevent numeric-only chunk names
    // (which cause conflicts between unhashed originals and hashed versions)
    experiments: {
      outputModule: false,
    },

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
      // Entry and async chunks must ALL be hashed to prevent stale chunk collisions
      // Entry files (main.min.js, section-*.css) are version-busted by main.min.js hash
      // Async chunks loaded by webpack runtime use content hash for cache busting
      filename: "[name].js",
      chunkFilename: "[name].[contenthash:8].js",
      publicPath: "",
      clean: true,
      // Disable deterministic chunk IDs that cause numeric-only filenames
      // Use hashed names only to avoid collision between old unhashed and new hashed chunks
      hashFunction: "xxhash64",
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
      new BuildCompleteMarkerPlugin(),

      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[name].[contenthash:8].css",
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
      // Force named chunk IDs (e.g., "header", "cart") instead of numeric IDs (4897)
      // This ensures chunkFilename pattern produces only hashed names, preventing
      // conflicts between old unhashed and new hashed chunks from different builds
      chunkIds: "named",
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
