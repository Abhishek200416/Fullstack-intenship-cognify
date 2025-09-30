const $ = (s)=>document.querySelector(s);
const signedOut = $("#signedOut");
const signedIn  = $("#signedIn");
const who  = $("#who");
const list = $("#list");
const msg  = $("#msg");
const count= $("#count");
const q    = $("#q");
const avatar = $("#avatar");

function escapeHtml(s){ return String(s).replace(/&/g,"&amp;")
  .replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

// Always include credentials so the session cookie is sent.
async function jget(url){
  const r = await fetch(url, { credentials: "same-origin" });
  if (r.status === 401) return { unauth: true };
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function me(){
  const res = await jget("/api/github/user");
  if (res.unauth) return null;
  return res;
}
async function repos(){
  const r = await fetch("/api/github/repos", { credentials: "same-origin" });
  if (r.status === 401) throw new Error("unauthorized");
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

let cache = [];
function render(){
  const needle = (q.value||"").toLowerCase();
  const items = cache.filter(x =>
    !needle ||
    x.name.toLowerCase().includes(needle) ||
    (x.language||"").toLowerCase().includes(needle)
  );
  list.innerHTML = items.map(x => `
    <li>
      <div class="row">
        <span class="title">${escapeHtml(x.name)}</span>
        <span class="pill">${x.private ? "private" : "public"}</span>
        <span class="pill">${escapeHtml(x.language||"—")}</span>
        <a class="right btn btn-ghost" href="${x.url}" target="_blank" rel="noreferrer">Open</a>
      </div>
      <div class="muted small mt-25">Updated ${new Date(x.updated_at).toLocaleString()}</div>
    </li>
  `).join("");
  count.textContent = items.length;
}

async function boot(){
  try{
    const u = await me();
    if(!u){ signedOut.hidden = false; signedIn.hidden = true; return; }
    signedOut.hidden = true; signedIn.hidden = false;
    who.textContent = u.username;
    if (u.avatar) { avatar.src = u.avatar; avatar.alt = u.username; }

    msg.textContent = "Loading repositories…";
    cache = await repos();
    msg.textContent = cache.length ? "" : "No repositories.";
    render();
  }catch(e){
    signedOut.hidden = false; signedIn.hidden = true;
    console.error(e);
  }
}

$("#logout").addEventListener("click", async ()=>{
  await fetch("/logout", { method:"POST", credentials: "same-origin" });
  location.reload();
});
$("#reload").addEventListener("click", boot);
let t; q.addEventListener("input", ()=>{ clearTimeout(t); t=setTimeout(render,120); });

boot();
