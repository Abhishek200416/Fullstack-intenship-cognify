import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req,res)=> res.sendFile(path.join(__dirname,"public/index.html")));

const PORT = process.env.PORT || 3002;
app.listen(PORT, ()=> console.log(`Task03 http://localhost:${PORT}`));
