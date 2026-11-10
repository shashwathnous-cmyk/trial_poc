function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

export function stylesheet() {
  return `
    :root { color-scheme: light; --ink: #17202a; --muted: #5c6b7a; --line: #d5dde6; --panel: #fff; --bg: #f3f6f8; --accent: #0b4f9c; --accent-ink: #fff; --ok: #0d6b3f; --danger: #9d1c2e; }
    * { box-sizing: border-box; }
    body { margin: 0; font: 16px/1.45 "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); }
    a { color: var(--accent); }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 16px 24px; background: #10283f; color: #fff; }
    header a, header button.link { color: #fff; }
    header nav { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
    main { max-width: 980px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 1.6rem; margin: 0 0 8px; }
    h2 { font-size: 1.15rem; margin: 24px 0 8px; }
    p.note, .muted { color: var(--muted); }
    form, .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin: 16px 0; }
    label { display: block; font-weight: 600; margin: 12px 0 4px; }
    input, select, textarea, button { font: inherit; }
    input, select, textarea { width: 100%; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: #fff; }
    textarea { min-height: 180px; }
    .row { display: grid; grid-template-columns: 1fr 140px auto; gap: 12px; align-items: end; }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
    button { background: var(--accent); color: var(--accent-ink); border: 0; border-radius: 6px; padding: 8px 14px; cursor: pointer; }
    button.secondary { background: #e7eef5; color: var(--ink); }
    button.link { background: transparent; padding: 0; }
    table { width: 100%; border-collapse: collapse; background: var(--panel); }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
    .status { min-height: 1.4em; margin: 8px 0; font-weight: 600; }
    .status.error { color: var(--danger); }
    .status.ok { color: var(--ok); }
    .total { font-size: 1.4rem; margin: 8px 0; }
    @media (max-width: 720px) {
      header, .row { display: block; }
      header nav { margin-top: 8px; }
      .row > * { margin-top: 8px; }
      main { padding: 16px; }
    }
  `;
}

function layout({ title, user, body }) {
  const nav = user ? navigation(user) : `<a href="/login">Sign in</a>`;
  const who = user ? `<span>${escapeHtml(user.username)}</span>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <strong>Availability and pricing</strong>
    <nav>${nav}${who}</nav>
  </header>
  <main>
    <h1>${escapeHtml(title)}</h1>
    ${body}
  </main>
</body>
</html>`;
}

function navigation(user) {
  const admin = user.role === "system-administrator";
  const links = admin
    ? [["/load-balancer", "Load balancer"], ["/redundancy", "Redundancy"], ["/discount-logs", "Discount audit"]]
    : [["/quotes", "Quote"], ["/discount-logs", "My discount log"]];
  return `${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join("")}<button class="link" type="button" id="sign-out">Sign out</button>
  <script>
    document.getElementById("sign-out").addEventListener("click", async () => {
      await fetch("/api/session", { method: "DELETE" });
      location.href = "/login";
    });
  </script>`;
}

function denied(user) {
  return layout({
    title: "Access denied",
    user,
    body: `<p class="status error" role="alert">You do not have access to this page.</p><p><a href="${user ? (user.role === "system-administrator" ? "/load-balancer" : "/quotes") : "/login"}">Continue</a></p>`
  });
}

export function pageFor(path, user) {
  if (path === "/" || path === "/login") {
    return { status: 200, body: loginPage(user) };
  }
  const pages = {
    "/load-balancer": { role: "system-administrator", render: loadBalancerPage },
    "/redundancy": { role: "system-administrator", render: redundancyPage },
    "/quotes": { role: "sales-representative", render: quotePage },
    "/discount-logs": { role: null, render: auditPage }
  };
  const page = pages[path];
  if (!page) return null;
  if (!user) {
    return { status: 401, body: layout({ title: "Sign in required", user: null, body: `<p class="status error" role="alert">Sign in to continue.</p><p><a href="/login">Sign in</a></p>` }) };
  }
  if (page.role && user.role !== page.role) {
    return { status: 403, body: denied(user) };
  }
  return { status: 200, body: page.render(user) };
}

