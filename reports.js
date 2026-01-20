chrome.storage.local.get(["suspiciousReports"], (data) => {
  const list = document.getElementById("reportList");
  const reports = data.suspiciousReports || [];

  if (reports.length === 0) {
    list.innerHTML = "<p>No reports submitted yet.</p>";
    return;
  }

  reports.forEach(r => {
    const div = document.createElement("div");
    div.className = "report";

    div.innerHTML = `
      <strong>${r.name}</strong><br>
      ID: ${r.id}<br>
      Link: <a href="${r.link}" target="_blank">Open</a><br>
      Reason: ${r.reason}<br>
      <small>${new Date(r.timestamp).toLocaleString()}</small>
    `;

    list.appendChild(div);
  });
});

document.getElementById("clearReports").addEventListener("click", () => {
  chrome.storage.local.remove("suspiciousReports", () => {
    alert("All reports cleared.");
    location.reload();
  });
});
