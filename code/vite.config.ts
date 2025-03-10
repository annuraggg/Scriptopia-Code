import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { loadEnv } from "vite";
import tsconfigPaths from 'vite-plugin-tsconfig-paths';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {
    server: {
      port: parseInt(process.env.VITE_PORT!),
    },

    plugins: [
      react(),
      visualizer({
        emitFile: true,
        filename: "stats.html",
        template: "sunburst",
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
