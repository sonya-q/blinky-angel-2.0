console.log("Popup opened!")

const testButton = document.getElementById('test-button');
const responseDiv = document.getElementById('response');

// when button clicked
testButton.addEventListener('click', async() => {
  console.log("Test button clicked");
  // show loading state
  responseDiv.textContent = 'Sending message to background...';

  try {

    const response = await chrome.runtime.sendMessage({
      type: 'GET_SETTINGS'
    });

    console.log('Got response:', response);
  }
  catch (error) {
    console.error('Error:', error);
    responseDiv.textContent = 'Error: ' + error.message;
  }
});

// Load settings when popup opens
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_SETTINGS'
    });
    
    console.log('Settings loaded:', response);
    
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Load settings immediately
loadSettings();