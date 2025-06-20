import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Plugin } from "vite";
//import { componentTagger } from "lovable-tagger";

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
}));
function componentTagger(): Plugin {
  return {
    name: "component-tagger",
    transform(code, id) {
      if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
        // Example: Add a comment tag at the top of each React component file
        return {
          code: `// Tagged by componentTagger\n${code}`,
          map: null,
        };
      }
      return null;
    },
  };
}

