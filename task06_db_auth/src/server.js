import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import { init, User, Note } from "./db.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* -------- middleware -------- */
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// tiny rate limiter for auth endpoints (naive, memory)
const buckets = new Map();
function rate(key, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > b.reset) { b.count = 0; b.reset = now + windowMs; }
  b.count++;
  buckets.set(key, b);
  return b.count <= limit;
}

/* -------- auth helpers -------- */
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2d" });
}
function auth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "auth required" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}
// convenience: send a safe user object
function safeUser(u) { return { id: u.id, email: u.email }; }

/* -------- auth routes -------- */
app.post("/auth/register", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (!rate(`reg:${ip}`)) return res.status(429).json({ error: "slow down" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (String(password).length < 8) return res.status(422).json({ error: "password too short (min 8)" });

  const hash = await bcrypt.hash(String(password), 12);
  try {
    const user = await User.create({ email: String(email).toLowerCase(), password_hash: hash });
    res.status(201).json(safeUser(user));
  } catch (e) {
    res.status(400).json({ error: "email already exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (!rate(`login:${ip}`)) return res.status(429).json({ error: "slow down" });

  const { email, password } = req.body || {};
  const user = await User.findOne({ where: { email: String(email || "").toLowerCase() } });
  if (!user) return res.status(400).json({ error: "bad credentials" });
  const ok = await bcrypt.compare(String(password || ""), user.password_hash);
  if (!ok) return res.status(400).json({ error: "bad credentials" });

  const token = signToken(safeUser(user));
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !!process.env.VERCEL || !!process.env.FLY_IO || process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 2
  });
  res.json({ ok: true, user: safeUser(user) });
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});

app.get("/auth/me", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json(safeUser(user));
});

/* -------- notes (protected) -------- */
app.get("/api/notes", auth, async (req, res) => {
  const notes = await Note.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]]
  });
  res.json(notes);
});

app.post("/api/notes", auth, async (req, res) => {
  const { title, body } = req.body || {};
  const t = String(title || "").trim();
  if (!t) return res.status(400).json({ error: "title required" });
  const note = await Note.create({ title: t.slice(0, 160), body: String(body || ""), userId: req.user.id });
  res.status(201).json(note);
});

app.put("/api/notes/:id", auth, async (req, res) => {
  const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!note) return res.status(404).json({ error: "not found" });
  const { title, body } = req.body || {};
  if (title !== undefined) note.title = String(title).trim().slice(0, 160) || note.title;
  if (body !== undefined) note.body = String(body);
  await note.save();
  res.json(note);
});

app.delete("/api/notes/:id", auth, async (req, res) => {
  const note = await Note.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!note) return res.status(404).json({ error: "not found" });
  await note.destroy();
  res.json({ ok: true });
});

/* -------- front-end -------- */
app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

/* -------- errors -------- */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal_error" });
});

/* -------- start -------- */
await init();
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Task06 http://localhost:${PORT}`));
