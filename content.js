console.log('Blinky Angel content script loaded on:', window.location.hostname);

// ==============================================
// PART 1: SCRIPT LOADING FUNCTIONS
// ==============================================

function checkTensorFlowLoaded() {
  if (typeof tf === 'undefined') {
    console.error('TensorFlow not loaded!');
    return false;
  }
  
  if (typeof faceLandmarksDetection === 'undefined') {
    console.error('Face Landmarks Detection not loaded!');
    return false;
  }
  
  console.log('TensorFlow loaded! Version:', tf.version.tfjs);
  console.log('Face Landmarks Detection loaded!');
  return true;
}

// ==============================================
// PART 2: INITIALIZATION
// ==============================================

let model = null;
let isInitialized = false;

async function initializeBlinkyAngel() {
  console.log('Initializing Blinky Angel...');
  
  // Load TensorFlow
  const tfLoaded = await loadTensorFlow();
  if (!tfLoaded) {
    console.error('Failed to load TensorFlow. Stopping initialization.');
    showErrorNotification('Failed to load AI libraries');
    return;
  }
  
  // Wait a bit for everything to settle
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Load the model
  model = await loadFaceMeshModel();
  if (!model) {
    console.error('Failed to load FaceMesh model. Stopping initialization.');
    showErrorNotification('Failed to load face detection model');
    return;
  }
  
  isInitialized = true;
  console.log('Blinky Angel fully initialized!');
  showSuccessNotification('Blinky Angel ready!');
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

// Wait for page to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBlinkyAngel);
} else {
  // Page already loaded, start immediately
  initializeBlinkyAngel();
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.type === 'CHECK_STATUS') {
    sendResponse({ 
      initialized: isInitialized,
      modelLoaded: model !== null 
    });
  }
});

console.log('Content script setup complete, waiting for page load...');