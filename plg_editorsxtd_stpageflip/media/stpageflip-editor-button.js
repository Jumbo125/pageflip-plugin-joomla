(function () {

  // ── Presets ──────────────────────────────────────────────────────────────
  const PRESETS = {
    standard: {},
    singlepage: {
      'use-portrait':       'true',
      'portrait-breakpoint': '9999',
      'responsive':          'true'
    },
    doublepage: {
      'use-portrait': 'false',
      'responsive':   'true'
    }
  };

  // ── Kleine Hilfsfunktionen ───────────────────────────────────────────────
  function expandHex(hex) {
    if (/^#([0-9a-f]{3})$/i.test(hex)) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
  }

  function parseAndSetFontSize(value, sizeId, unitId) {
    const match = String(value || '').match(/^(\d+(?:\.\d+)?)(px|em|rem|%|vw|vh|pt|cm|mm)$/i);
    const sizeEl = document.getElementById(sizeId);
    const unitEl = document.getElementById(unitId);
    if (!sizeEl || !unitEl) return;
    if (match) {
      sizeEl.value = match[1];
      unitEl.value = match[2].toLowerCase();
    } else {
      sizeEl.value = '';
    }
  }

  function setCheck(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = !!checked;
  }

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function toBool(v) {
    const s = String(v || '').trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'on';
  }

  // ── Payload normalisieren ────────────────────────────────────────────────
  function normalizePayload(payload) {
    if (payload && Array.isArray(payload.data) && payload.data.length > 0) {
      return payload.data[0];
    }
    return payload;
  }

  function appendTextLine(parent, label, value) {
    const line = document.createElement('div');
    line.textContent = `${label}: ${value}`;
    parent.appendChild(line);
  }

  function insertIntoEditor(editor, text) {
    if (window.Joomla && Joomla.editors && Joomla.editors.instances && Joomla.editors.instances[editor]) {
      Joomla.editors.instances[editor].replaceSelection(text);
      return;
    }
    if (window.Joomla && typeof Joomla.insertText === 'function') {
      Joomla.insertText(text, editor);
    }
  }

  // ── Shortcode-Platzhalter erzeugen ───────────────────────────────────────
  function createPlaceholder(folder, hasPdf, settings) {
    const suffix = Math.random().toString(16).slice(2, 8);
    const id = `b-${folder.replace(/[^A-Za-z0-9\-_:.]+/g, '-')}-${suffix}`;
    const values = Object.assign({}, settings || {}, {
      id,
      img:      folder,
      pdf:      folder,
      download: hasPdf ? 'true' : 'false'
    });

    const lines = ['[book'];
    Object.entries(values).forEach(([key, value]) => {
      lines.push(` ${key}="${value}"`);
    });
    lines.push(']');
    return lines.join('\n');
  }

  // ── Bücher per AJAX laden ────────────────────────────────────────────────
  async function loadBooks(config) {
    const body = new URLSearchParams();
    body.append('action', 'scan');
    body.append(config.token, '1');
    const response = await fetch(config.ajaxUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString()
    });
    return normalizePayload(await response.json());
  }

  // ── Einstellungsformular HTML ────────────────────────────────────────────
  function buildSettingsHTML() {
    const btnChecks = [
      ['sfp-slider',            'Slider'],
      ['sfp-bt-options',        'Buttonleiste'],
      ['sfp-home',              'Erste Seite'],
      ['sfp-download',          'Download'],
      ['sfp-prev',              'Zurück'],
      ['sfp-next',              'Weiter'],
      ['sfp-zoom-in',           'Zoom +'],
      ['sfp-zoom-out',          'Zoom −'],
      ['sfp-zoom-default',      'Zoom Reset'],
      ['sfp-zoom-dblclick',     'Zoom per Doppelklick'],
      ['sfp-fullscreen',        'Vollbild'],
      ['sfp-inside-button',     'Buttons im Buch'],
      ['sfp-mousewheel-scroll', 'Mausrad blättern'],
    ];

    const unitOptions = ['em', 'px', 'rem', '%'].map(u => `<option value="${u}">${u}</option>`).join('');

    return `
<div class="sfp-presets mb-3 p-2 rounded bg-light d-flex align-items-center gap-2 flex-wrap">
  <strong class="me-1">Vorlage:</strong>
  <button type="button" class="btn btn-sm btn-outline-secondary" data-sfp-preset="standard">Standard</button>
  <button type="button" class="btn btn-sm btn-outline-secondary" data-sfp-preset="singlepage">Einzelseite immer</button>
  <button type="button" class="btn btn-sm btn-outline-secondary" data-sfp-preset="doublepage">Doppelseite immer</button>
</div>

<details class="sfp-settings-details mb-3" open>
  <summary>Einstellungen ▾</summary>
  <div class="sfp-settings border rounded p-3 mt-2">

    <div class="sfp-section mb-3">
      <div class="sfp-section-title">Seitenansicht</div>
      <div class="d-flex flex-wrap gap-3 align-items-center">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="sfp-use-portrait">
          <label class="form-check-label" for="sfp-use-portrait">Automatisch Einzel-/Doppelseite</label>
        </div>
        <div class="d-flex align-items-center gap-1">
          <label for="sfp-portrait-breakpoint" class="mb-0">Breakpoint:</label>
          <input type="number" class="form-control form-control-sm" id="sfp-portrait-breakpoint" style="width:80px" min="0">
          <span>px</span>
          <small class="text-muted ms-1">(0 = aus · 9999 = immer Einzelseite)</small>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="sfp-center-single">
          <label class="form-check-label" for="sfp-center-single">Letzte Einzelseite zentrieren</label>
        </div>
      </div>
    </div>

    <hr class="my-2">

    <div class="sfp-section mb-3">
      <div class="sfp-section-title">Größe</div>
      <div class="d-flex flex-wrap gap-3 align-items-center">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="sfp-responsive">
          <label class="form-check-label" for="sfp-responsive">Responsive Breite</label>
        </div>
        <div class="d-flex align-items-center gap-1" id="sfp-fixed-width-group" style="display:none!important">
          <label for="sfp-width" class="mb-0">Breite:</label>
          <input type="number" class="form-control form-control-sm" id="sfp-width" style="width:80px" min="1" max="5000">
          <span>px</span>
        </div>
        <div class="d-flex align-items-center gap-1">
          <label for="sfp-aspect-ratio-preset" class="mb-0">Seitenverhältnis:</label>
          <select class="form-select form-select-sm" id="sfp-aspect-ratio-preset" style="width:170px">
            <option value="0.707">DIN A Hochformat (0.707)</option>
            <option value="1.414">DIN A Querformat (1.414)</option>
            <option value="1.7778">16:9 (1.778)</option>
            <option value="1.3333">4:3 (1.333)</option>
            <option value="1.5">3:2 (1.5)</option>
            <option value="1">Quadrat (1:1)</option>
            <option value="custom">Benutzerdefiniert</option>
          </select>
          <input type="number" class="form-control form-control-sm" id="sfp-aspect-ratio" style="width:80px" step="0.001" min="0.1" max="10">
        </div>
      </div>
    </div>

    <hr class="my-2">

    <div class="sfp-section mb-3">
      <div class="sfp-section-title">Buttons anzeigen</div>
      <div class="d-flex flex-wrap gap-2">
        ${btnChecks.map(([id, label]) => `
          <div class="form-check form-check-inline mb-0">
            <input class="form-check-input" type="checkbox" id="${id}">
            <label class="form-check-label" for="${id}">${label}</label>
          </div>`).join('')}
      </div>
    </div>

    <hr class="my-2">

    <div class="sfp-section mb-3">
      <div class="sfp-section-title">Design</div>
      <div class="d-flex flex-wrap gap-3 align-items-center">
        <div class="d-flex align-items-center gap-1">
          <label class="mb-0">Button-Farbe:</label>
          <input type="color" id="sfp-color-picker" class="sfp-color-picker">
          <input type="text" class="form-control form-control-sm" id="sfp-color" style="width:85px" placeholder="#333">
        </div>
        <div class="d-flex align-items-center gap-1">
          <label class="mb-0">Hover-Farbe:</label>
          <input type="color" id="sfp-hover-picker" class="sfp-color-picker">
          <input type="text" class="form-control form-control-sm" id="sfp-hover" style="width:85px" placeholder="#c00">
        </div>
        <div class="d-flex align-items-center gap-1">
          <label class="mb-0">Slider-Farbe:</label>
          <input type="color" id="sfp-slider-color-picker" class="sfp-color-picker">
          <input type="text" class="form-control form-control-sm" id="sfp-slider-color" style="width:85px" placeholder="#333">
        </div>
        <div class="d-flex align-items-center gap-1">
          <label class="mb-0">Slider-Schrift:</label>
          <input type="number" class="form-control form-control-sm" id="sfp-slider-label-size" style="width:70px" min="0" step="0.1" placeholder="—">
          <select class="form-select form-select-sm" id="sfp-slider-label-unit" style="width:65px">${unitOptions}</select>
        </div>
        <div class="d-flex align-items-center gap-1">
          <label class="mb-0">Icon-Schrift:</label>
          <input type="number" class="form-control form-control-sm" id="sfp-slider-icon-size" style="width:70px" min="0" step="0.1" placeholder="—">
          <select class="form-select form-select-sm" id="sfp-slider-icon-unit" style="width:65px">${unitOptions}</select>
        </div>
      </div>
    </div>

    <hr class="my-2">

    <div class="sfp-section">
      <div class="sfp-section-title">Extras</div>
      <div class="d-flex flex-wrap gap-3 align-items-center">
        <div class="d-flex align-items-center gap-1">
          <label for="sfp-density" class="mb-0">Seiten-Typ:</label>
          <select class="form-select form-select-sm" id="sfp-density" style="width:195px">
            <option value="soft">Soft (Standard)</option>
            <option value="hard">Hard (alle Seiten)</option>
            <option value="hard_book">Hard außen, Soft innen</option>
          </select>
        </div>
        <div class="form-check form-check-inline mb-0">
          <input class="form-check-input" type="checkbox" id="sfp-sound">
          <label class="form-check-label" for="sfp-sound">Sound beim Blättern</label>
        </div>
        <div class="form-check form-check-inline mb-0">
          <input class="form-check-input" type="checkbox" id="sfp-reflection">
          <label class="form-check-label" for="sfp-reflection">Spiegelung</label>
        </div>
        <div class="form-check form-check-inline mb-0">
          <input class="form-check-input" type="checkbox" id="sfp-tooltip">
          <label class="form-check-label" for="sfp-tooltip">Tooltips</label>
        </div>
      </div>
    </div>

  </div>
</details>`;
  }

  // ── Formular mit Werten befüllen ─────────────────────────────────────────
  function fillForm(settings) {
    setCheck('sfp-use-portrait',       toBool(settings['use-portrait']));
    setVal('sfp-portrait-breakpoint',  settings['portrait-breakpoint'] ?? '600');
    setCheck('sfp-center-single',      toBool(settings['center-single']));

    const responsive = toBool(settings['responsive']) || settings['width'] === 'responsive';
    setCheck('sfp-responsive', responsive);
    const fixedGroup = document.getElementById('sfp-fixed-width-group');
    if (fixedGroup) fixedGroup.style.display = responsive ? 'none' : '';
    const w = (!responsive && settings['width'] && settings['width'] !== 'false') ? settings['width'] : '';
    setVal('sfp-width', w);

    const ar = String(settings['aspect_ratio'] || '0.707');
    setVal('sfp-aspect-ratio', ar);
    const knownAr = ['0.707', '1.414', '1.7778', '1.3333', '1.5', '1'];
    setVal('sfp-aspect-ratio-preset', knownAr.includes(ar) ? ar : 'custom');

    const boolFields = [
      'slider', 'bt-options', 'home', 'download', 'prev', 'next',
      'zoom-in', 'zoom-out', 'zoom-default', 'zoom-dblclick', 'fullscreen',
      'inside-button', 'mousewheel-scroll'
    ];
    boolFields.forEach(key => setCheck('sfp-' + key, toBool(settings[key])));

    const color = settings['color'] || '';
    setVal('sfp-color', color);
    setVal('sfp-color-picker', color && /^#[0-9a-f]{3,6}$/i.test(color) ? expandHex(color) : '#333333');

    const hover = settings['hover'] || '';
    setVal('sfp-hover', hover);
    setVal('sfp-hover-picker', hover && /^#[0-9a-f]{3,6}$/i.test(hover) ? expandHex(hover) : '#cc0000');

    const sliderColor = settings['slider-color'] || '';
    setVal('sfp-slider-color', sliderColor);
    setVal('sfp-slider-color-picker', sliderColor && /^#[0-9a-f]{3,6}$/i.test(sliderColor) ? expandHex(sliderColor) : '#333333');

    parseAndSetFontSize(settings['slider-label-font-size'], 'sfp-slider-label-size', 'sfp-slider-label-unit');
    parseAndSetFontSize(settings['slider-icon-font-size'],  'sfp-slider-icon-size',  'sfp-slider-icon-unit');

    setVal('sfp-density', settings['density'] || 'soft');
    setCheck('sfp-sound',      toBool(settings['sound']));
    setCheck('sfp-reflection', toBool(settings['reflection']));
    setCheck('sfp-tooltip',    settings['tooltip'] !== undefined ? toBool(settings['tooltip']) : true);
  }

  // ── Formular auslesen ────────────────────────────────────────────────────
  function readFormSettings(defaults) {
    const s = Object.assign({}, defaults);

    s['use-portrait']        = document.getElementById('sfp-use-portrait')?.checked       ? 'true' : 'false';
    s['portrait-breakpoint'] = document.getElementById('sfp-portrait-breakpoint')?.value  || '600';
    s['center-single']       = document.getElementById('sfp-center-single')?.checked      ? 'true' : 'false';

    const responsive = document.getElementById('sfp-responsive')?.checked;
    s['responsive'] = responsive ? 'true' : 'false';
    if (responsive) {
      s['width'] = 'false';
    } else {
      const w = document.getElementById('sfp-width')?.value;
      s['width'] = w ? w : 'false';
    }

    s['aspect_ratio'] = document.getElementById('sfp-aspect-ratio')?.value || '0.707';

    ['slider', 'bt-options', 'home', 'download', 'prev', 'next',
     'zoom-in', 'zoom-out', 'zoom-default', 'zoom-dblclick', 'fullscreen',
     'inside-button', 'mousewheel-scroll'].forEach(key => {
      const el = document.getElementById('sfp-' + key);
      if (el) s[key] = el.checked ? 'true' : 'false';
    });

    s['color']        = document.getElementById('sfp-color')?.value.trim()        || '';
    s['hover']        = document.getElementById('sfp-hover')?.value.trim()        || '';
    s['slider-color'] = document.getElementById('sfp-slider-color')?.value.trim() || '';

    const lblSize = document.getElementById('sfp-slider-label-size')?.value;
    const lblUnit = document.getElementById('sfp-slider-label-unit')?.value || 'em';
    s['slider-label-font-size'] = lblSize ? lblSize + lblUnit : '';

    const iconSize = document.getElementById('sfp-slider-icon-size')?.value;
    const iconUnit = document.getElementById('sfp-slider-icon-unit')?.value || 'em';
    s['slider-icon-font-size'] = iconSize ? iconSize + iconUnit : '';

    s['density']    = document.getElementById('sfp-density')?.value    || 'soft';
    const soundOn   = document.getElementById('sfp-sound')?.checked;
    s['sound']      = soundOn ? 'true' : 'false';
    s['mute']       = soundOn ? 'false' : 'true';
    s['reflection'] = document.getElementById('sfp-reflection')?.checked ? 'true' : 'false';
    s['tooltip']    = document.getElementById('sfp-tooltip')?.checked   ? 'true' : 'false';

    return s;
  }

  // ── Interaktionen im Formular verdrahten ─────────────────────────────────
  function setupFormInteractions(defaults) {
    document.querySelectorAll('[data-sfp-preset]').forEach(btn => {
      btn.addEventListener('click', function () {
        const preset = PRESETS[this.dataset.sfpPreset] || {};
        fillForm(Object.assign({}, defaults, preset));
        document.querySelectorAll('[data-sfp-preset]').forEach(b => {
          b.classList.remove('btn-secondary');
          b.classList.add('btn-outline-secondary');
        });
        this.classList.remove('btn-outline-secondary');
        this.classList.add('btn-secondary');
      });
    });

    const responsiveEl  = document.getElementById('sfp-responsive');
    const fixedGroup    = document.getElementById('sfp-fixed-width-group');
    if (responsiveEl && fixedGroup) {
      responsiveEl.addEventListener('change', function () {
        fixedGroup.style.display = this.checked ? 'none' : '';
      });
    }

    const arPreset = document.getElementById('sfp-aspect-ratio-preset');
    const arInput  = document.getElementById('sfp-aspect-ratio');
    if (arPreset && arInput) {
      arPreset.addEventListener('change', function () {
        if (this.value !== 'custom') arInput.value = this.value;
      });
      arInput.addEventListener('input', function () {
        const known = ['0.707', '1.414', '1.7778', '1.3333', '1.5', '1'];
        if (!known.includes(this.value)) arPreset.value = 'custom';
      });
    }

    syncColorPicker('sfp-color-picker',        'sfp-color');
    syncColorPicker('sfp-hover-picker',        'sfp-hover');
    syncColorPicker('sfp-slider-color-picker', 'sfp-slider-color');
  }

  function syncColorPicker(pickerId, textId) {
    const picker = document.getElementById(pickerId);
    const text   = document.getElementById(textId);
    if (!picker || !text) return;
    picker.addEventListener('input', function () { text.value = this.value; });
    text.addEventListener('input', function () {
      const expanded = expandHex(this.value.trim());
      if (/^#[0-9a-f]{6}$/i.test(expanded)) picker.value = expanded;
    });
  }

  // ── Modal DOM ────────────────────────────────────────────────────────────
  function ensureModal() {
    let modal = document.getElementById('stpageflipEditorModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'modal fade stpageflip-editor-modal';
    modal.id = 'stpageflipEditorModal';
    modal.tabIndex = -1;
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    return modal;
  }

  function getBootstrapModal(element) {
    const BS = window.bootstrap || (typeof bootstrap !== 'undefined' ? bootstrap : null);
    if (BS && BS.Modal) return new BS.Modal(element);
    return null;
  }

  function showFallbackModal(element) {
    element.style.display = 'block';
    element.classList.add('show');
    document.body.classList.add('modal-open');
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'stpageflipBackdrop';
    document.body.appendChild(backdrop);
    element.querySelector('.btn-close').addEventListener('click', function () {
      hideFallbackModal(element);
    });
  }

  function hideFallbackModal(element) {
    element.style.display = '';
    element.classList.remove('show');
    document.body.classList.remove('modal-open');
    const backdrop = document.getElementById('stpageflipBackdrop');
    if (backdrop) backdrop.remove();
  }

  // ── Hauptfunktion ────────────────────────────────────────────────────────
  async function open(editor) {
    const config = window.StPageFlipEditorButtonConfig;
    if (!config || !config.texts) {
      console.error('[StPageFlip] StPageFlipEditorButtonConfig not set.');
      return;
    }
    config.editor = editor || config.editor;

    const modalElement = ensureModal();
    modalElement.querySelector('.modal-title').textContent = config.texts.title;

    const bodyEl = modalElement.querySelector('.modal-body');
    bodyEl.innerHTML = buildSettingsHTML() + `
      <div class="sfp-book-list mt-3">
        <h6>${config.texts.title || 'Bücher'}</h6>
        <p>Lade Bücher…</p>
      </div>`;

    setupFormInteractions(config.defaults);
    fillForm(config.defaults);

    const modal = getBootstrapModal(modalElement);
    if (modal) {
      modal.show();
    } else {
      console.warn('[StPageFlip] window.bootstrap nicht gefunden – Fallback-Modal.');
      showFallbackModal(modalElement);
    }

    try {
      const payload = await loadBooks(config);
      const books   = (payload && payload.books) || [];
      const listEl  = bodyEl.querySelector('.sfp-book-list');

      listEl.innerHTML = `<h6 class="mt-2 mb-2">Bücher</h6>`;

      const visible = books.filter(b => b.status !== 'empty');
      if (visible.length === 0) {
        listEl.innerHTML += '<p>Keine Bücher gefunden.</p>';
        return;
      }

      visible.forEach(book => {
        const insertable = book.imageCount > 0;
        const wrapper    = document.createElement('div');
        wrapper.className = 'stpageflip-editor-book';

        const strong = document.createElement('strong');
        strong.textContent = book.folder;
        wrapper.appendChild(strong);

        appendTextLine(wrapper, config.texts.pdf,    book.pdfFile || '-');
        appendTextLine(wrapper, config.texts.pages,  String(book.imageCount));
        appendTextLine(wrapper, config.texts.status, String(book.status));

        const button = document.createElement('button');
        button.type      = 'button';
        button.className = insertable ? 'btn btn-primary btn-sm mt-2' : 'btn btn-secondary btn-sm mt-2';
        button.textContent = insertable ? config.texts.insert : config.texts.notInsertable;
        button.disabled  = !insertable;

        if (insertable) {
          button.addEventListener('click', function () {
            const settings = readFormSettings(config.defaults);
            insertIntoEditor(config.editor, createPlaceholder(book.folder, book.pdfCount > 0, settings));
            if (modal) {
              modal.hide();
            } else {
              hideFallbackModal(modalElement);
            }
          });
        }

        wrapper.appendChild(button);
        listEl.appendChild(wrapper);
      });

    } catch (error) {
      console.error('[StPageFlip] Fehler beim Laden der Bücher:', error);
      bodyEl.querySelector('.sfp-book-list').innerHTML = `<p>${config.texts.loadError}</p>`;
    }
  }

  window.StPageFlipEditorButton = { open };
}());
