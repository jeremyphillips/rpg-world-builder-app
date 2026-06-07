import react from "@rpg/config/eslint/react";
import next from "@next/eslint-plugin-next";

export default [
  ...react,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
    },
  },
  {
    // App Router route files legitimately export `metadata`/route config
    // alongside the default page component; Fast Refresh hygiene does not apply.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
