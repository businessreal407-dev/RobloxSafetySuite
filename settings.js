// Load settings
chrome.storage.local.get(["showLowRisk", "autoScan"], (data) => {
  document.getElementById("showLowRisk").checked = data.showLowRisk || false;
  document.getElementById("autoScan").checked = data.autoScan || false;
});

// Save settings
document.getElementById("showLowRisk").addEventListener("change", (e) => {
  chrome.storage.local.set({ showLowRisk: e.target.checked });
});

document.getElementById("autoScan").addEventListener("change", (e) => {
  chrome.storage.local.set({ autoScan: e.target.checked });
});

// Clear history
document.getElementById("clearHistory").addEventListener("click", () => {
  chrome.storage.local.remove("robloxExtensions");
  alert("Scan history cleared.");
});
