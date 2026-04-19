import { parseMarkdownToDocument } from "samengine/utils";
import { version } from "samengine/build";
import { compressHTML } from "samengine-build/utils";
import fs from "fs/promises";
import path from "path";

const svgfile = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Hintergrund -->
  <rect width="512" height="512" fill="#1e1e1e"/>

  <!-- Gras-Top -->
  <rect x="0" y="0" width="512" height="90" fill="#3ba635"/>
  <rect x="0" y="70" width="512" height="20" fill="#2d7d2a"/>

  <!-- A -->
  <g transform="translate(70,150)">
    <rect x="40" y="0" width="60" height="60" fill="#5aa832"/>
    <rect x="20" y="60" width="100" height="60" fill="#5aa832"/>
    <rect x="0" y="120" width="40" height="180" fill="#5aa832"/>
    <rect x="120" y="120" width="40" height="180" fill="#5aa832"/>
    <rect x="40" y="150" width="60" height="40" fill="#2e6f21"/>
  </g>

  <!-- M -->
  <g transform="translate(210,150)">
    <rect x="0" y="0" width="40" height="300" fill="#8a8a8a"/>
    <rect x="40" y="0" width="40" height="80" fill="#8a8a8a"/>
    <rect x="80" y="0" width="40" height="300" fill="#8a8a8a"/>
    <rect x="40" y="80" width="40" height="60" fill="#6f6f6f"/>
  </g>

  <!-- T -->
  <g transform="translate(350,150)">
    <rect x="0" y="0" width="140" height="60" fill="#7a4b2e"/>
    <rect x="50" y="60" width="40" height="240" fill="#7a4b2e"/>
    <rect x="20" y="120" width="100" height="40" fill="#5a3a22"/>
  </g>

  <!-- Bodenlinie -->
  <rect x="0" y="430" width="512" height="20" fill="#2d7d2a"/>

  <!-- Rahmen -->
  <rect x="6" y="6" width="500" height="500"
        fill="none" stroke="#3ba635" stroke-width="10"/>
</svg>`;

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
                const html = await compressHTML(
                    parseMarkdownToDocument(
                        data,
                        {
                            title: "Awesome Minecraft Tools",
                            header: `<link> rel="icon" href="data:image/svg+xml;base64,${btoa(await compressHTML(svgfile))}`
                        }));

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
