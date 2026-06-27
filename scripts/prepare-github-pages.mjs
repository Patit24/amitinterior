import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const repoBase = "/amitinterior";

const localAbsolutePath = /(?<attr>\b(?:href|src)=["'])\/(?!(?:amitinterior|assets)\/)(?<path>(?:admin|about|contact|portfolio|services)(?:\/|#)?|Images\/|Logo\.png|favicon\.ico)/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : path;
    }),
  );

  return files.flat();
}

const htmlFiles = (await walk(distDir)).filter((file) => file.endsWith(".html"));

await Promise.all(
  htmlFiles.map(async (file) => {
    const html = await readFile(file, "utf8");
    const rewritten = html
      .replaceAll('href="/"', `href="${repoBase}/"`)
      .replaceAll('src="/Logo.png"', `src="${repoBase}/Logo.png"`)
      .replace(localAbsolutePath, `$<attr>${repoBase}/$<path>`);

    await writeFile(file, rewritten);
  }),
);
