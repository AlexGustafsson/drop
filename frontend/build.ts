import {build} from "esbuild";
import {renderFile} from "ejs";
import {rm, writeFile, readdir} from "fs/promises";

async function main() {
  await rm("dist", { recursive: true });

  const buildResult = await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: "dist/static",
    entryNames: "[dir]/[name]-[hash]",
    tsconfig: "tsconfig.browser.json",
  });

  const files: [string] = await readdir("./dist/static");
  const mainScriptPath = files.find(x => x.match(/^main-.*\.js$/));
  const mainStylePath = files.find(x => x.match(/^main-.*\.css$/));

  const result = await renderFile(
    "./src/index.ejs",
    {
      stylePath: `/static/${mainStylePath}`,
      scriptPath: `/static/${mainScriptPath}`,
    },
    {}
  );

  writeFile("./dist/index.html", result);
}

try {
  main();
} catch (error) {
  console.log("Build failed");
  console.error(error);
  process.exit(1);
}
