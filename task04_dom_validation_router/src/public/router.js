/* Mini hash router with transitions, active-link sync, scroll/restore & 404 */
const routes = {
  "/home": renderHome,
  "/about": renderAbout,
  "/account": renderAccount,
};

const app = document.getElementById("app");
const navLinks = () => Array.from(document.querySelectorAll("[data-link]"));
const routeState = new Map(); // remember scroll per route

function renderHome() {
  return /*html*/`
    <section class="container slide">
      <div class="card">
        <h2 class="fw-800">Home</h2>
        <p class="muted">Navigate to <a href="#/account" data-link>Account</a> for advanced validation and live DOM updates.</p>
      </div>
    </section>`;
}

function renderAbout() {
  return /*html*/`
    <section class="container slide">
      <div class="card">
        <h2 class="fw-800">About</h2>
        <p>Minimal SPA with a hash router, transitions, a11y focus management, and state restore.</p>
        <ul class="muted">
          <li>Active link highlighting</li>
          <li>Scroll/Focus restore per route</li>
          <li>LocalStorage draft + theme persistence</li>
        </ul>
      </div>
    </section>`;
}

function renderAccount() {
  return /*html*/`
    <section class="container slide">
      <div class="card">
        <h2 class="fw-800">Create account</h2>

        <form id="acctForm" class="form-grid" novalidate>
          <div>
            <label>Username</label>
            <input id="username" name="username" autocomplete="off" placeholder="abhi_xyz" />
            <div class="helper" id="uHelp">3–24 chars; letters/numbers/underscore. Availability checked live.</div>
          </div>

          <div>
            <label>Email</label>
            <input id="email" name="email" type="email" placeholder="you@site.com" />
            <div class="helper">Must be a valid email.</div>
          </div>

          <div class="full">
            <label>Password <span id="caps" class="caps" hidden>Caps Lock ON</span></label>
            <div class="hstack">
              <input id="pw" name="pw" type="password" placeholder="Strong password" autocomplete="new-password"/>
              <button id="togglePw" class="btn btn-ghost" type="button" title="Show/Hide">👁️</button>
            </div>
            <div class="meter" aria-hidden="true"><div id="pwBar"></div></div>
            <div id="pwBadges" class="wrap" style="margin-top:.4rem"></div>
            <div class="helper" id="pwLabel">Strength: —</div>
          </div>

          <div class="full">
            <label>Bio <span class="rule-badge" id="bioCount">0</span></label>
            <textarea id="bio" name="bio" rows="4" placeholder="Tell us something cool…" maxlength="240"></textarea>
            <div class="helper">0–240 characters.</div>
          </div>

          <div class="full hstack" style="justify-content:flex-end; margin-top:.6rem">
            <button class="btn btn-brand" type="submit">Create</button>
            <button id="clearDraft" class="btn btn-ghost" type="button" title="Clear saved draft">Clear draft</button>
          </div>

          <div id="err" class="helper" role="alert"></div>
        </form>
      </div>
    </section>`;
}

/* Router core */
const getHash = () => location.hash.replace("#","") || "/home";

function setActiveLink() {
  const cur = getHash();
  navLinks().forEach(a => {
    const is = a.getAttribute("href") === `#${cur}`;
    a.classList.toggle("active", is);
    if (is) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
  });
}

function saveScroll(route){ routeState.set(route, {y: window.scrollY}); }
function restoreScroll(route){ const s = routeState.get(route); if (s) window.scrollTo({top:s.y, behavior:"instant"}); }

function render() {
  const route = getHash();
  const view = routes[route] || (() => `
    <section class="container slide"><div class="card">
      <h2>404</h2><p>Route <code>${route}</code> not found.</p>
      <p><a data-link href="#/home">Back to Home</a></p>
    </div></section>
  `);

  saveScroll(route);
  app.classList.remove("fade-in"); void app.offsetWidth; app.classList.add("fade-in");
  app.innerHTML = view();
  setActiveLink();

  // Focus first heading for a11y
  const h = app.querySelector("h1,h2,h3,h4,h5"); if (h) h.setAttribute("tabindex","-1"), h.focus();
  restoreScroll(route);

  // Init per-view behavior
  if (route === "/account") window.Task4UI?.mountAccount();
}

window.addEventListener("hashchange", render);
window.addEventListener("load", () => {
  document.getElementById("y").textContent = new Date().getFullYear();

  // Theme persistence (icon only; variables updated in index.html script)
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeBtn");
  const savedTheme = localStorage.getItem("t4_theme") || "light";
  root.setAttribute("data-theme", savedTheme);
  themeBtn.innerHTML = `<span class="material-symbols-rounded">${savedTheme==='dark'?'light_mode':'dark_mode'}</span>`;

  render();
});
