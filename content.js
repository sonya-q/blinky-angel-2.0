console.log('Blinky Angel content script loaded on:', window.location.hostname);

// Create a test notification
function showTestNotification() {
  const notification = document.createElement('div');
  notification.id = 'blinky-test';
  notification.textContent = 'Blinky Angel is watching this page!';
  notification.style.cssText = `
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Show notification when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showTestNotification);
} else {
  showTestNotification();
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.type === 'SHOW_NOTIFICATION') {
    showTestNotification();
    sendResponse({ shown: true });
  }
});