
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'node:fs';
import type { ViteDevServer } from 'vite';
import type { Connect } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add middleware for SPA routing during development
    middlewareMode: true,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'generate-redirects',
      buildStart() {
        // Ensure _redirects file exists in public folder
        if (!fs.existsSync('public/_redirects')) {
          fs.writeFileSync('public/_redirects', '/*  /index.html  200\n');
          console.log('✅ _redirects file created in public folder');
        }
      },
      writeBundle() {
        // Ensure this always creates/updates _redirects file in dist folder
        fs.writeFileSync('dist/_redirects', '/*  /index.html  200\n');
        console.log('✅ _redirects file generated in dist folder');
      }
    },
    // Handle history API fallback for SPA routing
    {
      name: 'spa-fallback',
      configureServer(server: ViteDevServer) {
        // Return index.html for any route
        server.middlewares.use((req: Connect.IncomingMessage, res: any, next: Connect.NextFunction) => {
          if (req.url?.includes('.')) {
            // Skip for asset requests
            next();
          } else {
            // This helps with client-side routing in dev mode
            req.url = '/';
            next();
          }
        });
      }
    }
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
  },
  // Ensure history fallback for built app
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
}));