function loginPage(user) {
  return layout({
    title: "Sign in",
    user,
    body: `
      <form id="login">
        <label for="username">Username</label>
        <input id="username" name="username" autocomplete="username" required>
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
        <div class="actions"><button type="submit">Sign in</button></div>
        <p id="login-status" class="status" role="status"></p>
      </form>
      <p class="note">System administrator: admin / admin-pass. Sales representatives: sam / sam-pass and pat / pat-pass.</p>
      <script>
        const form = document.getElementById("login");
        const status = document.getElementById("login-status");
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          status.className = "status";
          status.textContent = "Signing in…";
          const response = await fetch("/api/session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: form.username.value, password: form.password.value })
          });
          const body = await response.json();
          if (!response.ok) {
            status.className = "status error";
            status.textContent = body.error;
            return;
          }
          location.href = body.user.role === "system-administrator" ? "/load-balancer" : "/quotes";
        });
      </script>`
  });
}

function loadBalancerPage(user) {
  return layout({
    title: "Load balancer",
    user,
    body: `
      <p class="note">Choose at least two servers and a method. Saving applies the pool to application traffic. Session persistence is not configured. The method changes only when you save it; it does not switch automatically.</p>
      <form id="lb-form">
        <div id="servers"></div>
        <div class="actions"><button type="button" class="secondary" id="add-server">Add server</button></div>
        <label for="method">Load balancing method</label>
        <select id="method">
          <option value="round-robin">Round robin</option>
          <option value="least-connections">Least connections</option>
        </select>
        <div class="actions"><button type="submit">Save configuration</button></div>
        <p id="lb-status" class="status" role="status"></p>
      </form>
      <h2>Traffic and performance</h2>
      <div class="panel"><table><thead><tr><th>Server</th><th>Requests</th><th>Active connections</th><th>Share</th><th>Last response (ms)</th></tr></thead><tbody id="metrics"></tbody></table>
      <p id="even" class="muted"></p></div>
      <script>
        const servers = document.getElementById("servers");
        const status = document.getElementById("lb-status");
        function serverFields(server = { id: "", name: "", address: "" }) {
          const wrap = document.createElement("div");
          wrap.className = "row";
          wrap.innerHTML = '<label>Id <input class="sid" required value="' + server.id + '"></label><label>Name <input class="sname" required value="' + server.name + '"></label><label>Address <input class="saddress" required value="' + server.address + '"></label>';
          servers.appendChild(wrap);
        }
        document.getElementById("add-server").addEventListener("click", () => serverFields());
        serverFields({ id: "app-a", name: "App A", address: "10.0.0.1" });
        serverFields({ id: "app-b", name: "App B", address: "10.0.0.2" });
        async function refreshMetrics() {
          const response = await fetch("/api/loadbalancer/metrics");
          if (!response.ok) return;
          const body = await response.json();
          const tbody = document.getElementById("metrics");
          tbody.replaceChildren();
          for (const server of body.servers || []) {
            const row = document.createElement("tr");
            row.innerHTML = "<td>" + server.name + "</td><td>" + server.requestCount + "</td><td>" + server.activeConnections + "</td><td>" + Math.round(server.share * 100) + "%</td><td>" + server.lastElapsedMs.toFixed(2) + "</td>";
            tbody.appendChild(row);
          }
          document.getElementById("even").textContent = body.applied ? (body.even ? "Traffic is even across configured servers." : "Traffic counts differ by more than one request.") : "No configuration is applied yet.";
        }
        document.getElementById("lb-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          status.className = "status";
          status.textContent = "Saving…";
          const payload = {
            method: document.getElementById("method").value,
            servers: [...servers.querySelectorAll(".row")].map((row) => ({
              id: row.querySelector(".sid").value,
              name: row.querySelector(".sname").value,
              address: row.querySelector(".saddress").value
            }))
          };
          const response = await fetch("/api/loadbalancer/config", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
          const body = await response.json();
          status.className = response.ok ? "status ok" : "status error";
          status.textContent = response.ok ? "Configuration saved and applied." : body.error;
          refreshMetrics();
        });
        refreshMetrics();
        setInterval(refreshMetrics, 3000);
      </script>`
  });
}

