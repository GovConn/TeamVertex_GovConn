import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    // Only allow your Azure Container App domain and all subdomains of azurecontainerapps.io
    allowedHosts: [
      "govconn-portal.ambitioustree-9332536f.eastasia.azurecontainerapps.io",
      ".azurecontainerapps.io",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
