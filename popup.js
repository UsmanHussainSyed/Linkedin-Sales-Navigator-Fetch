function fetchData() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentTab = tabs[0]; 
    chrome.scripting.executeScript({
      target: {tabId: currentTab.id},
      files: ['contentScript.js']
    }, (results) => {
      if (results && results.length && Array.isArray(results[0].result)) {
        const data = results[0].result;
        displayData(data);
      }
    });
  });
}

// popup.js

// Fetch the saved data when the popup is opened and display it
function displayStoredData() {
  chrome.storage.local.get('scrapedData', function(data) {
      if (data.scrapedData) {
          displayData(data.scrapedData);
      }
  });
}

function displayData(data) {
  const table = document.getElementById('dataTable');
  table.innerHTML = ""; // Clear existing data
  data.forEach(item => {
      const row = table.insertRow();
      row.insertCell(0).textContent = item.name;
      row.insertCell(1).textContent = item.title;
      row.insertCell(2).textContent = item.company;
  });
}

// Fetch the stored data immediately when the popup is opened
displayStoredData();

document.getElementById('copyButton').addEventListener('click', copyData);

function copyData() {
  let content = '';
  const dataRows = document.querySelectorAll("#dataTable tr");
  dataRows.forEach(row => {
      content += Array.from(row.children).map(td => td.textContent).join('\t') + '\n';
  });
  navigator.clipboard.writeText(content);
}

document.getElementById('fetchButton').addEventListener('click', fetchData);


