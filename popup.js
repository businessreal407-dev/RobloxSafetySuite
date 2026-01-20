function createBadge(level) {
  if (level === "High Risk") return "badge high";
  if (level === "Medium Risk") return "badge medium";
  return "badge low";
}

function renderExtensions(extensions) {
  const list = document.getElementById("extList");
  list.innerHTML = "";

  console.log("🎨 [Popup] Rendering:", extensions ? extensions.length : 0, "extensions");

  if (!extensions || extensions.length === 0) {
    list.innerHTML = "<p style='text-align:center;padding:20px;color:#4caf50;'>✓ No Roblox-related extensions detected.</p>";
    return;
  }

  extensions.forEach(ext => {
    const div = document.createElement("div");
    div.className = "risk-item";

    const permReasons = (Array.isArray(ext.permissionReasons) ? ext.permissionReasons : [])
      .map(r => `• ${r}`).join("<br>");
    const scriptReasons = (Array.isArray(ext.scriptReasons) ? ext.scriptReasons : [])
      .map(r => `• ${r}`).join("<br>");
    const allReasons = [permReasons, scriptReasons].filter(r => r).join("<br>");

    div.innerHTML = `
      <div class="risk-title">
        ${ext.name}
        <span class="${createBadge(ext.riskLevel)}">${ext.riskLevel}</span>
      </div>

      <div class="reasons">
        ${allReasons || "📍 Name matches Roblox scam patterns."}
      </div>

      <div class="recommendation">
        ${ext.recommendation}
      </div>
    `;

    list.appendChild(div);
  });
}

// Load results from storage on popup open
function loadStoredResults() {
  chrome.storage.local.get("robloxExtensions", (data) => {
    console.log("📦 [Popup] Loaded from storage:", data.robloxExtensions);
    if (data.robloxExtensions) {
      renderExtensions(data.robloxExtensions);
    }
  });
}

// Trigger scan when popup opens
document.addEventListener("DOMContentLoaded", () => {
  console.log("📂 [Popup] Popup opened");
  const list = document.getElementById("extList");
  list.innerHTML = "<p style='text-align:center;padding:10px'>🔍 Scanning extensions...</p>";

  // Send rescan message to background
  chrome.runtime.sendMessage({ action: "rescan" }, (response) => {
    console.log("📥 [Popup] Response received:", response);
    
    if (chrome.runtime.lastError) {
      console.error("❌ [Popup] Message error:", chrome.runtime.lastError);
      loadStoredResults(); // Fallback to stored results
      return;
    }

    if (response && response.success && response.results) {
      renderExtensions(response.results);
    } else {
      console.warn("⚠️ [Popup] Invalid response, loading from storage");
      loadStoredResults();
    }
  });
});

// Listen for storage changes (if background updates during popup open)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.robloxExtensions) {
    console.log("🔄 [Popup] Storage changed, re-rendering");
    renderExtensions(changes.robloxExtensions.newValue);
  }
});

// Rescan button
const rescanBtn = document.getElementById("rescan");
if (rescanBtn) {
  rescanBtn.addEventListener("click", () => {
    console.log("🔄 [Popup] Rescan button clicked");
    const list = document.getElementById("extList");
    list.innerHTML = "<p style='text-align:center;padding:10px'>🔍 Rescanning...</p>";

    chrome.runtime.sendMessage({ action: "rescan" }, (response) => {
      console.log("📥 [Popup] Rescan response:", response);
      if (response && response.success && response.results) {
        renderExtensions(response.results);
      } else {
        console.error("❌ [Popup] Rescan failed");
        loadStoredResults();
      }
    });
  });
}
