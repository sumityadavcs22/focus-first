
  document.addEventListener('DOMContentLoaded', function() {
      const saveTopic = document.getElementById('saveTopic');
      const addBlock = document.getElementById('addBlock');
      const scheduleBreak = document.getElementById('scheduleBreak');
      const setEmergencyKeyword = document.getElementById('setEmergencyKeyword');
      const resetSites = document.getElementById('resetSites');
      const currentTopicElement = document.getElementById('currentTopic');
      const blockedSitesListElement = document.getElementById('blockedSitesList');
  
      function updateCurrentTopic(topic) {
          currentTopicElement.textContent = topic || 'No topic set';
      }
  
      function updateBlockedSitesList(sites) {
          blockedSitesListElement.innerHTML = sites.length > 0 
              ? sites.map(site => `
                  <div class="blocked-site">
                      <span>${site}</span>
                      <button class="remove-site" data-site="${site}">Remove</button>
                  </div>
              `).join('')
              : '<div>No sites blocked</div>';
  
          document.querySelectorAll('.remove-site').forEach(button => {
              button.addEventListener('click', function() {
                  const siteToRemove = this.getAttribute('data-site');
                  removeBlockedSite(siteToRemove);
              });
          });
      }
  
      function removeBlockedSite(site) {
          chrome.storage.sync.get({blockedSites: []}, function(result) {
              let blockedSites = result.blockedSites.filter(s => s !== site);
              chrome.storage.sync.set({blockedSites: blockedSites}, function() {
                  console.log('Site removed from blocked list');
                  updateBlockedSitesList(blockedSites);
              });
  
              fetch('http://localhost:5000/blocked-sites', {
                  method: 'DELETE',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      userId: 'user123',
                      site: site
                  }),
              })
              .then(response => response.json())
              .then(data => console.log('Blocked site removed from backend:', data))
              .catch((error) => console.error('Error:', error));
          });
      }
  
      // Load saved values when the popup opens
      chrome.storage.sync.get(['studyTopic', 'blockSite', 'breakDuration', 'emergencyKeyword', 'blockedSites'], function(result) {
          document.getElementById('studyTopic').value = result.studyTopic || '';
          document.getElementById('blockSite').value = result.blockSite || '';
          document.getElementById('breakDuration').value = result.breakDuration || '';
          document.getElementById('emergencyKeyword').value = result.emergencyKeyword || '';
          updateCurrentTopic(result.studyTopic);
          updateBlockedSitesList(result.blockedSites || []);
      });
  
      saveTopic.addEventListener('click', function() {
          const topic = document.getElementById('studyTopic').value;
          
          chrome.storage.sync.set({studyTopic: topic}, function() {
              console.log('Study topic saved to chrome storage');
              updateCurrentTopic(topic);
          });
  
          fetch('http://localhost:5000/topics', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  userId: 'user123',
                  topic: topic
              }),
          })
          .then(response => response.json())
          .then(data => {
              console.log('Study topic saved to backend:', data);
              alert('Study topic saved successfully!');
          })
          .catch((error) => {
              console.error('Error:', error);
              alert('Failed to save study topic. Please try again.');
          });
      });
  
      addBlock.addEventListener('click', function() {
          const site = document.getElementById('blockSite').value;
          chrome.storage.sync.get({blockedSites: []}, function(result) {
              let blockedSites = result.blockedSites;
              if (!blockedSites.includes(site)) {
                  blockedSites.push(site);
                  chrome.storage.sync.set({blockedSites: blockedSites, blockSite: ''}, function() {
                      console.log('Site blocked');
                      document.getElementById('blockSite').value = '';
                      updateBlockedSitesList(blockedSites);
                  });
  
                  fetch('http://localhost:5000/blocked-sites', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          userId: 'user123',
                          site: site
                      }),
                  })
                  .then(response => response.json())
                  .then(data => {
                      console.log('Blocked site saved to backend:', data);
                      alert('Site blocked successfully!');
                  })
                  .catch((error) => {
                      console.error('Error:', error);
                      alert('Failed to block site. Please try again.');
                  });
              } else {
                  alert('This site is already blocked.');
              }
          });
      });
  
      scheduleBreak.addEventListener('click', function() {
          const duration = document.getElementById('breakDuration').value;
          const endTime = Date.now() + duration * 60 * 1000;
          chrome.storage.sync.set({breakUntil: endTime, breakDuration: duration}, function() {
              console.log('Break scheduled');
              alert(`Break scheduled for ${duration} minutes.`);
          });
      });
  
      setEmergencyKeyword.addEventListener('click', function() {
          const keyword = document.getElementById('emergencyKeyword').value;
          chrome.storage.sync.set({emergencyKeyword: keyword}, function() {
              console.log('Emergency keyword set');
              alert('Emergency keyword set successfully.');
          });
      });
  
      resetSites.addEventListener('click', function() {
          chrome.storage.sync.set({blockedSites: [], blockSite: ''}, function() {
              console.log('Blocked sites cleared from chrome storage');
              document.getElementById('blockSite').value = '';
              updateBlockedSitesList([]);
          });
  
          fetch('http://localhost:5000/blocked-sites', {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  userId: 'user123',
              }),
          })
          .then(response => response.json())
          .then(data => {
              console.log('All blocked sites deleted from backend:', data);
              alert('All blocked sites have been reset.');
          })
          .catch((error) => {
              console.error('Error:', error);
              alert('An error occurred while resetting blocked sites.');
          });
      });
  
      // Add event listeners to save input values as they change
      document.getElementById('studyTopic').addEventListener('input', function(e) {
          chrome.storage.sync.set({studyTopic: e.target.value});
          updateCurrentTopic(e.target.value);
      });
  
      document.getElementById('blockSite').addEventListener('input', function(e) {
          chrome.storage.sync.set({blockSite: e.target.value});
      });
  
      document.getElementById('breakDuration').addEventListener('input', function(e) {
          chrome.storage.sync.set({breakDuration: e.target.value});
      });
  
      document.getElementById('emergencyKeyword').addEventListener('input', function(e) {
          chrome.storage.sync.set({emergencyKeyword: e.target.value});
      });
  });