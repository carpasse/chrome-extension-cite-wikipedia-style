document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const inputUrl = document.getElementById("inputUrl");
    if (tabs[0] && tabs[0].url) {
      inputUrl.value = tabs[0].url;
    }

    generateCitation();
  });

  document
    .getElementById("inputUrl")
    .addEventListener("input", generateCitation);

  const inputs = document.querySelectorAll('#authorInput, #titleInput, #dateInput');

  for (const input of inputs) {
    input.addEventListener('input', updateCitation);
  }
});

function getTitleFromAnchoredElement(doc, anchor) {
  const anchoredElement = doc.getElementById(anchor);

  if (anchoredElement) {
    return anchoredElement.textContent.replace("\n", " ");
  }

  return null;
}

function generateCitation() {
  const inputUrl = document.getElementById("inputUrl").value;

  if (!inputUrl) {
    return;
  }

  const url = new URL(inputUrl);
  const accessDate = new Date().toISOString().slice(0, 10);

  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const author = doc.querySelector("meta[name='author']")
        ? doc.querySelector("meta[name='author']").content
        : null;

      let title;

      if (url.hash) {
        title = getTitleFromAnchoredElement(doc, url.hash.slice(1));
      }

      if (!title) {
        title = doc.querySelector("meta[property='og:title']")
          ? doc.querySelector("meta[property='og:title']").content
          : doc.querySelector("title")
          ? doc.querySelector("title").textContent
          : "Unknown Title";
      }

      const publisher = doc.querySelector("meta[property='og:site_name']")
        ? doc.querySelector("meta[property='og:site_name']").content
        : doc.querySelector("meta[name='publisher']")
        ? doc.querySelector("meta[name='publisher']").content
        : url.hostname.replace(/^www\./, "");

      const date = new Date();

      const citation = `[${author ? `${author} ` : ""}"${title}"${
        publisher ? ` (${publisher})` : ""
      }.](${url}) Retrieved ${accessDate}.`;

      document.getElementById("authorInput").value = author;
      document.getElementById("titleInput").value = title;
      document.getElementById("dateInput").value = formatAccessDate(date);
      document.getElementById("citation").innerText = citation;
      document.getElementById("copy").disabled = false;
    })
    .catch((error) => {
      console.error("Error fetching the webpage:", error);
    });
}

async function copyCitation() {
  const citationElement = document.getElementById("citation");
  const citation = citationElement.innerText;
  const copyMessage = document.getElementById("copyMessage");

  try {
    await navigator.clipboard.writeText(citation);
    copyMessage.textContent = "Citation copied to clipboard!";
    copyMessage.classList.remove("hidden");
    setTimeout(() => {
      copyMessage.classList.add("hidden");
    }, 3000); // Hide the message after 3 seconds
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

function updateCitation() {
  const author = document.getElementById("authorInput").value;
  const title = document.getElementById("titleInput").value;
  const inputUrl = document.getElementById("inputUrl").value;
  const url = new URL(inputUrl);
  const accessDate = formatAccessDate(new Date());

  const citation = `[${author} "${title}"].](${url}) Retrieved ${accessDate}.`;

  document.getElementById("citation").innerText = citation;
}

function formatAccessDate(date) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${monthNames[monthIndex]} ${day}, ${year}`;
}


document.getElementById("copy").addEventListener("click", copyCitation);
