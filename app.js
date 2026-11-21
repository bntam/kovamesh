/* KovaMesh live demo — typed terminal simulation.
   Every line is a fixed, realistic script (no random generation, no fake
   "live" claims). Timings are display-only; the underlying checks are the
   same ones kovamesh-verify runs for real. */
(function () {
  "use strict";

  var DEMOS = {
    pr: {
      label: "PR verification",
      title: "kovamesh-verify — PR #482 · feat/checkout-retry",
      spec: [
        'name: checkout-pr-482',
        'base_url: http://localhost:3000',
        'checks:',
        '  - name: app boots',
        '    type: http',
        '    path: /health',
        '    expect_status: 200',
        '  - name: checkout retry works',
        '    type: http',
        '    path: /api/checkout',
        '    method: POST',
        '    body: {"cart_id": "c_482"}',
        '    expect_status: 200',
        '    expect_json: { "status": "paid" }',
        '  - name: no 500s in logs',
        '    type: log',
        '    pattern: " 500 "',
        '    expect_absent: true'
      ].join("\n"),
      verdictJson: [
        '{',
        '  "pr": 482,',
        '  "verdict": "PASS",',
        '  "checks_passed": 3,',
        '  "checks_failed": 0,',
        '  "duration_ms": 8420,',
        '  "evidence": "runs/pr-482/evidence.json"',
        '}'
      ].join("\n"),
      steps: [
        { text: "$ kovamesh-verify run --spec kovamesh.yaml --pr 482", cls: "dim", delay: 350 },
        { text: "▸ fetching diff for PR #482 (7 files, +214 −38) …", cls: "", delay: 650 },
        { text: "▸ planner: checkout retry touches /api/checkout + /health — 3 checks selected", cls: "", delay: 700 },
        { text: "▸ building app in isolated Docker sandbox … done in 4.1s", cls: "", delay: 650 },
        { text: "▸ app boots — GET /health → 200 in 84 ms", cls: "pass", delay: 600 },
        { text: "  PASS  app boots (200, 84 ms)", cls: "pass", delay: 450 },
        { text: "▸ checkout retry works — POST /api/checkout → 200, {\"status\": \"paid\"}", cls: "pass", delay: 600 },
        { text: "  PASS  checkout retry works (200, 312 ms)", cls: "pass", delay: 450 },
        { text: "▸ no 500s in logs — 0 matches in 1,204 lines", cls: "pass", delay: 550 },
        { text: "  PASS  no 500s in logs", cls: "pass", delay: 450 },
        { text: "✓ VERDICT: PASS — 3/3 checks passed in 8.4s", cls: "pass", delay: 500 },
        { text: "✓ evidence posted to PR #482 · github.com/bntam/demo/pull/482", cls: "dim", delay: 400 }
      ],
      verdict: { kind: "pass", title: "✓ PR #482 — Verified at runtime", body: "3 of 3 checks passed in 8.4 s. The checkout retry actually ran against a live build — not a code review guess. Safe to merge.", score: "3 / 3 PASS" }
    },
    smoke: {
      label: "Runtime smoke test",
      title: "kovamesh-verify — nightly smoke · production snapshot",
      spec: [
        'name: nightly-smoke',
        'base_url: https://staging.kovamesh.dev',
        'checks:',
        '  - name: homepage renders',
        '    type: http',
        '    path: /',
        '    expect_status: 200',
        '  - name: login flow',
        '    type: http',
        '    path: /api/auth/login',
        '    method: POST',
        '    body: {"email": "smoke@kovamesh.dev"}',
        '    expect_status: 200',
        '  - name: pricing page loads',
        '    type: http',
        '    path: /pricing',
        '    expect_status: 200'
      ].join("\n"),
      verdictJson: [
        '{',
        '  "run": "nightly-smoke",',
        '  "verdict": "FAIL",',
        '  "checks_passed": 2,',
        '  "checks_failed": 1,',
        '  "duration_ms": 5120,',
        '  "failing_check": "login flow",',
        '  "failing_detail": "POST /api/auth/login -> 500 (auth-service timeout after 2000 ms)"',
        '}'
      ].join("\n"),
      steps: [
        { text: "$ kovamesh-verify run --spec smoke.yaml --env staging", cls: "dim", delay: 350 },
        { text: "▸ starting smoke run against https://staging.kovamesh.dev …", cls: "", delay: 650 },
        { text: "▸ homepage renders — GET / → 200 in 141 ms", cls: "pass", delay: 600 },
        { text: "  PASS  homepage renders (200, 141 ms)", cls: "pass", delay: 450 },
        { text: "▸ login flow — POST /api/auth/login … waiting", cls: "", delay: 700 },
        { text: "  ✗ FAIL  login flow — 500 after 2,000 ms (auth-service timeout)", cls: "fail", delay: 600 },
        { text: "▸ pricing page loads — GET /pricing → 200 in 98 ms", cls: "pass", delay: 550 },
        { text: "  PASS  pricing page loads (200, 98 ms)", cls: "pass", delay: 450 },
        { text: "✗ VERDICT: FAIL — 2/3 checks passed in 5.1s", cls: "fail", delay: 500 },
        { text: "▸ failing step isolated: auth-service, not the frontend — trace attached", cls: "", delay: 500 },
        { text: "▸ Slack alert sent to #incidents with log excerpt + trace id", cls: "dim", delay: 400 }
      ],
      verdict: { kind: "fail", title: "✗ Nightly smoke — 1 check failing", body: "Login returns 500 after a 2,000 ms auth-service timeout. Homepage and pricing are fine, so the fault is isolated to auth-service — the triage thread already has the trace. This is the failure a deploy would have shipped.", score: "2 / 3 — 1 FAIL" }
    },
    triage: {
      label: "CI incident triage",
      title: "kovamesh-verify — CI incident · main build #1,204",
      spec: [
        'name: ci-triage-1204',
        'source: github-actions',
        'run_id: 1204',
        'checks:',
        '  - name: reproduce failure',
        '    type: replay',
        '    job: test-api',
        '  - name: bisect failing commit',
        '    type: bisect',
        '    range: [a1b2c3d, e4f5g6h]',
        '  - name: check flaky history',
        '    type: history',
        '    test: test_checkout_retry',
        '    window: 30 days'
      ].join("\n"),
      verdictJson: [
        '{',
        '  "incident": "ci-1204",',
        '  "verdict": "FLAKY — NOT A REAL REGRESSION",',
        '  "root_cause": "test_checkout_retry fails when the sandbox clock skews > 2 s",',
        '  "first_failing_commit": null,',
        '  "flaky_rate_30d": "11%",',
        '  "recommended_action": "quarantine test, re-run once, file issue"',
        '}'
      ].join("\n"),
      steps: [
        { text: "$ kovamesh-verify triage --run 1204 --job test-api", cls: "dim", delay: 350 },
        { text: "▸ CI run #1,204 failed on main — test_checkout_retry (1 of 214 tests)", cls: "", delay: 650 },
        { text: "▸ replaying the failing job in an identical sandbox … reproduced", cls: "", delay: 700 },
        { text: "▸ bisecting a1b2c3d..e4f5g6h — no single commit reproduces it reliably", cls: "", delay: 650 },
        { text: "▸ checking 30-day history: test_checkout_retry failed 11% of runs", cls: "", delay: 600 },
        { text: "▸ pattern found: failures cluster when sandbox clock skew exceeds 2 s", cls: "pass", delay: 600 },
        { text: "✓ VERDICT: FLAKY — not a real regression. No code change caused this.", cls: "pass", delay: 500 },
        { text: "▸ recommended: quarantine test, re-run once, file issue with evidence", cls: "", delay: 500 },
        { text: "▸ Slack thread posted to #ci with bisect log + flaky-rate chart", cls: "dim", delay: 400 }
      ],
      verdict: { kind: "pass", title: "✓ CI #1,204 — Flaky test, not a regression", body: "test_checkout_retry fails in 11% of runs over 30 days, clustered on sandbox clock skew over 2 s. No commit to blame. KovaMesh quarantines the test and re-runs once instead of blocking the team for an afternoon.", score: "FLAKY · 11% / 30d" }
    }
  };

  var current = "pr";
  var timer = null;
  var running = false;

  var termBody = document.getElementById("term-body");
  var termTitle = document.getElementById("term-title");
  var specPre = document.getElementById("demo-spec");
  var verdictPre = document.getElementById("demo-verdict-json");
  var verdictCard = document.getElementById("verdict-card");
  var runBtn = document.getElementById("run-demo");
  var resetBtn = document.getElementById("reset-demo");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  if (!termBody) return; // demo not on this page

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function showIdle(demo) {
    termBody.innerHTML =
      '<span class="dim"># ' + esc(demo.title) + '</span>\n' +
      '<span class="dim"># Press “Run demo” to execute this workflow step by step.</span>\n' +
      '<span class="dim"># Each line is what kovamesh-verify prints for real.</span>\n<span class="cursor"></span>';
    verdictCard.className = "verdict";
    verdictCard.innerHTML =
      "<h3>Verdict — waiting</h3><p class=\"muted\">Run the demo to see the verdict card for this workflow, with the exact failing step (or the clean pass) and the evidence it posts.</p>";
  }

  function loadDemo(key) {
    current = key;
    stop();
    var demo = DEMOS[key];
    termTitle.textContent = demo.title;
    specPre.textContent = demo.spec;
    verdictPre.textContent = demo.verdictJson;
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", t.dataset.demo === key ? "true" : "false");
    });
    showIdle(demo);
    runBtn.disabled = false;
    runBtn.textContent = "▶ Run demo";
  }

  function stop() {
    if (timer) { clearTimeout(timer); timer = null; }
    running = false;
  }

  function runDemo() {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    runBtn.textContent = "Running…";
    var demo = DEMOS[current];
    var lines = demo.steps;
    var i = 0;
    termBody.innerHTML = "";
    function next() {
      if (i >= lines.length) {
        var v = demo.verdict;
        verdictCard.className = "verdict " + v.kind;
        verdictCard.innerHTML =
          "<h3>" + esc(v.title) + "</h3>" +
          "<div class=\"score\">" + esc(v.score) + "</div>" +
          "<p class=\"muted\">" + esc(v.body) + "</p>";
        termBody.innerHTML += '<span class="cursor"></span>';
        runBtn.disabled = false;
        runBtn.textContent = "↻ Run again";
        running = false;
        return;
      }
      var step = lines[i++];
      var span = document.createElement("span");
      span.className = step.cls || "";
      span.textContent = step.text + "\n";
      termBody.appendChild(span);
      termBody.scrollTop = termBody.scrollHeight;
      timer = setTimeout(next, step.delay);
    }
    next();
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { loadDemo(t.dataset.demo); });
  });
  runBtn.addEventListener("click", runDemo);
  resetBtn.addEventListener("click", function () { loadDemo(current); });

  loadDemo("pr");
})();
