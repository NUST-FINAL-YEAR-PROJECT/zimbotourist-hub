
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add proper handling for Node.js modules
  optimizeDeps: {
    exclude: ['paynow'] // Exclude the paynow package from client-side bundling
  },
  // Define environment variables that should be replaced
  define: {
    'process.env': {}
  }
}));
