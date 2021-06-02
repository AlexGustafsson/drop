import { build } from "esbuild";
import { renderFile } from "ejs";
import postcss from "postcss";
import atImport from "postcss-import";
import cssnano from "cssnano";
import chokidar from "chokidar";
import { rm, readFile, writeFile, mkdir } from "fs/promises";

async function buildHTML() {
  const result = await renderFile(
    "./src/index.ejs",
    {
      stylePath: `/static/main.css`,
      scriptPath: `/static/main.js`,
    },
    {}
  );

  await writeFile("./dist/index.html", result);
}

async function buildCSS() {
  const css = await readFile("./src/main.css");
  const styleResult = await postcss()
    .use(atImport())
    .use(cssnano())
    .process(css, {
      from: "src/main.css",
      to: "dist/static/main.css",
      map: {
        inline: false,
      },
    });

  await writeFile(`./dist/static/main.css`, styleResult.css);
  await writeFile(`./dist/static/main.css.map`, styleResult.map.toString());
}

async function buildTypeScript(once = false) {
  const watchConfig = {
    async onRebuild(error) {
      if (error) {
        console.error(error);
        return;
      }

      await buildHTML();
    },
  };

  await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: "dist/static",
    tsconfig: "tsconfig.browser.json",
    watch: once ? {} : watchConfig,
  });
}

async function onChange(path: string) {
  if (path.endsWith(".ejs"))
    buildHTML();
  else if (path.endsWith(".css"))
    buildCSS();
}

async function main() {
  await rm("dist", { force: true, recursive: true });
  await mkdir("dist");

  buildTypeScript(true);
  buildCSS();
  buildHTML();

  const watcher = chokidar.watch("./src", {ignored: "*.ts", depth: 2, persistent: true});

  watcher.on("add", onChange);
  watcher.on("change", onChange);
  watcher.on("unlink", onChange);

  buildTypeScript();
}

try {
  main();
} catch (error) {
  console.log("Build failed");
  console.error(error);
  process.exit(1);
}
