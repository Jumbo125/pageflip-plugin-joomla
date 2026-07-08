(function () {
  function normalizePayload(payload) {
    if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
      return payload.data[0];
    }

    return payload;
  }

  function appendTextLine(parent, label, value) {
    const line = document.createElement("div");
    line.textContent = `${label}: ${value}`;
    parent.appendChild(line);
  }

  function insertIntoEditor(editor, text) {
    if (window.Joomla && Joomla.editors && Joomla.editors.instances && Joomla.editors.instances[editor]) {
      Joomla.editors.instances[editor].replaceSelection(text);
      return;
    }

    if (window.Joomla && typeof Joomla.insertText === "function") {
      Joomla.insertText(text, editor);
    }
  }

  function createPlaceholder(folder, hasPdf, defaults) {
    const suffix = Math.random().toString(16).slice(2, 8);
    const id = `b-${folder.replace(/[^A-Za-z0-9\-_:.]+/g, "-")}-${suffix}`;
    const values = Object.assign({}, defaults || {}, {
      id,
      img: folder,
      pdf: folder,
      download: hasPdf ? "true" : "false"
    });

    const lines = ["[book"];

    Object.entries(values).forEach(([key, value]) => {
      lines.push(` ${key}="${value}"`);
    });

    lines.push("]");

    return lines.join("\n");
  }

  async function loadBooks(config) {
    const body = new URLSearchParams();
    body.append("action", "scan");
    body.append(config.token, "1");

    const response = await fetch(config.ajaxUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: body.toString()
    });

    return normalizePayload(await response.json());
  }

  function ensureModal() {
    let modal = document.getElementById("stpageflipEditorModal");

    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = "modal fade stpageflip-editor-modal";
    modal.id = "stpageflipEditorModal";
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    return modal;
  }

  function getBootstrapModal(element) {
    const BS = window.bootstrap || (typeof bootstrap !== "undefined" ? bootstrap : null);
    if (BS && BS.Modal) {
      return new BS.Modal(element);
    }
    return null;
  }

  function showFallbackModal(element) {
    element.style.display = "block";
    element.classList.add("show");
    document.body.classList.add("modal-open");

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    backdrop.id = "stpageflipBackdrop";
    document.body.appendChild(backdrop);

    element.querySelector(".btn-close").addEventListener("click", function () {
      hideFallbackModal(element);
    });
  }

  function hideFallbackModal(element) {
    element.style.display = "";
    element.classList.remove("show");
    document.body.classList.remove("modal-open");

    const backdrop = document.getElementById("stpageflipBackdrop");
    if (backdrop) {
      backdrop.remove();
    }
  }

  async function open(editor) {
    const config = window.StPageFlipEditorButtonConfig;

    if (!config || !config.texts) {
      console.error("[StPageFlip] StPageFlipEditorButtonConfig not set – script may have loaded before the inline config declaration.");
      return;
    }

    config.editor = editor || config.editor;

    const modalElement = ensureModal();
    modalElement.querySelector(".modal-title").textContent = config.texts.title;
    modalElement.querySelector(".modal-body").innerHTML = "<p>Lade Bücher…</p>";

    const modal = getBootstrapModal(modalElement);

    if (modal) {
      modal.show();
    } else {
      console.warn("[StPageFlip] window.bootstrap not found – using fallback modal display.");
      showFallbackModal(modalElement);
    }

    try {
      const payload = await loadBooks(config);
      const books = (payload && payload.books) || [];
      const body = modalElement.querySelector(".modal-body");
      body.innerHTML = "";

      books.forEach((book) => {
        if (book.status === "empty") {
          return;
        }

        const insertable = book.imageCount > 0;
        const wrapper = document.createElement("div");
        wrapper.className = "stpageflip-editor-book";
        const title = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = book.folder;
        title.appendChild(strong);
        wrapper.appendChild(title);
        appendTextLine(wrapper, config.texts.pdf, book.pdfFile || "-");
        appendTextLine(wrapper, config.texts.pages, String(book.imageCount));
        appendTextLine(wrapper, config.texts.status, String(book.status));

        const button = document.createElement("button");
        button.type = "button";
        button.className = insertable ? "btn btn-primary mt-2" : "btn btn-secondary mt-2";
        button.textContent = insertable ? config.texts.insert : config.texts.notInsertable;
        button.disabled = !insertable;

        if (insertable) {
          button.addEventListener("click", function () {
            insertIntoEditor(config.editor, createPlaceholder(book.folder, book.pdfCount > 0, config.defaults));

            if (modal) {
              modal.hide();
            } else {
              hideFallbackModal(modalElement);
            }
          });
        }

        wrapper.appendChild(button);
        body.appendChild(wrapper);
      });

      if (books.filter(b => b.status !== "empty").length === 0) {
        body.innerHTML = "<p>Keine Bücher gefunden.</p>";
      }
    } catch (error) {
      console.error("[StPageFlip] Error loading books:", error);
      modalElement.querySelector(".modal-body").innerHTML = `<p>${config.texts.loadError}</p>`;
    }
  }

  window.StPageFlipEditorButton = { open };
}());
