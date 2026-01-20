function extractExtensionId(input) {
  // Raw ID (32 chars, a–p only)
  const rawIdPattern = /^[a-p]{32}$/;

  if (rawIdPattern.test(input)) {
    return input;
  }

  // New Chrome Web Store URL
  const newUrlPattern = /chromewebstore\.google\.com\/detail\/[^/]+\/([a-p]{32})/;

  // Old Chrome Web Store URL
  const oldUrlPattern = /chrome\.google\.com\/webstore\/detail\/[^/]+\/([a-p]{32})/;

  let match = input.match(newUrlPattern) || input.match(oldUrlPattern);
  return match ? match[1] : null;
}

document.getElementById("submitReport").addEventListener("click", () => {
  const name = document.getElementById("extName").value.trim();
  const link = document.getElementById("extLink").value.trim();
  const reason = document.getElementById("reason").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  const id = extractExtensionId(link);

  if (!name || !link || !reason || !id) {
    errorMsg.style.display = "block";
    alert("Invalid extension link or ID.");
    return;
  }

  errorMsg.style.display = "none";

  chrome.storage.local.get(["suspiciousReports"], (data) => {
    const reports = data.suspiciousReports || [];

    reports.push({
      name,
      link,
      id,
      reason,
      timestamp: new Date().toISOString()
    });

    chrome.storage.local.set({ suspiciousReports: reports }, () => {
      alert("Report submitted successfully.");
      window.location.href = "popup.html";
    });
  });
});
