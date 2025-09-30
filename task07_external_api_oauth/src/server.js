import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import session from "express-session";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import fetch from "node-fetch";
import helmet from "helmet";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 3006,
  SESSION_SECRET = "dev_secret_change_me",
  GITHUB_CLIENT_ID = "",
  GITHUB_CLIENT_SECRET = "",
  CALLBACK_URL = "http://localhost:3006/auth/github/callback",
  NODE_ENV = "development"
} = process.env;

const app = express();

/** Strict CSP: no inline scripts or styles. */
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "script-src": ["'self'"],            // keep scripts external
      "style-src": ["'self'"],             // keep styles external
      "img-src": ["'self'", "https://avatars.githubusercontent.com", "data:"],
      "font-src": ["'self'"],
      "connect-src": ["'self'", "https://api.github.com"],
      "frame-ancestors": ["'none'"],
      "object-src": ["'none'"],
      "upgrade-insecure-requests": []
    }
  }
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Static: index.html, app.js, styles.css (no inline <script> anywhere)
app.use(express.static(path.join(__dirname, "public"), { index: false }));

// If reverse-proxied, uncomment:
// app.set("trust proxy", 1);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    httpOnly: true,
    secure: NODE_ENV === "production"
  }
}));

app.use(passport.initialize());
// IMPORTANT: restore req.user from the session on every request
app.use(passport.authenticate("session"));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy(
  {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  (accessToken, _refreshToken, profile, done) => {
    // Minimal user in session
    return done(null, {
      id: profile.id,
      username: profile.username,
      avatar: profile.photos?.[0]?.value,
      accessToken
    });
  }
));

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ error: "unauthorized" });
}

// OAuth
app.get("/auth/github", passport.authenticate("github", { scope: ["read:user", "repo"] }));
app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (_req, res) => res.redirect("/")
);

// Session info for UI
app.get("/api/github/user", ensureAuth, (req, res) => {
  const { username, avatar } = req.user;
  res.json({ username, avatar });
});

app.get("/api/github/repos", ensureAuth, async (req, res, next) => {
  try {
    const r = await fetch("https://api.github.com/user/repos?per_page=100", {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
        "User-Agent": "task07-demo"
      }
    });
    if (!r.ok) throw new Error(`GitHub API error ${r.status}`);
    const data = await r.json();
    res.json(data.map(x => ({
      name: x.name,
      private: x.private,
      language: x.language,
      url: x.html_url,
      updated_at: x.updated_at
    })));
  } catch (err) { next(err); }
});

app.post("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session?.destroy(() => res.json({ ok: true }));
  });
});

// App shell
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Errors
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error", detail: err.message });
});

app.listen(PORT, () => console.log(`Task07 http://localhost:${PORT}`));
