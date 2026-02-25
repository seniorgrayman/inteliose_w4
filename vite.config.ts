import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { burnApiPlugin } from "./vite-burn-api";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Inteliose backend server — /api/intel/* and /api/a2a → localhost:3001
      '/api/intel': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/a2a': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/well-known': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/well-known\/agent-card/, '/.well-known/agent-card.json'),
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api/erc8004-registration': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/erc8004-registration/, '/erc8004-registration.json'),
      },

      // Proxy for daointel.io
      '/daointel': {
        target: 'https://daointel.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/daointel/, ''),
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "development" && burnApiPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));