function redundancyPage(user) {
  return layout({
    title: "Redundancy and failover",
    user,
    body: `
      <p class="note">Scope is application servers only. Replication is realtime. Manual failover is not available.</p>
      <form id="redundancy-form">
        <h2>Primary application server</h2>
        <div class="row">
          <label>Id <input id="primary-id" required value="primary-app"></label>
          <label>Name <input id="primary-name" required value="Primary app"></label>
          <label>Address <input id="primary-address" required value="10.0.1.1"></label>
        </div>
        <h2>Backup application servers</h2>
        <div id="backups"></div>
        <div class="actions"><button type="button" class="secondary" id="add-backup">Add backup</button></div>
        <label for="replication">Replication mode</label>
        <select id="replication"><option value="realtime">Realtime</option></select>
        <div class="actions"><button type="submit">Save redundancy</button></div>
        <p id="redundancy-status" class="status" role="status"></p>
      </form>
      <h2>Health</h2>
      <div class="panel"><table><thead><tr><th>Server</th><th>Role</th><th>Health</th><th>Active</th><th>Revision</th></tr></thead><tbody id="health"></tbody></table></div>
      <form id="health-form" class="panel">
        <label for="health-server">Report application server health</label>
        <input id="health-server" required placeholder="Server id">
        <label for="health-value">Healthy</label>
        <select id="health-value"><option value="true">Healthy</option><option value="false">Unhealthy</option></select>
        <div class="actions">
          <button type="submit">Report health</button>
          <button type="button" class="secondary" id="test-failover">Run test failover</button>
          <button type="button" class="secondary" id="quarterly">Record quarterly test</button>
        </div>
        <p id="failover-status" class="status" role="status"></p>
      </form>
      <h2>Failover runbook</h2>
      <form id="doc-form">
        <label for="runbook">Documentation</label>
        <textarea id="runbook" required></textarea>
        <div class="actions"><button type="submit">Save documentation</button></div>
        <p id="doc-status" class="status" role="status"></p>
      </form>
      <h2>Quarterly test evidence</h2>
      <div class="panel"><ul id="tests"></ul></div>
      <script>
        const status = document.getElementById("redundancy-status");
        const failoverStatus = document.getElementById("failover-status");
        const backups = document.getElementById("backups");
        function backupFields(server = { id: "", name: "", address: "" }) {
          const wrap = document.createElement("div");
          wrap.className = "row";
          for (const [className, label, value] of [["bid", "Id", server.id], ["bname", "Name", server.name], ["baddress", "Address", server.address]]) {
            const field = document.createElement("label");
            field.append(document.createTextNode(label + " "));
            const input = document.createElement("input");
            input.className = className;
            input.required = true;
            input.value = value;
            field.append(input);
            wrap.append(field);
          }
          backups.appendChild(wrap);
        }
        document.getElementById("add-backup").addEventListener("click", () => backupFields());
        backupFields({ id: "backup-app", name: "Backup app", address: "10.0.1.2" });
        async function loadDoc() {
          const response = await fetch("/api/redundancy/documentation");
          if (response.ok) document.getElementById("runbook").value = (await response.json()).text;
          const tests = await fetch("/api/redundancy/quarterly-tests");
          const list = document.getElementById("tests");
          list.replaceChildren();
          if (!tests.ok) return;
          for (const test of (await tests.json()).tests) {
            const item = document.createElement("li");
            item.textContent = test.quarter + " " + (test.passed ? "passed" : "failed") + " in " + test.switchDurationMs.toFixed(2) + " ms; integrity " + (test.integrityOk ? "matched" : "did not match");
            list.appendChild(item);
          }
        }
        async function refreshHealth() {
          const response = await fetch("/api/redundancy/health");
          const tbody = document.getElementById("health");
          tbody.replaceChildren();
          if (!response.ok) return;
          for (const server of (await response.json()).servers) {
            const row = document.createElement("tr");
            row.innerHTML = "<td>" + server.name + "</td><td>" + server.role + "</td><td>" + (server.healthy ? "Healthy" : "Unhealthy") + "</td><td>" + (server.active ? "Active" : "") + "</td><td>" + server.revision + "</td>";
            tbody.appendChild(row);
          }
        }
        document.getElementById("redundancy-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          const response = await fetch("/api/redundancy/config", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              primary: { id: document.getElementById("primary-id").value, name: document.getElementById("primary-name").value, address: document.getElementById("primary-address").value, componentType: "application-server" },
              backups: [...backups.querySelectorAll(".row")].map((row) => ({
                id: row.querySelector(".bid").value,
                name: row.querySelector(".bname").value,
                address: row.querySelector(".baddress").value,
                componentType: "application-server"
              })),
              replication: { mode: document.getElementById("replication").value }
            })
          });
          const body = await response.json();
          status.className = response.ok ? "status ok" : "status error";
          status.textContent = response.ok ? "Redundancy saved. Realtime replication is on." : body.error;
          refreshHealth();
        });
        document.getElementById("health-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          const response = await fetch("/api/redundancy/health", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ serverId: document.getElementById("health-server").value, healthy: document.getElementById("health-value").value === "true" })
          });
          const body = await response.json();
          failoverStatus.className = response.ok ? "status ok" : "status error";
          failoverStatus.textContent = !response.ok ? body.error : (body.switched ? "Switched to " + body.activeId + " in " + body.switchDurationMs.toFixed(2) + " ms." : "Health recorded.");
          refreshHealth();
        });
        async function postFailover(path, okText) {
          const response = await fetch(path, { method: "POST" });
          const body = await response.json();
          failoverStatus.className = response.ok ? "status ok" : "status error";
          failoverStatus.textContent = response.ok ? okText(body) : body.error;
          refreshHealth();
          loadDoc();
        }
        document.getElementById("test-failover").addEventListener("click", () => postFailover("/api/redundancy/test-failover", (body) => "Test failover switched to " + body.activeId + " in " + body.switchDurationMs.toFixed(2) + " ms. Integrity " + (body.integrityOk ? "matched." : "did not match.")));
        document.getElementById("quarterly").addEventListener("click", () => postFailover("/api/redundancy/quarterly-tests", (body) => body.quarter + " quarterly test " + (body.passed ? "passed." : "failed.")));
        document.getElementById("doc-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          const response = await fetch("/api/redundancy/documentation", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: document.getElementById("runbook").value }) });
          const body = await response.json();
          const docStatus = document.getElementById("doc-status");
          docStatus.className = response.ok ? "status ok" : "status error";
          docStatus.textContent = response.ok ? "Runbook saved." : body.error;
        });
        loadDoc();
        refreshHealth();
        setInterval(refreshHealth, 3000);
      </script>`
  });
}

