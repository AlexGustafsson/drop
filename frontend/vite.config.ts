import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import {readFile} from "fs/promises";
import svgr from "@svgr/core";
import esbuild from "esbuild";

function svg() {
  return {
    name: "svgr",
    async transform(src: string, id: string) {
      if (!id.endsWith(".svg"))
        return;

      const content = await readFile(id);
      const component = (await svgr(content, {}, {componentName: "SVG"})).replace("export default SVG", "export { SVG }");
      const result = await esbuild.transform(`${component}\n${src}`, {loader: "jsx"});
      return {
        code: result.code,
        // map: result.map,
      };
    }
  }
}

export default defineConfig({
  plugins: [
    reactRefresh(),
    svg(),
  ]
});
