import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Ship the SQLite database and JSON data with every server function (server actions included).
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
  compress: true,
  poweredByHeader: false,
};

export default config;