function quotePage(user) {
  return layout({
    title: "Quote",
    user,
    body: `
      <p class="note">The global discount threshold is 10%. The total updates from the server as you type. Apply the discount, review it, then submit.</p>
      <div class="panel">
        <form id="line-form" class="row">
          <label>Product <select id="product" required></select></label>
          <label>Quantity <input id="quantity" type="number" min="1" step="1" value="1" required></label>
          <button type="submit">Add product</button>
        </form>
        <table><thead><tr><th>Product</th><th>Quantity</th><th>Line total</th></tr></thead><tbody id="lines"></tbody></table>
        <p>Subtotal <strong id="subtotal">0.00</strong></p>
        <label for="discount">Discount percentage</label>
        <input id="discount" type="number" min="0" max="10" step="0.01" value="0">
        <p class="total">New total <strong id="total">0.00</strong></p>
        <p id="quote-status" class="status" role="status"></p>
        <h2>Review before submission</h2>
        <p id="review" class="muted">Apply a discount to review the updated quote.</p>
        <div class="actions">
          <button type="button" id="apply">Apply discount</button>
          <button type="button" class="secondary" id="submit" disabled>Submit quote</button>
        </div>
      </div>
      <script>
        let quote = null;
        const status = document.getElementById("quote-status");
        const money = (value) => Number(value).toFixed(2);
        function show(message, ok) {
          status.className = ok ? "status ok" : "status error";
          status.textContent = message;
        }
        function render() {
          const tbody = document.getElementById("lines");
          tbody.replaceChildren();
          for (const line of quote.lines) {
            const row = document.createElement("tr");
            row.innerHTML = "<td>" + line.name + "</td><td>" + line.quantity + "</td><td>" + money(line.lineTotal) + "</td>";
            tbody.appendChild(row);
          }
          document.getElementById("subtotal").textContent = money(quote.subtotal);
          if (quote.discountPercent !== null) {
            document.getElementById("discount").value = quote.discountPercent;
            document.getElementById("review").textContent = "Discount " + quote.discountPercent + "% applied. Total " + money(quote.total) + " is ready to submit.";
            document.getElementById("submit").disabled = false;
          }
          document.getElementById("total").textContent = money(quote.total);
        }
        async function preview() {
          if (!quote || quote.lines.length === 0) return;
          const response = await fetch("/api/quotes/apply-discount", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ quoteId: quote.id, discountPercent: Number(document.getElementById("discount").value), preview: true })
          });
          const body = await response.json();
          if (!response.ok) {
            show(body.error, false);
            return;
          }
          document.getElementById("total").textContent = money(body.total);
          show("", true);
        }
        async function start() {
          const products = await fetch("/api/products");
          const select = document.getElementById("product");
          for (const product of (await products.json()).products) {
            const option = document.createElement("option");
            option.value = product.id;
            option.textContent = product.name + " (" + money(product.unitPrice) + ")";
            select.appendChild(option);
          }
          const mine = await fetch("/api/quotes/mine");
          quote = (await mine.json()).quote;
          if (!quote) {
            const created = await fetch("/api/quotes", { method: "POST" });
            quote = await created.json();
          }
          render();
        }
        document.getElementById("line-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          const response = await fetch("/api/quotes/" + encodeURIComponent(quote.id) + "/lines", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ productId: document.getElementById("product").value, quantity: Number(document.getElementById("quantity").value) })
          });
          const body = await response.json();
          if (!response.ok) { show(body.error, false); return; }
          quote = body;
          render();
          preview();
        });
        document.getElementById("discount").addEventListener("input", preview);
        document.getElementById("apply").addEventListener("click", async () => {
          const response = await fetch("/api/quotes/apply-discount", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ quoteId: quote.id, discountPercent: Number(document.getElementById("discount").value) })
          });
          const body = await response.json();
          if (!response.ok) { show(body.error, false); return; }
          quote = body;
          render();
          show("Discount applied. Review the total, then submit.", true);
        });
        document.getElementById("submit").addEventListener("click", async () => {
          const response = await fetch("/api/quotes/" + encodeURIComponent(quote.id) + "/submit", { method: "POST" });
          const body = await response.json();
          if (!response.ok) { show(body.error, false); return; }
          show("Quote " + body.id + " submitted at " + money(body.total) + ".", true);
          document.getElementById("submit").disabled = true;
        });
        start();
      </script>`
  });
}

function auditPage(user) {
  const title = user.role === "system-administrator" ? "Discount audit" : "My discount log";
  return layout({
    title,
    user,
    body: `
      <p class="note">${user.role === "system-administrator" ? "All discount applications." : "Discount applications you recorded."}</p>
      <div class="panel"><table><thead><tr><th>Time</th><th>User</th><th>Quote</th><th>Percent</th><th>Previous total</th><th>New total</th><th>Rule</th></tr></thead><tbody id="logs"></tbody></table></div>
      <script>
        const money = (value) => Number(value).toFixed(2);
        fetch("/api/discount-logs").then((response) => response.json()).then((body) => {
          const tbody = document.getElementById("logs");
          for (const log of body.logs) {
            const row = document.createElement("tr");
            row.innerHTML = "<td>" + log.timestamp + "</td><td>" + log.userId + "</td><td>" + log.quoteId + "</td><td>" + log.discountPercent + "</td><td>" + money(log.previousTotal) + "</td><td>" + money(log.newTotal) + "</td><td>" + log.ruleId + " (" + log.thresholdPercent + "%)</td>";
            tbody.appendChild(row);
          }
        });
      </script>`
  });
}
