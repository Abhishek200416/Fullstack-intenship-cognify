import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve public dir whether it's at <root>/public or <root>/src/public
const candidates = [
  path.join(__dirname, "public"),          // src/public
  path.join(__dirname, "..", "public"),    // public at project root
];

const PUBLIC_DIR =
  candidates.find(p => fs.existsSync(path.join(p, "index.html"))) ||
  candidates[0];

const app = express();

// Static assets
app.use(express.static(PUBLIC_DIR, { maxAge: "1h", extensions: ["html"] }));

// SPA fallback: send index.html for all GETs that accept HTML
app.get("*", (req, res, next) => {
  if (req.method !== "GET") return next();
  const accept = req.headers.accept || "";
  if (!accept.includes("text/html")) return next();
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Optional: 404 for non-HTML assets
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Task04 http://localhost:${PORT}`);
  console.log(`Serving from: ${PUBLIC_DIR}`);
});
