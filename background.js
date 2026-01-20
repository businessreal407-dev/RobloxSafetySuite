import { isRobloxRelated } from "./modules/detectRobloxExtensions.js";
import { analyzePermissions } from "./modules/analyzePermissions.js";
import { detectScriptInjection } from "./modules/detectScriptInjection.js";
import { calculateRisk } from "./modules/riskScoring.js";

// MAIN SCAN FUNCTION
async function scanExtensions() {
  try {
    console.log("🔍 [Background] Scan started...");
    const extensions = await chrome.management.getAll();
    console.log(`📦 [Background] Found ${extensions.length} total extensions`);

    const results = [];

    extensions.forEach(ext => {
      if (isRobloxRelated(ext)) {
        console.log(`✅ [Background] ROBLOX EXTENSION DETECTED: ${ext.name}`);
        
        const permissionAnalysis = analyzePermissions(ext);
        const scriptAnalysis = detectScriptInjection(ext);
        const risk = calculateRisk({
          permissionScore: permissionAnalysis.score,
          scriptScore: scriptAnalysis.score
        });

        results.push({
          name: ext.name,
          id: ext.id,
          enabled: ext.enabled,
          permissions: ext.permissions || [],
          permissionScore: permissionAnalysis.score,
          permissionReasons: permissionAnalysis.reasons,
          scriptScore: scriptAnalysis.score,
          scriptReasons: scriptAnalysis.reasons,
          totalScore: risk.totalScore,
          riskLevel: risk.riskLevel,
          recommendation: risk.recommendation
        });
      }
    });

    console.log(`✅ [Background] Scan completed. Found ${results.length} Roblox-related extensions`);
    
    // Save to storage
    await chrome.storage.local.set({ 
      robloxExtensions: results,
      lastScanTime: new Date().toISOString()
    });
    
    return results;
  } catch (error) {
    console.error("❌ [Background] Scan error:", error);
    return [];
  }
}

// Run scan on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 [Background] Extension installed/updated. Running initial scan...");
  scanExtensions();
});

// Respond to rescan requests from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "rescan") {
    console.log("📨 [Background] Rescan message received from popup");
    
    scanExtensions().then(results => {
      console.log(`📤 [Background] Sending ${results.length} results back to popup`);
      sendResponse({ 
        success: true, 
        results: results,
        timestamp: new Date().toISOString()
      });
    }).catch(error => {
      console.error("❌ [Background] Rescan error:", error);
      sendResponse({ 
        success: false, 
        results: [],
        error: error.message
      });
    });
    
    return true; // Keep message channel open
  }
});

// Also respond to storage change requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getStoredResults") {
    chrome.storage.local.get("robloxExtensions", (data) => {
      sendResponse({ 
        success: true, 
        results: data.robloxExtensions || []
      });
    });
    return true;
  }
});
