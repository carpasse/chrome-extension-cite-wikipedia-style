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

      let author = doc.querySelector("meta[name='author']")
        ? doc.querySelector("meta[name='author']").content
        : null;

      if (!author) {
        author = url.hostname.replace(/^www\./, "");
      }
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
        : null;

      const date = new Date();

      const citation = `[${author} "${title}"${
        publisher ? ` (${publisher})` : ""
      }.](${url}) Retrieved ${accessDate}.`;

      document.getElementById("authorInput").value = author;
      document.getElementById("titleInput").value = title;
      document.getElementById("dateInput").value = date.toLocaleDateString();
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

document.getElementById("copy").addEventListener("click", copyCitation);
