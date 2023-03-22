function generateCitation() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    const url = tab.url;
    const title = tab.title;
    const accessDate = new Date().toISOString().slice(0, 10);

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const author = doc.querySelector("meta[name='author']")
          ? doc.querySelector("meta[name='author']").content
          : "Unknown Author";

        const publisher = doc.querySelector("meta[name='publisher']")
          ? doc.querySelector("meta[name='publisher']").content
          : doc.querySelector("title")
          ? doc.querySelector("title").textContent
          : "Unknown Publisher";

        const citation = `[${author}. "${title}" (${publisher}).](${url}) Retrieved ${accessDate}.`;
        document.getElementById("citation").innerText = citation;
      })
      .catch((error) => {
        console.error("Error fetching the webpage:", error);
      });
  });
}

document.getElementById("generate").addEventListener("click", generateCitation);
