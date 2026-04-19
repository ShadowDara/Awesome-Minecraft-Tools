import { parseMarkdownToDocument } from "samengine/utils";
import { version } from "samengine/build";
import fs from "fs/promises";
import path from "path";

console.log(version());

const SRC_DIR = path.resolve("../../");
const OUT_DIR = path.resolve("./dist");

async function processDirectory(currentDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (["node_modules", ".git", "dist", "venv"].includes(entry.name)) continue;
    
    const fullPath = path.join(currentDir, entry.name);

    // Zielpfad berechnen (spiegelt Struktur)
    const relativePath = path.relative(SRC_DIR, fullPath);
    const outPath = path.join(OUT_DIR, relativePath);

    if (entry.isDirectory()) {
      // Ordner im dist erstellen
      await fs.mkdir(outPath, { recursive: true });

      // Rekursiv weiter
      await processDirectory(fullPath);
    }

    if (entry.isFile() && entry.name.toLowerCase() === "readme.md") {
      try {
        const data = await fs.readFile(fullPath, "utf8");
        const html = parseMarkdownToDocument(data, {title: "Awesome Minecraft Tools"});

        // index.html im Zielordner
        const outputFile = path.join(path.dirname(outPath), "index.html");

        await fs.writeFile(outputFile, html);

        console.log("✔", outputFile);
      } catch (err) {
        console.error("Fehler bei:", fullPath, err);
      }
    }
  }
}

async function build() {
  try {
    await fs.mkdir(OUT_DIR, { recursive: true });
    await processDirectory(SRC_DIR);
    console.log("✅ Build fertig!");
  } catch (err) {
    console.error(err);
  }
}

await build();
