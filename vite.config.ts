import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Existing proxy for clawn.ch
      '/api': {
        target: 'https://clawn.ch',
        changeOrigin: true,
        // If the backend expects paths starting with /api → keep this
        // If it expects clean paths (no /api prefix) → uncomment the rewrite below
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },

      // New proxy for daointel.io
      '/daointel': {
        target: 'https://daointel.io',
        changeOrigin: true,
        // Choose ONE of the following two lines depending on how the backend expects paths:

        // Option A: If daointel.io backend expects paths to start with /api or similar
        // (e.g. your code does fetch('/daointel/api/data') → goes to https://daointel.io/api/data)
        rewrite: (path) => path.replace(/^\/daointel/, ''),

        // Option B: If you want to strip /daointel completely
        // (most common when proxying an entire site/API)
        // rewrite: (path) => path.replace(/^\/daointel/, ''),

        // Option C: If the backend expects the prefix to stay (rare)
        // → remove the rewrite line entirely
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));