(function () {
  function parseConfig(container) {
    try {
      return JSON.parse(container.dataset.config || "{}");
    } catch (e) {
      return {};
    }
  }

  function normalizePayload(payload) {
    if (payload && typeof payload === "object" && Array.isArray(payload.data) && payload.data.length > 0) {
      return payload.data[0];
    }
    return payload;
  }

  async function postAction(config, body) {
    const data = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => data.append(key, value));
    data.append(config.token, "1");
    const response = await fetch(config.ajaxUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: data.toString(),
    });
    return normalizePayload(await response.json());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderBookTable(container, books, texts) {
    const bookListDiv = container.querySelector(".stpageflip-conversion__book-list");
    if (!bookListDiv) return;

    if (!books || books.length === 0) {
      bookListDiv.innerHTML = '<p class="text-muted small mt-2">' + escapeHtml(texts.noBooks || "No books found.") + "</p>";
      return;
    }

    const statusConfig = {
      complete:            { icon: "bi-check-circle-fill text-success",        label: (texts.status || {}).complete            || "complete" },
      images_only:         { icon: "bi-images text-info",                      label: (texts.status || {}).images_only         || "images only" },
      conversion_required: { icon: "bi-file-earmark-pdf text-warning",         label: (texts.status || {}).conversion_required || "conversion required" },
      multiple_pdfs:       { icon: "bi-exclamation-triangle-fill text-danger",  label: (texts.status || {}).multiple_pdfs       || "multiple PDFs" },
      empty:               { icon: "bi-folder text-secondary",                 label: (texts.status || {}).empty               || "empty" },
      invalid:             { icon: "bi-x-circle-fill text-danger",             label: (texts.status || {}).invalid             || "invalid" },
    };

    let html = '<table class="table table-sm table-striped stpageflip-book-list mt-0 mb-0">';
    html += '<thead class="table-light"><tr>';
    html += '<th class="fw-semibold">' + escapeHtml(texts.colFolder || "Folder") + "</th>";
    html += '<th class="fw-semibold">' + escapeHtml(texts.colStatus || "Status") + "</th>";
    html += '<th class="fw-semibold text-end">' + escapeHtml(texts.colImages || "Images") + "</th>";
    html += '<th class="fw-semibold">' + escapeHtml(texts.colPdf || "PDF") + "</th>";
    html += "</tr></thead><tbody>";

    books.forEach(function (book) {
      const sc = statusConfig[book.status] || statusConfig.invalid;
      html += "<tr>";
      html += "<td><code>" + escapeHtml(book.folder) + "</code></td>";
      html += '<td><i class="bi ' + sc.icon + '"></i> ' + escapeHtml(sc.label) + "</td>";
      html += '<td class="text-end">' + (parseInt(book.imageCount, 10) || 0) + "</td>";
      html += "<td>" + (book.pdfFile ? escapeHtml(book.pdfFile) : '<span class="text-muted">–</span>') + "</td>";
      html += "</tr>";
    });

    html += "</tbody></table>";
    bookListDiv.innerHTML = html;
  }

  function appendResult(container, text, status) {
    const list = container.querySelector(".stpageflip-conversion__results");
    const item = document.createElement("li");
    item.className = "list-group-item stpageflip-status-" + status;
    item.textContent = text;
    list.appendChild(item);
  }

  function setProgress(container, text) {
    container.querySelector(".stpageflip-conversion__progress").textContent = text;
  }

  async function refresh(container, config) {
    setProgress(container, config.texts.checking || "Checking books ...");
    const payload = await postAction(config, { action: "scan" });

    if (!payload || payload.success !== true) {
      throw new Error((payload && payload.message) || config.texts.scanError || "Scan failed");
    }

    renderBookTable(container, payload.books || [], config.texts);
    setProgress(container, config.texts.ready || "Ready");

    return payload.books || [];
  }

  async function convert(container, config) {
    const resultsList = container.querySelector(".stpageflip-conversion__results");
    if (resultsList) resultsList.innerHTML = "";

    const books = await refresh(container, config);
    const pending = books.filter((book) => book.status === "conversion_required");

    if (pending.length === 0) {
      appendResult(container, config.texts.noPending || "Keine Konvertierung erforderlich.", "info");
      return;
    }

    let processed = 0;

    for (const book of pending) {
      processed++;
      setProgress(container, (config.texts.processing || "Processing") + " " + processed + "/" + pending.length + ": " + book.folder);
      const result = await postAction(config, { action: "convert", folder: book.folder });

      if (!result || typeof result !== "object") {
        appendResult(container, book.folder + ": " + (config.texts.convertError || "Conversion failed"), "error");
        continue;
      }

      appendResult(container, book.folder + ": " + (result.message || result.status), result.success ? "success" : "error");
    }

    // Refresh book list to reflect the newly converted state
    await refresh(container, config);
  }

  function initContainers() {
    document.querySelectorAll(".stpageflip-conversion").forEach(function (container) {
      if (container.dataset.pfInit) return;
      container.dataset.pfInit = "1";

      const config = parseConfig(container);

      container.querySelector('[data-action="refresh"]').addEventListener("click", async function () {
        try {
          await refresh(container, config);
        } catch (error) {
          setProgress(container, error.message);
        }
      });

      container.querySelector('[data-action="convert"]').addEventListener("click", async function () {
        try {
          await convert(container, config);
        } catch (error) {
          setProgress(container, error.message);
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContainers);
  } else {
    initContainers();
  }
}());
