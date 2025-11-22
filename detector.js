console.log('Detector script loaded in page context');

let model = null;
let isModelReady = false;

// Load TensorFlow and model
async function initializeDetector() {
  console.log('Loading TensorFlow.js...');
  
  try {
    // Wait for TensorFlow to be available
    if (typeof tf === 'undefined') {
      console.error('TensorFlow not loaded!');
      return false;
    }
    
    console.log('TensorFlow loaded! Version:', tf.version.tfjs);
    
    if (typeof faceLandmarksDetection === 'undefined') {
      console.error('Face Landmarks Detection not loaded!');
      return false;
    }
    
    console.log('Face Landmarks Detection loaded!');
    
    // Create the detector
    console.log('Creating face detector...');
    model = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      {
        runtime: 'tfjs',
        maxFaces: 1,
        refineLandmarks: true
      }
    );
    
    isModelReady = true;
    console.log('Face detector ready!');
    
    // Notify content script that we're ready
    window.postMessage({ 
      type: 'BLINKY_MODEL_READY',
      ready: true 
    }, '*');
    
    return true;
    
  } catch (error) {
    console.error('Error initializing detector:', error);
    window.postMessage({ 
      type: 'BLINKY_MODEL_READY',
      ready: false,
      error: error.message 
    }, '*');
    return false;
  }
}

// Listen for messages from content script
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;
  
  const message = event.data;
  
  if (message.type === 'BLINKY_CHECK_READY') {
    window.postMessage({ 
      type: 'BLINKY_MODEL_STATUS',
      ready: isModelReady 
    }, '*');
  }
  
  // More message handlers will go here later (for detection)
});

// Auto-initialize
console.log('Starting detector initialization...');
initializeDetector();