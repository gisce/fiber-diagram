import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: path.resolve(__dirname, "./tsconfig.build.json"),
    }),
    viteTsconfigPaths(),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.vanilla.ts"),
      name: "fiber-diagram",
      formats: ["es"],
      fileName: (format) => `fiber-diagram.vanilla.${format}.js`,
    },
  },
});
