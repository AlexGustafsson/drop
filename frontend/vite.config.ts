import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import {readFile} from "fs/promises";
import svgr from "@svgr/core";
import esbuild from "esbuild";
import type {UserConfigExport} from "vite";

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

export default ({ command, mode }) => {
  const config: UserConfigExport = {
    plugins: [
      reactRefresh(),
      svg(),
    ],
    define: {
      "DROP_API_ROOT": mode === "development" ? "'http://localhost:8080/api/v1'" : "'/api/v1'",
      'process.env': {},
    },
  };

  return defineConfig(config);
}
