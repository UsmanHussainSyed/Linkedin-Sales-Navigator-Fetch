// Listen for when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && /^https:\/\/www\.linkedin\.com/.test(tab.url)) {
    // Execute your scrapeData function on the updated tab if the URL matches LinkedIn
    chrome.scripting.executeScript({
      target: {tabId: tabId},
      files: ['contentScript.js']
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveData') {
    // Save the scraped data when received from the content script
    chrome.storage.local.set({ scrapedData: request.data }, () => {
      sendResponse({ success: true });
    });
    return true;  // Will respond asynchronously
  } else if (request.action === 'generateExcel') {
    // Convert data to Excel format and save as file (might need a library for this)

    function s2ab(s) { 
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;    
  }
  
  function exportToExcel(data) {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
      const wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
      const blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'data.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  }
  
  // Call the function with your data:
  exportToExcel(allData);
  





}

  
});
