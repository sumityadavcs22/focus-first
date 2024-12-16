
  
  function checkSiteRelevance(url, topic) {
      return fetch('http://your-ml-service.com/check-relevance', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({url: url, topic: topic}),
      })
      .then(response => response.json())
      .then(data => data.isRelevant);
  }
  
  chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
      chrome.storage.sync.get(['studyTopic', 'blockedSites', 'breakUntil'], function(result) {
          const currentTime = Date.now();
          if (result.breakUntil && currentTime < result.breakUntil) {
              return; // User is on a break, allow all sites
          }
  
          const url = new URL(details.url);
          const hostname = url.hostname;
  
          if (result.blockedSites && result.blockedSites.includes(hostname)) {
              chrome.tabs.update(details.tabId, {url: "blocked.html"});
          } else if (result.studyTopic) {
              checkSiteRelevance(hostname, result.studyTopic)
                  .then(isRelevant => {
                      if (!isRelevant) {
                          chrome.tabs.update(details.tabId, {url: "blocked.html"});
                      }
                  })
                  .catch(error => {
                      console.error('Error checking site relevance:', error);
                      // In case of an error, we'll allow the navigation to proceed
                  });
          }
      });
  });
  
  // Additional functionality for handling emergency keywords
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === "checkEmergencyKeyword") {
          chrome.storage.sync.get(['emergencyKeyword'], function(result) {
              if (result.emergencyKeyword && request.keyword === result.emergencyKeyword) {
                  // Disable blocking temporarily
                  chrome.storage.sync.set({breakUntil: Date.now() + 30 * 60 * 1000}, function() {
                      console.log('Emergency access granted for 30 minutes');
                      sendResponse({success: true});
                  });
              } else {
                  sendResponse({success: false});
              }
          });
          return true; // Indicates that the response is sent asynchronously
      }
  });
  
  // Periodic check to remove expired break
  setInterval(function() {
      chrome.storage.sync.get(['breakUntil'], function(result) {
          if (result.breakUntil && Date.now() > result.breakUntil) {
              chrome.storage.sync.remove('breakUntil', function() {
                  console.log('Break period expired');
              });
          }
      });
  }, 60000); // Check every minute