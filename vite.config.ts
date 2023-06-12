import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig } from "vite";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    peerDepsExternal({
      includeDependencies: true,
    }),
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "fiber-diagram",
      formats: ["es", "umd"],
      fileName: (format) => `fiber-diagram.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "antd", "react-konva", "konva"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
