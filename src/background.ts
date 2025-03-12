// Listen for tab updates
chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
  console.log('Tab updated:', tab.url);
});

// Listen for tab creation
chrome.tabs.onCreated.addListener((tab) => {
  console.log('New tab created:', tab.url);
});

// Listen for group updates
chrome.tabGroups.onUpdated.addListener((group) => {
  console.log('Group updated:', group);
});

// Basic initialization
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
}); 