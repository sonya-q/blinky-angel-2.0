console.log('Blinky Angel content script loaded on:', window.location.hostname);

// ==============================================
// PART 1: SCRIPT LOADING FUNCTIONS
// ==============================================

function loadScript(url) {
  return new Promise((resolve, reject) => {
    console.log(`Loading: ${url}`);
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      console.log(`Loaded: ${url}`);
      resolve();
    };
    script.onerror = () => {
      console.error(`Failed to load: ${url}`);
      reject(new Error(`Failed to load ${url}`));
    };
    document.head.appendChild(script);
  });
}

async function loadTensorFlow() {
  console.log('Starting TensorFlow.js loading...');
  
  try {
    // Load TensorFlow core
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
    
    console.log('TensorFlow.js loaded!');
    console.log('TensorFlow version:', tf.version.tfjs);
    
    // Load Face Landmarks Detection model
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh');
    await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection');
    
    console.log('✅ Face Landmarks Detection library loaded!');
    
    return true;
  } catch (error) {
    console.error('Error loading TensorFlow:', error);
    return false;
  }
}

async function loadFaceMeshModel() {
  console.log('Loading FaceMesh model...');
  
  try {
    const model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'tfjs',
        maxFaces: 1,
        refineLandmarks: true
      }
    );
    
    console.log('FaceMesh model loaded successfully!');
    console.log('Model ready to detect faces!');
    
    return model;
  } catch (error) {
    console.error('Error loading FaceMesh model:', error);
    return null;
  }
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