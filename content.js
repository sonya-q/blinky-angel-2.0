console.log('Blinky Angel content script loaded on:', window.location.hostname);

// ==============================================
// PART 1: INJECT TENSORFLOW INTO PAGE
// ==============================================

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    script.onload = () => {
      console.log(`Injected: ${src}`);
      resolve();
    };
    script.onerror = () => {
      console.error(`Failed to inject: ${src}`);
      reject();
    };
    (document.head || document.documentElement).appendChild(script);
  });
}

async function injectTensorFlow() {
  console.log('Injecting TensorFlow into page...');
  
  try {
    // Inject TensorFlow
    await injectScript('libs/tf.min.js');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Inject Face Landmarks Detection
    await injectScript('libs/face-landmarks-detection.min.js');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Inject our detector script
    await injectScript('detector.js');
    
    console.log('All scripts injected!');
    return true;
    
  } catch (error) {
    console.error('Error injecting scripts:', error);
    return false;
  }
}

// ==============================================
// PART 2: COMMUNICATE W DETECTOR
// ==============================================

let isModelReady = false;

// Listen for messages from detector.js (running in page context)
window.addEventListener('message', (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;
  
  const message = event.data;
  
  if (message.type === 'BLINKY_MODEL_READY') {
    if (message.ready) {
      isModelReady = true;
      console.log('🎉 Model is ready!');
      showSuccessNotification('Blinky Angel ready!');
    } else {
      console.error('❌ Model failed to load:', message.error);
      showErrorNotification('Failed to load AI model');
    }
  }
  
  if (message.type === 'BLINKY_MODEL_STATUS') {
    isModelReady = message.ready;
    console.log('Model status:', isModelReady);
  }
});

function checkModelReady() {
  window.postMessage({ type: 'BLINKY_CHECK_READY' }, '*');
}
// ==============================================
// PART 3: NOTIFICATIONS (For Testing)
// ==============================================

function showNotification(message, color = pink) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: pink 90%);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 16px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  if (!document.getElementById('blinky-animations')) {
    const style = document.createElement('style');
    style.id = 'blinky-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showSuccessNotification(message) {
  showNotification(message, '#4CAF50');
}

function showErrorNotification(message) {
  showNotification(message, '#f44336');
}

// ==============================================
// PART 4: START EVERYTHING
// ==============================================

async function initialize() {
  console.log('Initializing Blinky Angel...');
  
  // Inject TensorFlow into page
  const injected = await injectTensorFlow();
  
  if (!injected) {
    console.error('Failed to inject TensorFlow');
    showErrorNotification('Failed to load AI libraries');
    return;
  }
  
  console.log('Waiting for model to load...');
  
  // Check model status after a delay
  setTimeout(() => {
    checkModelReady();
  }, 3000);
}

// Start when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received:', message);
  
  if (message.type === 'CHECK_STATUS') {
    sendResponse({ 
      initialized: true,
      modelReady: isModelReady 
    });
  }
});

console.log('Content script setup complete!');