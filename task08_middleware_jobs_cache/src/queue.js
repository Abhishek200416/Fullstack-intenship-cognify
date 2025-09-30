import cron from "node-cron";
import { heavyCompute } from "./heavy.js";

/**
 * In-memory queue: jobs map + simple processor.
 * This is a teaching-friendly version; one process only.
 */

const jobs = new Map(); // id -> { id, state, result, error }
let nextId = 1;

function addJob(n = 200000) {
  const id = String(nextId++);
  const job = { id, state: "queued", result: null, error: null, n };
  jobs.set(id, job);

  // Process asynchronously so the HTTP response returns quickly
  setImmediate(() => {
    try {
      job.state = "active";
      const value = heavyCompute(n);
      job.result = { value, n, at: new Date().toISOString() };
      job.state = "completed";
    } catch (e) {
      job.state = "failed";
      job.error = e.message || String(e);
    }
  });

  return id;
}

function getJob(id) {
  const j = jobs.get(id);
  if (!j) return { found: false };
  return {
    found: true,
    id: j.id,
    state: j.state,
    result: j.result,
    error: j.error
  };
}

/** Scheduled “report” that recomputes once per minute and is kept in memory */
let latestReport = { generatedAt: null, value: null, n: null };
cron.schedule("* * * * *", () => {
  const n = 150000;
  const value = heavyCompute(n);
  latestReport = {
    generatedAt: new Date().toISOString(),
    value,
    n
  };
  // eslint-disable-next-line no-console
  console.log("[cron] report rebuilt at", latestReport.generatedAt);
});

export function queue() {
  return {
    addJob,
    getJob,
    getLatestReport: () => latestReport
  };
}
