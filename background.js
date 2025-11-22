// check extension properly installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Blinky Angel 2.0 successfully installed!");
  
  // set default settings, runs one time
  chrome.storage.local.set({
    enabled: true,
    mode: 'balanced', // strict, balanced, gentle
    breakInterval: 20 // minutes, allows for user to change by preference
  });
});


// listen for messages from background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background message received");
  if (msg.type === "GET_SETTINGS"){
    // get settings from storage
    chrome.storage.local.get(['enabled', 'mode', 'breakInterval'], (result) => {
      console.log("Got settings: ", result);
      sendResponse(result);
    });
    return true; // keeps message channel open for asynch response
  };

  if (msg.type === "UPDATE_SETTINGS"){
    // save new settings
    chrome.storage.local.set(msg.settings, () => {
      console.log("Updating settings", msg.settings);
      sendResponse({success: true});
    })
    return true;
  };

  if (msg.type === "BLINK_DETECTED"){
    console.log("Blink detected! Count: ", msg.count);
    sendResponse({received: true});
  };
});

console.log("Background running")