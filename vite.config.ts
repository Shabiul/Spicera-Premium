import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  define: {
    global: 'globalThis',
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      NEXT_PUBLIC_STACK_PROJECT_ID: JSON.stringify(process.env.NEXT_PUBLIC_STACK_PROJECT_ID || '3b274e6d-5ded-4246-9b45-e3721ef00676'),
      NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: JSON.stringify(process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || 'pck_776jykt2yesys217x7v18h2xwk33yjmzq9pjjngased1r'),
    },
    'process.browser': true,
    'process.version': JSON.stringify('v18.0.0'),
  },
  optimizeDeps: {
    exclude: ['react-hook-form', '@hookform/resolvers', 'zod'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
