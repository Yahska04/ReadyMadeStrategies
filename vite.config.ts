import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Allow sharing the local server through Cloudflare quick tunnels
// (`cloudflared tunnel --url http://localhost:5173`). Their random
// *.trycloudflare.com hostnames are otherwise rejected by Vite's host check.
const allowedHosts = [".trycloudflare.com"];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { allowedHosts },
  preview: { allowedHosts },
  // The strategy detail page is bundled eagerly so "View Template" opens instantly;
  // the single chunk is ~150 kB gzipped, so the default 500 kB (minified) warning is raised.
  build: { chunkSizeWarningLimit: 600 },
});
