function generateCitation() {
  const inputUrl = document.getElementById("inputUrl").value;

  if (!inputUrl) {
    alert("Please enter a URL.");
    return;
  }

  const url = new URL(inputUrl);
  const title = url.pathname;
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
      document.getElementById("copy").disabled = false;
    })
    .catch((error) => {
      console.error("Error fetching the webpage:", error);
    });
}

function copyCitation() {
  const citation = document.getElementById("citation");
  const textArea = document.createElement("textarea");
  textArea.value = citation.innerText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  alert("Citation copied to clipboard!");
}

document.getElementById("generate").addEventListener("click", generateCitation);
document.getElementById("copy").addEventListener("click", copyCitation);
