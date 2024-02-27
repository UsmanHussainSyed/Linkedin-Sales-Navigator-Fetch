let allData = [];

function clickNextPagination() {
    const nextPageBtn = document.querySelector('.artdeco-pagination__button--next');
    if (nextPageBtn) {
        nextPageBtn.click();
        setTimeout(scrapeAfterScroll, 5000);  // wait 5 seconds for new page data to load then scrape
    } else {
        // All pages done, send to background to generate Excel
        chrome.runtime.sendMessage({ action: 'generateExcel', data: allData });
    }
}

function scrollSlowly(callback) {
  const container = document.getElementById('search-results-container');
  if (!container) {
      console.error('Scrollable container not found.');
      return;
  }

  const scrollInterval = setInterval(() => {
      const beforeScrollTop = container.scrollTop;
      container.scrollTop += 200;  // Scroll by 50 pixels every 500ms

      // If we haven't scrolled, probably we've reached the end.
      if (container.scrollTop === beforeScrollTop) {
          clearInterval(scrollInterval);
          callback();
      }
  }, 200);
}

function safeTextContent(element) {
  return element ? element.textContent.trim() : "";
}

function scrapeAfterScroll() {
  scrollSlowly(() => {
      scrapeData();
  });
}

function scrapeData() {
  const liElements = Array.from(document.querySelectorAll('ol.artdeco-list > li.artdeco-list__item'));

  const data = liElements.map(li => {
      const nameElem = li.querySelector('span[data-anonymize="person-name"]');
      const titleElem = li.querySelector('span[data-anonymize="title"]');
      const companyElem = li.querySelector('a[data-anonymize="company-name"]');
      const companyElem2 = li.querySelector('div.artdeco-entity-lockup__subtitle');

      let name = safeTextContent(nameElem);
      const title = safeTextContent(titleElem);
      let company = safeTextContent(companyElem);

      // If companyElem is empty, use the innerText from companyElem2
      if (!company && companyElem2) {
          const allText = companyElem2.innerText;
          const spanText = companyElem2.querySelector('span') ? companyElem2.querySelector('span').innerText : '';
          const buttonText = companyElem2.querySelector('button') ? companyElem2.querySelector('button').innerText : '';
          company = allText.replace(spanText, '').replace(buttonText, '').trim();
      }

      // If nameElem is empty, set name to company and clear title & company
      if (!name) {
          name = company;
          company = '';
      }

      return {
          name: name,
          title: title,
          company: company
      };
  });

  // Once data is scraped, send it to the background script for storage
  chrome.runtime.sendMessage({ action: 'saveData', data: data });
  allData.push(...data);
  clickNextPagination();
}



function isScrolledToBottom(el) {
  return el.scrollHeight - el.scrollTop === el.clientHeight;
}

function scrollLinkedInPage() {
  const container = document.querySelector('#search-results-container');

  if (!container) return;

  // If scrolled to the bottom, scrape data and scroll to the top
  if (isScrolledToBottom(container)) {
      setTimeout(() => {
          scrapeData();
          container.scrollTop = 0;  // scroll back to top
      }, 1000);  // wait for 5 seconds before scraping and scrolling back to top
  } else {
      // If not at the bottom, continue scrolling
      container.scrollTop += 100;
      setTimeout(scrollLinkedInPage, 1000);
  }
}

// Start the scroll process
scrollLinkedInPage();

scrapeData();

// Start the scrolling when the script loads
scrapeAfterScroll();

// Once data is scraped, send it to the background script for storage


