/* Advanced validation + dynamic DOM for Account view */
(function(){
  const LS_KEY = "t4_draft_v1";
  const SR = document.getElementById("srLive");

  // Demo "taken" usernames
  const takenUsernames = new Set(["admin","root","system","test","user","abhishek"]);

  // Patterns
  const emailRe = /^\S+@\S+\.\S+$/;
  const unameRe = /^[A-Za-z0-9_]{3,24}$/;

  // Rules + simple blacklist
  const blackList = new Set(["password","12345678","qwertyui","iloveyou","admin123","letmein"]);
  const reqs = [
    { name:"≥ 8 chars",  test: s => s.length >= 8 },
    { name:"Uppercase",  test: s => /[A-Z]/.test(s) },
    { name:"Lowercase",  test: s => /[a-z]/.test(s) },
    { name:"Number",     test: s => /\d/.test(s) },
    { name:"Symbol",     test: s => /[^\w\s]/.test(s) },
    { name:"Not common", test: s => !blackList.has((s||"").toLowerCase()) }
  ];

  // Lightweight entropy-ish score
  function strengthScore(pw){
    if (!pw) return 0;
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
    const entropy = Math.log2(Math.max(pool,1)) * pw.length;
    const base = reqs.reduce((a,r)=>a+(r.test(pw)?1:0),0);
    return Math.min(100, Math.round((entropy/120)*65 + (base/6)*35));
  }
  const strengthLabel = s => s<30?"Very weak":s<50?"Weak":s<70?"OK":s<85?"Strong":"Excellent";

  // Debounce
  const debounce = (fn, ms=300) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  // Fake async username check
  const checkUsername = debounce(async (u, elHelp) => {
    if (!u || !unameRe.test(u)) {
      setHelp(elHelp, "3–24 chars; letters/numbers/underscore.", false);
      elHelp.dataset.ok = "no"; return;
    }
    await new Promise(r => setTimeout(r, 300));
    if (takenUsernames.has(u.toLowerCase())) {
      setHelp(elHelp, "Username is taken.", false);
      elHelp.dataset.ok = "no";
    } else {
      setHelp(elHelp, "Username available ✓", true);
      elHelp.dataset.ok = "ok";
    }
  }, 250);

  function setHelp(node, text, ok){
    node.textContent = text;
    node.classList.toggle("ok", !!ok);
    node.classList.toggle("no", ok===false);
  }
  function saveDraft(state){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch{} }
  function loadDraft(){ try{ const r=localStorage.getItem(LS_KEY); return r?JSON.parse(r):null; }catch{ return null; } }
  function announce(msg){ SR && (SR.textContent = msg); }

  function mountAccount(){
    const $ = s => document.querySelector(s);
    const form = $("#acctForm");
    const username = $("#username");
    const uHelp = $("#uHelp");
    const email = $("#email");
    const pw = $("#pw");
    const caps = $("#caps");
    const pwBar = $("#pwBar");
    const pwBadges = $("#pwBadges");
    const pwLabel = $("#pwLabel");
    const bio = $("#bio");
    const bioCount = $("#bioCount");
    const err = $("#err");
    const togglePw = $("#togglePw");
    const clearDraftBtn = $("#clearDraft");

    // Restore draft
    const draft = loadDraft();
    if (draft) {
      username.value = draft.username || "";
      email.value = draft.email || "";
      pw.value = draft.pw || "";
      bio.value = draft.bio || "";
    }

    // Live UI updates
    function update(){
      checkUsername(username.value.trim(), uHelp);

      // Email
      const eok = emailRe.test(email.value.trim());
      email.classList.toggle("is-invalid", !!email.value && !eok);
      email.classList.toggle("is-valid", !!email.value && eok);

      // Password
      const val = pw.value;
      const score = strengthScore(val);
      pwBar.style.width = score + "%";
      pwBar.style.background =
        score < 50 ? "linear-gradient(90deg,#ef4444,#f59e0b)" :
        score < 80 ? "linear-gradient(90deg,#f59e0b,#10b981)" :
                     "linear-gradient(90deg,#10b981,#34d399)";
      pwLabel.textContent = `Strength: ${strengthLabel(score)} • ${score}`;
      pwBadges.innerHTML = reqs.map(r => `<span class="rule-badge ${r.test(val)?'ok':'no'}">${r.name}</span>`).join("");

      // Bio counter
      bioCount.textContent = (bio.value || "").length;

      // Persist
      saveDraft({ username: username.value, email: email.value, pw: pw.value, bio: bio.value });
      err.textContent = "";
    }

    // CapsLock indicator
    pw.addEventListener("keydown", e => { caps.hidden = !(e.getModifierState && e.getModifierState("CapsLock")); });
    pw.addEventListener("keyup",   e => { caps.hidden = !(e.getModifierState && e.getModifierState("CapsLock")); });

    // Toggle password visibility
    togglePw.addEventListener("click", () => {
      pw.type = pw.type === "password" ? "text" : "password";
      togglePw.textContent = pw.type === "password" ? "👁️" : "🙈";
      pw.focus();
    });

    // Clear draft
    clearDraftBtn.addEventListener("click", ()=>{
      localStorage.removeItem(LS_KEY);
      username.value = email.value = pw.value = bio.value = "";
      update(); announce("Draft cleared."); toast("Draft cleared");
    });

    // Input handlers (scoped)
    form.addEventListener("input", update);

    // Initial paint
    update();

    // Submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = username.value.trim();
      const okUname = unameRe.test(u) && uHelp.dataset.ok === "ok";
      const okEmail = emailRe.test(email.value.trim());
      const score = strengthScore(pw.value);
      const okPw = score >= 70;
      const okBio = (bio.value || "").length <= 240;

      const problems = [];
      if (!okUname) problems.push("Choose an available username (3–24 chars).");
      if (!okEmail) problems.push("Enter a valid email.");
      if (!okPw) problems.push("Use a stronger password (score ≥ 70).");
      if (!okBio) problems.push("Bio must be ≤ 240 chars.");

      if (problems.length) {
        err.innerHTML = problems.map(p=>`• ${p}`).join("<br>");
        announce("Form has issues. Check messages.");
        toast("Please fix the highlighted issues");
        return;
      }

      localStorage.removeItem(LS_KEY);
      announce("Account created.");
      toast("Account created (demo)!");
      setTimeout(()=> location.hash = "/home", 600);
    });
  }

  // Tiny toast
  let toastEl;
  function toast(msg){
    if (!toastEl){
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(()=> toastEl.classList.remove("show"), 1200);
  }

  // expose
  window.Task4UI = { mountAccount };
})();
