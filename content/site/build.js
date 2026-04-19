import { parseMarkdownToDocument } from "samengine/utils";
import { compressHTML } from "samengine-build/utils";
import fs from "fs/promises";

async function build() {
    try {
        // Datei lesen
        const data = await fs.readFile("../../README.md", "utf8");

        // Markdown parsen
        const content = parseMarkdownToDocument(data);

        // Ordner erstellen (falls nicht vorhanden)
        await fs.mkdir("../../dist", { recursive: true });

        // Datei schreiben
        await fs.writeFile("../../dist/index.html", await compressHTML(content));

        console.log("Datei gespeichert!");
    } catch (err) {
        console.error(err);
    }
}

await build();
