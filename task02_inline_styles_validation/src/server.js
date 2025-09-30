import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory temp storage
let submissions = [];
let nextId = 1;

// Helpers
const isEmail = (s) => /^\S+@\S+\.\S+$/.test(s || "");
const isPhone = (s) => !s || /^[0-9+\-()\s]{7,20}$/.test(s); // optional, basic pattern
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : NaN;
};

function validateSubmission({ name, email, age, phone, agree, website }) {
  const errors = [];

  // honeypot: must be empty
  if (website && website.trim() !== "") errors.push("Bot detected.");

  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters.");
  if (!isEmail(email)) errors.push("Enter a valid email address.");
  const nAge = toInt(age);
  if (!(nAge >= 1 && nAge <= 120)) errors.push("Age must be between 1 and 120.");
  if (!isPhone(phone)) errors.push("Phone number format is invalid.");
  if (!agree) errors.push("You must accept the terms.");

  return { errors, nAge };
}

function renderIndex(res, { errorList = [], values = {} , status = 200 }) {
  res.status(status).render("index", {
    errorList,
    values: {
      name: values.name ?? "",
      email: values.email ?? "",
      age: values.age ?? "",
      phone: values.phone ?? "",
      agree: !!values.agree
    }
  });
}

// Routes
app.get("/", (req, res) => renderIndex(res, { errorList: [], values: {} }));

app.post("/submit", (req, res) => {
  const { name, email, age, phone, agree, website } = req.body || {};
  const { errors, nAge } = validateSubmission({
    name,
    email,
    age,
    phone,
    agree: agree === "on" || agree === true,
    website // honeypot
  });

  // If client sent JSON/AJAX, reply JSON; else render/redirect
  const wantsJSON =
    req.headers.accept?.includes("application/json") || req.is("application/json");

  if (errors.length) {
    if (wantsJSON) return res.status(400).json({ ok: false, errors });
    return renderIndex(res, { errorList: errors, values: req.body, status: 400 });
  }

  submissions.push({
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    age: nAge,
    phone: (phone || "").trim(),
    createdAt: new Date().toISOString()
  });

  if (wantsJSON) return res.status(201).json({ ok: true, id: nextId - 1 });
  res.redirect("/submissions");
});

// Submissions (HTML, with search & pagination)
app.get("/submissions", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(25, Math.max(1, parseInt(req.query.limit || "10", 10)));
  let data = submissions;

  if (q) {
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }

  const total = data.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const slice = data.slice(start, end);

  res.render("submissions", {
    submissions: slice,
    total,
    page,
    pages,
    limit,
    q
  });
});

// JSON API (handy for tests/frontends)
app.get("/api/submissions", (req, res) => {
  res.json(submissions);
});

// CSV export (respects ?q= like the table view)
app.get("/export.csv", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();
  let data = submissions;
  if (q) {
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }
  const rows = [
    ["id", "name", "email", "age", "phone", "createdAt"],
    ...data.map((s) => [s.id, s.name, s.email, s.age, s.phone, s.createdAt])
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="submissions.csv"');
  res.send(csv);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Task02 (advanced) on http://localhost:${PORT}`));
