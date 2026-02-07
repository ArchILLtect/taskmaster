import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const reactPlugins = react();
  const plugins: PluginOption[] = Array.isArray(reactPlugins) ? [...reactPlugins] : [reactPlugins];

  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-report.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        open: false,
      })
    );
  }

  return {
    plugins,
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // DO NOT isolate react/react-dom/scheduler
            // Keep React in the general vendor chunk to avoid circular init issues.

            if (id.includes("aws-amplify") || id.includes("@aws-amplify")) return "vendor-amplify";

            if (
              id.includes("@aws-sdk") ||
              id.includes("@smithy") ||
              id.includes("@aws-crypto") ||
              id.includes("amazon-cognito-identity-js")
            ) return "vendor-aws";

            if (id.includes("@chakra-ui") || id.includes("@emotion") || id.includes("framer-motion"))
              return "vendor-ui";

            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("zustand")) return "vendor-zustand";
            if (id.includes("react-icons")) return "vendor-icons";

            return "vendor";
          }
        },
      },
    },
    resolve: { dedupe: ["react", "react-dom"] },
  };
})
