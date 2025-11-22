// store settings
let settings = {
  enabled: true,
  mode: 'balanced', // strict, balanced, gentle
  breakInterval: 20 // minutes, allows for user to change by preference
}

// timer

let breakTimer = null;

function startBreakTimer() {
  breakTimer = setInterval(() => {
    // every twenty minutes
    sentBreakReminder();
  }, settings.breakInterval * 60 * 1000);
}

// listen for messages from popup/content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_SETTINGS") {
    sendResponse(settings);
  } // to be added to later
})