/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The browser only ever talks to /api; in dev Vite forwards it to the backend.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": process.env.API_URL ?? "http://localhost:3001" } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/setupTests.ts"] },
});
