import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served under `/app/` so it sits behind the single-origin dev proxy alongside
// the public app (`/`) and the API (`/api`). The base also feeds the React
// Router basename so client routes resolve under `/app`.
export default defineConfig({
  base: "/app/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
