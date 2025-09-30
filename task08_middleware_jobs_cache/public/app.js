const $ = (s) => document.querySelector(s);

// Elements
const elHealth  = $("#health");
const elReport  = $("#report");
const elHeavy   = $("#heavy");
const elEnqueue = $("#enqueue");
const elPoll    = $("#poll");

const btnHealth  = $("#btnHealth");
const btnReport  = $("#btnReport");
const btnHeavy   = $("#btnHeavy");
const btnEnqueue = $("#btnEnqueue");
const btnPoll    = $("#btnPoll");

const inN  = $("#n");
const inNb = $("#nb");

let currentJobId = null;

// Helpers
async function fetchJson(url, opts){
  const r = await fetch(url, opts);
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}
function show(preEl, data){
  preEl.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// Actions
async function getHealth(){
  const data = await fetchJson("/api/health");
  show(elHealth, data);
}
async function getReport(){
  const data = await fetchJson("/api/report");
  show(elReport, data);
}
async function getHeavy(){
  const n = encodeURIComponent(inN.value || "200000");
  const data = await fetchJson(`/api/heavy?n=${n}`);
  show(elHeavy, data);
}
async function enqueue(){
  const n = encodeURIComponent(inNb.value || "250000");
  const data = await fetchJson(`/api/enqueue?n=${n}`, { method: "POST" });
  currentJobId = data?.id || null;
  show(elEnqueue, data);
}
async function poll(){
  if(!currentJobId){ show(elPoll, "enqueue first"); return; }
  const data = await fetchJson(`/api/job/${currentJobId}`);
  show(elPoll, data);
}

// Wire up
btnHealth.addEventListener("click", getHealth);
btnReport.addEventListener("click", getReport);
btnHeavy.addEventListener("click", getHeavy);
btnEnqueue.addEventListener("click", enqueue);
btnPoll.addEventListener("click", poll);

// Initial fetches
getHealth();
getReport();
