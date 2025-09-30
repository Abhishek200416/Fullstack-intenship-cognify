import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import helmet from "helmet";
import compression from "compression";
import session from "express-session";
import csrf from "csurf";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Views / static
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Core middleware
app.use(helmet());                // secure headers
app.use(compression());           // gzip/deflate
app.use(express.urlencoded({ extended: true }));

// Session + CSRF
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));
const csrfProtection = csrf();
app.use(csrfProtection);

// Rate limit POSTs to reduce spam
const submitLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/submit", submitLimiter);

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    errorList: [],
    values: { name: "", email: "", message: "" },
    csrfToken: req.csrfToken()
  });
});

const validators = [
  body("name")
    .trim()
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters.")
    .escape(),
  body("email")
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("message")
    .trim()
    .isLength({ min: 5, max: 1000 }).withMessage("Message must be 5–1000 characters.")
    .escape(),
  // Honeypot (should stay empty)
  body("website").custom(v => {
    if (v && v.trim() !== "") throw new Error("Bot detected.");
    return true;
  })
];

app.post("/submit", validators, (req, res) => {
  const errors = validationResult(req);
  const { name = "", email = "", message = "" } = req.body || {};

  if (!errors.isEmpty()) {
    return res.status(400).render("index", {
      errorList: errors.array().map(e => e.msg),
      values: { name, email, message },
      csrfToken: req.csrfToken()
    });
  }

  // In real apps you'd persist here (DB/queue/email)
  res.render("result", { name, email, message });
});

// 404
app.use((req, res) => res.status(404).send("Not Found"));

// Error handler (keeps CSRF errors clean)
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Invalid CSRF token.");
  }
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Task01 (advanced) listening on http://localhost:${PORT}`)
);
