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
      // Inteliose backend server (A2A + ERC-8004 + Intel APIs)
      '/intel': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/a2a': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/.well-known': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },

      // Existing proxy for clawn.ch
      '/api': {
        target: 'https://clawn.ch',
        changeOrigin: true,
      },

      // Proxy for daointel.io
      '/daointel': {
        target: 'https://daointel.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/daointel/, ''),
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