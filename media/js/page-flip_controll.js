

//Debug modus
const debugValue = document.getElementById('stpageflip_debug')?.value;
const default_panzoom_zoom = 1;

if (debugValue === 'true') {
    console.log('Debug-Modus ist aktiviert');
} else {
    console.log('Debug-Modus ist deaktiviert');
}

function show_debug_msg(text){
  if (debugValue === "true"){
    console.log(text);
  }
}
//-----------------------------------------------------------------------------------------

//check if panzoom ferfügbar ist, stpageflip und jquery
// jQuery prüfen
    if (typeof jQuery === 'function') {
        show_debug_msg('✅ jQuery geladen');
    } else {
        show_debug_msg('❌ jQuery konnte nicht geladen werden');
    }

    // St.PageFlip prüfen
    if (typeof St !== 'undefined' && typeof St.PageFlip === 'function') {
        show_debug_msg('✅ St.PageFlip verfügbar');
    } else {
        show_debug_msg('❌ St.PageFlip NICHT verfügbar');
    }

    // panzoom prüfen
  if (typeof window.Panzoom === 'function') {
  console.log('✅ Panzoom vorhanden.');

  // Optional: genauere Prüfung, aber OHNE DOM-Manipulation
  if (Panzoom.prototype?.zoomIn) {
    console.log('✅ zoomIn-Methode verfügbar.');
  } else {
    console.warn('⚠️ zoomIn nicht im Prototype.');
  }
} else {
  console.error('❌ Panzoom ist nicht verfügbar.');
}

//Detect brwose ios
function detectOS() {
  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "unknown";
}

function detectBrowser() {
  const ua = navigator.userAgent;

  if (/CriOS/.test(ua)) return "Chrome on iOS";
  if (/FxiOS/.test(ua)) return "Firefox on iOS";
  if (/EdgiOS/.test(ua)) return "Edge on iOS";
  if (/OPiOS/.test(ua)) return "Opera on iOS";
  if (/Safari/.test(ua) && /iPhone|iPad|iPod/.test(ua)) return "Safari on iOS";
  if (/Chrome/.test(ua)) return "Chrome";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Safari/.test(ua)) return "Safari";
  if (/Edge/.test(ua)) return "Edge";
  return "unknown";
}


//buich id ist ohne # zeichen
function check_current_panzoom(buch_id){
    init_panzoom_if_needed(buch_id);
    //teste den default zoom
    const panzoom = PageFlipRegistry[buch_id].panzoom;
    if (!panzoom) return;
    const current = panzoom.getScale();
    let $controll_leiste;

    //passenden slider suchen
      jQuery(".slider").each(function () {
       show_debug_msg("Slider gefunden und zugeordnert: " + jQuery(this).attr("data-book-id"));
        if (jQuery(this).attr("data-book-id") == "#" + buch_id) {
          $controll_leiste = jQuery(this).parent();

        }
      });
    
      //panzoom wieder löschen
      panzoom.destroy();

      //dragable curor entfernen
    const $wrapper = jQuery("#" + buch_id).find(".stf__wrapper");
        if ($wrapper.length > 0) {
          $wrapper.css({
            cursor: 'default'
          });
        }


    if (current == default_panzoom_zoom){
      $controll_leiste.find(".bt-icon-zoom-standard").addClass("pdf_control_none");
      return true;
    }
    else {
       $controll_leiste.find(".bt-icon-zoom-standard").removeClass("pdf_control_none");
      return false;
    }

    
      
  
}

function check_if_move(buch_id){


}

//------------------------
jQuery(document).ready(function () {
  
  
  jQuery("body").find(".flip-book").each(function () {
    const id = jQuery(this).attr('id');
    if (id) {
      show_debug_msg("Buch mit der ID #" + id + " gefunden");
      controlls_for_book('#' + id);
    }
    else{
      show_debug_msg("kein buch gefunden");
    }
  });
});

const PageFlipRegistry = {};
const lastDblClick = new WeakMap();

let userInteracted = false;
// Registrierung der ersten User-Interaktion
function handleFirstInteraction() {
  userInteracted = true;
  // Listener entfernen
  document.removeEventListener('mousedown', handleFirstInteraction);
  document.removeEventListener('touchstart', handleFirstInteraction);

}
document.addEventListener('mousedown', handleFirstInteraction);
document.addEventListener('touchstart', handleFirstInteraction);



// Hilfsfunktion zum Parsen von booleschen data-* Attributen aus .attr()
const getAttrBool = ($container, key, fallback) => {
  const val = $container.attr('data-' + key);
  if (val === undefined) return fallback;
  return val === "true" || val === true;
};

// String-/Farbwerte direkt per .attr() (damit keine gecachten Werte verwendet werden)
const getAttrValue = ($container, key, fallback) => {
  const val = $container.attr('data-' + key);
  return val !== undefined && val !== "" ? val : fallback;
};



function controlls_for_book(ID, data_height, data_width, aspect_ratio, din_format, single_center, mousewheel_scroll, density, slider, bt_options, home, download, prev, next, zoom_in, zoom_out, zoom_default, zoom_dblclick, fullscreen, reflection, tooltip, sound, transform, inside_button, color, color_hover) {

show_debug_msg("controlls_for_book wird für Buch " + ID + " ausgeführt" );

  // Arrays und variablen deklarieren###############################################
  // controlls Text bzw. wie und welche Symbole angezeigt werden ###############

  let control_text = `
<!-- controls -->
<div class="controls" data-mousewheel-scroll="false">
  <div class="slider">
    <p>
      Seite <span class="current_page"></span> von <span class="all_sites"></span><br />
      Umblättern:<br />
      <input type="range" class="pdf-book-slider" data-pdf-book="pdf_id" min="1" max_seitanzahl="" step="1" value="1">
    </p>
  </div>

  <div class="bt-options">
    <a class="bt-icon-home" title="Zur ersten Seite">
      <abbr title="Erste Seite"></abbr>
      <i class="bi bi-house home" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-download" title="PDF speichern" download_src>
      <abbr title="Download PDF"></abbr>
      <i class="bi bi-download pdf-download" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-prev" title="zurück">
      <abbr title="Zurück"></abbr>
      <i class="bi bi-arrow-left-circle prev" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-next" title="weiter">
      <abbr title="Weiter"></abbr>
      <i class="bi bi-arrow-right-circle next" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-zoom-in" title="zoom-plus">
      <abbr title="Zoom +"></abbr>
      <i class="bi bi-zoom-in zoom-in" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-zoom-out" title="zoom-minus">
      <abbr title="Zoom -"></abbr>
      <i class="bi bi-zoom-out zoom-out" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-zoom-standard" title="zoom-normal">
      <abbr title="Standardgröße"></abbr>
      <i class="bi bi-eyeglasses zoom-default" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-move" title="Verschieben">
      <abbr title="Bewegen"></abbr>
      <i class="bi bi-arrows-move move" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-back" title="Reset">
      <abbr title="Standard Platzierung"></abbr>
      <i class="bi bi-bootstrap-reboot back" data-pdf-book="pdf_id"></i>
    </a>

    <a class="bt-icon-fullscreen" title="Vollbild">
      <abbr title="Vollbild"></abbr>
      <i class="bi bi-fullscreen fullscreen" data-pdf-book="pdf_id"></i>
    </a>

     <a class="bt-icon-sound" title="Sound">
      <abbr title="Sound"></abbr>
     
    </a>
  </div>
</div>

<!-- /controls -->

<!-- miniatures -->
<div id="miniatures" class="ui-miniatures-slider" data-pdf-book="pdf_id">
</div>
<!-- /miniatures -->
`.trim();

  const formats = [
    // 📄 DIN A-Reihe (Hochformat)
    { name: "A0", aspectRatio: 841 / 1189 },  // ≈ 0.707
    { name: "A1", aspectRatio: 594 / 841 },
    { name: "A2", aspectRatio: 420 / 594 },
    { name: "A3", aspectRatio: 297 / 420 },
    { name: "A4", aspectRatio: 210 / 297 },
    { name: "A5", aspectRatio: 148 / 210 },
    { name: "A6", aspectRatio: 105 / 148 },
    { name: "A7", aspectRatio: 74 / 105 },
    { name: "A8", aspectRatio: 52 / 74 },

    // 🖥️ Bildschirm-/Video-Formate
    { name: "16:9", aspectRatio: 16 / 9 },
    { name: "4:3", aspectRatio: 4 / 3 },
    { name: "3:2", aspectRatio: 3 / 2 },
    { name: "21:9", aspectRatio: 21 / 9 },
    { name: "1:1", aspectRatio: 1 },
    { name: "9:16", aspectRatio: 9 / 16 },

    // 📸 Fotoformate
    { name: "5x7", aspectRatio: 5 / 7 },
    { name: "8x10", aspectRatio: 8 / 10 },
    { name: "2:3", aspectRatio: 2 / 3 },

    // 📚 Flipbook-geeignet (Klassisch)
    { name: "Portrait Standard", aspectRatio: 0.707 }, // z. B. für DIN A4
    { name: "Comic/Manga", aspectRatio: 0.65 },
    { name: "Square", aspectRatio: 1.0 },
    { name: "Wide Book", aspectRatio: 1.4 }
  ];


  const buch_id = ID;
  const buch_id_without_idselector = ID.replace("#", "");
  const $container = jQuery(buch_id);
  const download_pdf_link = jQuery(buch_id).data("pdf-src");
  const $turn_js_container = jQuery(buch_id);
  const dir = $turn_js_container.data("img-src");
  //const php_file = $turn_js_container.attr("data-base-path") + "php/request.php";
  const php_file = "php/request.php";

  data_width = data_width !== undefined ? data_width : getAttrValue($container, "width", "false");
  data_height = data_height !== undefined ? data_height : getAttrValue($container, "height", "false");
  aspect_ratio = aspect_ratio !== undefined ? aspect_ratio : getAttrValue($container, "aspect_ratio", "0.707");
  din_format = din_format !== undefined ? din_format : getAttrValue($container, "din_format", "not_use");
  density = density !== undefined ? density : getAttrValue($container, "density", "soft");
  single_center = single_center !== undefined ? single_center : getAttrBool($container, "center-single", false);



  //Wenn data_width responsive gesetzt ist, holt js automatisch die vorhandene größe des parent divs und setzt das Bild auf diese größe
  if (data_width == "responsive") {
    data_width = $container.width();
    data_height = data_width * aspect_ratio;
  }
  // Wenn din_format gesetzt ist, hole den aspect_ratio
  if (din_format !== "not_use") {
    const format = formats.find(f => f.name.toLowerCase() === din_format.toLowerCase());
    if (format) {
      aspect_ratio = format.aspectRatio;
    }
  }

  // Werte zu Zahlen casten, wenn nötig
  let numericWidth = data_width !== "false" ? parseFloat(data_width) : false;
  let numericHeight = data_height !== "false" ? parseFloat(data_height) : false;
  aspect_ratio = parseFloat(aspect_ratio);

  // Abhängig davon, was gesetzt ist, berechne fehlende Maße
  if (!numericWidth && !numericHeight) {
    numericHeight = 500;
    numericWidth = Math.round(numericHeight * aspect_ratio);
  } else if (!numericWidth && numericHeight) {
    numericWidth = Math.round(numericHeight * aspect_ratio);
  } else if (numericWidth && !numericHeight) {
    numericHeight = Math.round(numericWidth / aspect_ratio);
  }


  const $img_files = jQuery(buch_id + '_img_files');
  const filenames = $img_files.val().split(',');
  const img_files_dir = $img_files.data('img-path');
  show_debug_msg("input tag mit bilddaten: " + $img_files);
  show_debug_msg("img daten: " + filenames);
  show_debug_msg("img pfad: " + img_files_dir);


  if (Array.isArray(filenames)) {
    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      let pageDensity;

      if (density === 'hard_book') {
        if (i === 0 || i === filenames.length - 1) {
          pageDensity = 'hard';
        } else {
          pageDensity = 'soft';
        }
      } else {
        pageDensity = density; // z. B. 'hard' oder 'soft'
      }

      const $page = jQuery(`
                  <div class="page" data-density="${pageDensity}">
                      <div class="page-image" style="background-image: url('${img_files_dir}/${filename}')"></div>
                  </div>
              `);

      $turn_js_container.append($page);
    }

    if (!$turn_js_container.data('has-turn')) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPageFlip);
      } else {
        initPageFlip();
      }
    }
  }
  else {
    show_debug_msg('Antwort ist kein Array:', response);
  }



  function initPageFlip() {

    const pageFlip = new St.PageFlip(
      document.getElementById(buch_id_without_idselector),
      {
        width: numericWidth,
        height: numericHeight,
        size: "fixed",
        showCover: true,
        maxShadowOpacity: 0.5,
        mobileScrollSupport: true,
        useMouseEvents: true
      }
    );
    
    const pages = document.querySelectorAll(`${buch_id} .page`);
    if (pages.length > 0) {
      pageFlip.loadFromHTML(pages);
      show_debug_msg(`✅ ${pages.length} Seite(n) in PageFlip geladen für "${buch_id_without_idselector}".`);
    } else {
      show_debug_msg(`❌ Keine Seiten gefunden für "${buch_id}" – PageFlip kann nicht initialisiert werden.`);
    }

    $turn_js_container.data('has-turn', true);
    
    PageFlipRegistry[buch_id_without_idselector] = {
      instance: pageFlip,
      $element: jQuery(buch_id),
      zoom: default_panzoom_zoom,
      panzoom: null, // kommt später rein
      sound: null //kommt später rein, falls sound true ist 
    };
    // Nach dem Eintrag prüfen, ob wirklich gespeichert wurde
    if (
      PageFlipRegistry.hasOwnProperty(buch_id_without_idselector) &&
      PageFlipRegistry[buch_id_without_idselector]?.instance === pageFlip
    ) {
      show_debug_msg(`✅ PageFlip-Instanz für "${buch_id_without_idselector}" in Registry gespeichert.`);
    } else {
      show_debug_msg(`❌ Fehler: PageFlip-Instanz konnte NICHT in Registry gespeichert werden für "${buch_id_without_idselector}".`);
    }
    //aktuelle position speichern um nach vreschie manöver zurückzusetzetn

    
    jQuery(buch_id).attr("data-original-left", jQuery(buch_id).css('left'));
    jQuery(buch_id).attr("data-original-top", jQuery(buch_id).css('top'));

    // Buch informationen
    const totalPages = pageFlip.getPageCount();



    pageFlip.on("flip", () => {

      if (single_center === true) {
        const currentPageIndex = pageFlip.getCurrentPageIndex();

        const page = pageFlip.getPage(currentPageIndex);
        const pageElement = page?.getElement();

        if (!pageElement) return;

        // Erstmal entfernen
        document.querySelectorAll(".page.centered-page").forEach(el =>
          el.classList.remove("centered-page")
        );

        if (currentPageIndex === totalPages - 1) {
          // leicht verzögert, damit PageFlip-Animation durch ist

          requestAnimationFrame(() => {
            setTimeout(() => {
              pageElement.classList.add("centered-page");
            }, 50); // Delay einstellbar, z. B. 50–100 ms
          });
        }
      }
    });


    setTimeout(() => {
      initializeControls(pageFlip);
    }, 50);
  }

    // Hilfsfunktion: Setzt oder entfernt "pdf_control_none" je nach Bedingung
    function toggleButtonVisibility($button, shouldHide) {
      $button.toggleClass("pdf_control_none", shouldHide);
    }

  function initializeControls(pageFlip_Instanz) {

    //Seitennummer aktualisiern
    function update_pagenumber(pageFlip_Instanz, $buch) {
      const max_seitenAnzahl = pageFlip_Instanz.getPageCount();
      const first_site = 1;
      const last_site = max_seitenAnzahl;
      const seitenanzahl = pageFlip_Instanz.getPageCount();
      const currentIndex = pageFlip_Instanz.getCurrentPageIndex();
      const aktuelleSeite = currentIndex + 1; // weil 0-basiert

      let portrait = false;
      const $pageFlip_wrapper = $buch.find('.stf__wrapper');
      let $controll_leiste;

      //passenden slider suchen
      jQuery(".slider").each(function () {
       show_debug_msg("Slider gefunden und zugeordnert: " + jQuery(this).attr("data-book-id"));
        if (jQuery(this).attr("data-book-id") == "#" + $buch.attr("id")) {
          $controll_leiste = jQuery(this).parent();
        }
      });
      if (jQuery(".slider").length <= 0 ){
        show_debug_msg("kein Slider gefunden");
      }

      if ($pageFlip_wrapper.hasClass("--portrait")) {
        portrait = true;
      }

            // Slider-Maximum setzen
          $controll_leiste.find('.pdf-book-slider').attr("max", last_site);

          if (!portrait) {
            // Doppelseiten-Modus (nicht erste/letzte Seite)
            if (aktuelleSeite !== first_site && aktuelleSeite !== last_site) {
              const human_aktuelleSeite = aktuelleSeite + 1;
              $controll_leiste.find('.pdf-book-slider').attr("step", "2");
              

              let linke_seite, rechte_seite, sliderSeite;

              if (human_aktuelleSeite % 2 === 0) {
                // Gerade Seite – linke Seite ist human_aktuelleSeite
                linke_seite = human_aktuelleSeite;
                rechte_seite = human_aktuelleSeite + 1;
                sliderSeite = linke_seite;
              } else {
                // Ungerade Seite – rechte Seite ist human_aktuelleSeite
                rechte_seite = human_aktuelleSeite;
                linke_seite = human_aktuelleSeite - 1;
                sliderSeite = linke_seite;
              }

              // Vor-/Zurück-Buttons außen
              if (jQuery(buch_id).attr("data-prev") == "true" && jQuery(buch_id).attr("data-next") == "true") {
                toggleButtonVisibility($controll_leiste.find('.bt-icon-next'), rechte_seite >= max_seitenAnzahl);
                toggleButtonVisibility($controll_leiste.find('.bt-icon-prev'), linke_seite <= 1);
              }

              // Buttons innen (z. B. im Buch)
              if (jQuery(buch_id).attr("data-inside-button") == "true") {
                toggleButtonVisibility(jQuery(buch_id).find('.next_inside'), aktuelleSeite >= max_seitenAnzahl);
                toggleButtonVisibility(jQuery(buch_id).find('.prev_inside'), aktuelleSeite <= 1);
              }

              // Anzeige & Slider
              $controll_leiste.find('.current_page').html(linke_seite + " und " + rechte_seite);
              $controll_leiste.find('.all_sites').html(seitenanzahl);
              $controll_leiste.find(".pdf-book-slider").val(sliderSeite);
            }

            // Erste oder letzte Seite im Doppelseiten-Modus
            else {
              
              // Außen-Buttons
              if (jQuery(buch_id).attr("data-prev") == "true" && jQuery(buch_id).attr("data-next") == "true") {
                toggleButtonVisibility($controll_leiste.find('.bt-icon-next'), aktuelleSeite >= max_seitenAnzahl);
                toggleButtonVisibility($controll_leiste.find('.bt-icon-prev'), aktuelleSeite <= 1);
              }

              // Innen-Buttons
              if (jQuery(buch_id).attr("data-inside-button") == "true") {
                toggleButtonVisibility(jQuery(buch_id).find('.next_inside'), aktuelleSeite >= max_seitenAnzahl);
                toggleButtonVisibility(jQuery(buch_id).find('.prev_inside'), aktuelleSeite <= 1);
              }

              // Anzeige & Slider
              $controll_leiste.find('.current_page').html(aktuelleSeite);
              $controll_leiste.find('.all_sites').html(seitenanzahl);
              console.log(aktuelleSeite);
              if (aktuelleSeite == 1 ){
                  $controll_leiste.find(".pdf-book-slider").val(aktuelleSeite);
              }
              else{
                //muss lettze seite sein
                console.log(max_seitenAnzahl);
                //step auf 1 setzten, damit es keine probleme bei der anzahl gibt
                  $controll_leiste.find('.pdf-book-slider').attr("step", "1");
                  $controll_leiste.find(".pdf-book-slider").val(max_seitenAnzahl+1);
              }
            
            }
          }

          // Portrait-Modus (Einzelseitenanzeige)
          else {
            $controll_leiste.find('.pdf-book-slider').attr("step", "1");

            // Außen-Buttons
            if (jQuery(buch_id).attr("data-prev") == "true" && jQuery(buch_id).attr("data-next") == "true") {
              toggleButtonVisibility($controll_leiste.find('.bt-icon-next'), aktuelleSeite >= max_seitenAnzahl);
              toggleButtonVisibility($controll_leiste.find('.bt-icon-prev'), aktuelleSeite <= 1);
            }

            // Innen-Buttons
            if (jQuery(buch_id).attr("data-inside-button") == "true") {
              toggleButtonVisibility(jQuery(buch_id).find('.next_inside'), aktuelleSeite >= max_seitenAnzahl);
              toggleButtonVisibility(jQuery(buch_id).find('.prev_inside'), aktuelleSeite <= 1);
            }

            // Anzeige & Slider
            $controll_leiste.find('.current_page').html(aktuelleSeite);
            $controll_leiste.find('.all_sites').html(seitenanzahl);
            $controll_leiste.find(".pdf-book-slider").val(aktuelleSeite);
          }

}


    //---------------Reflection Function
    function update_reflaction(pageFlip_Instanz, $buchelement, direction = false, nextPage = false) {
      const max_seitenAnzahl = pageFlip_Instanz.getPageCount();
      const first_site = 0;
      const last_site = max_seitenAnzahl - 1;
      const aktuelleSeite = pageFlip_Instanz.getCurrentPageIndex();
      const aktuelleSeiteDom = pageFlip_Instanz.getPage(aktuelleSeite).getElement();
      const $aktuelleSeite = jQuery(aktuelleSeiteDom);
      const current_image = $aktuelleSeite.children(".page-image").css("backgroundImage");
      const page_width = $aktuelleSeite.children(".page-image").width();
      let portrait = false;
      const reflection_height = "5vh";
      let $reflection_div;
      const $pageFlip_wrapper = $buchelement.find('.stf__wrapper');
      let $controll_leiste;
      let left_img;
      let right_img;


      //controlleiste initialisieren
      jQuery(".slider").each(function () {
        if (jQuery(this).attr("data-book-id") == "#" + $buchelement.attr("id")) {
          $controll_leiste = jQuery(this).parent();
          show_debug_msg(" Controllleiste gefunden");
        }
      });

      if ($pageFlip_wrapper.hasClass("--portrait")) {
        portrait = true;
      }

      //falls nicht im portrait design, wird doppelseitig angezeigt, daher gibt es reflections div auch für zwei seiten
      if (portrait === false) {
        if (aktuelleSeite == first_site || aktuelleSeite == last_site) {
          $reflection_div = jQuery("<div class='reflection_wrapper'><div class='reflection_full reflection'></div></div>");
          $reflection_div.find(".reflection_full").css("backgroundImage", current_image);
          if (aktuelleSeite == last_site) {
            $reflection_div.css({ "width": "50%", "left": "50%", "translate": "-50%" })
          }
          if (aktuelleSeite == first_site) {
            $reflection_div.css({ "width": "50%", "right": "0%" })
          }
        }
        //Mittelteil, => Nicht erste Seite und auch nicht letzte Seite
        else {
          //Da stpageFlip mit 0  beginnt (Seite 1 ist Seite 0), muss für die korrekte Feststellung +1 zur aktuellen Seite gerechnet werden
          const human_aktuelleSeite = aktuelleSeite + 1;
          if (human_aktuelleSeite % 2 === 0) {
            //aktuelle seite ist eine garde zahl, daher ist die Linke Seite die aktuelle.  links plus 1 für recht seite
            left_img = current_image;
            //bild der rechten seite ermitteln
            const nextSeite = aktuelleSeite + 1;
            const nextSeiteDom = pageFlip_Instanz.getPage(nextSeite).getElement();
            const $nextSeite = jQuery(nextSeiteDom);
            const next_image = $nextSeite.children(".page-image").css("backgroundImage");
            right_img = next_image;
          }
          else if (human_aktuelleSeite % 2 !== 0) {
            //aktuelle seite ist eine ungarde zahl, daher ist die rechte Seite die aktuelle.  rechte Seite minus 1 für linke seite
            right_img = current_image;
            //bild der rechten seite ermitteln
            const prevSeite = aktuelleSeite - 1;
            const prevSeiteDom = pageFlip_Instanz.getPage(prevSeite).getElement();
            const $prevSeite = jQuery(prevSeiteDom);
            const prev_image = $prevSeite.children(".page-image").css("backgroundImage");
            left_img = prev_image;
          }
          $reflection_div = jQuery("<div class='reflection_wrapper'><div class='reflection_left reflection'></div><div class='reflection_right reflection'></div></div>").css("width", "100%");
          $reflection_div.find(".reflection_left").css("backgroundImage", left_img);
          $reflection_div.find(".reflection_right").css("backgroundImage", right_img);
        }
      }
      else {
        $reflection_div = jQuery("<div class='reflection_wrapper'><div class='reflection_full reflection'></div></div>");
        $reflection_div.find(".reflection_full").css("backgroundImage", current_image);
        $reflection_div.css({ "width": page_width, "left": "50%", "translate": "-50%" });

      }

      $reflection_div.css({
        "height": reflection_height,
        "position": "absolute",
        "bottom": "-" + reflection_height,
        "visibility": "visible"
      });

      $reflection_div.find(".reflection").css({
        'height': 'inherit',
        'opacity': 1,
        'pointer-events': 'none',
        'background-size': 'cover',
        'mask-image': 'linear-gradient(rgba(0, 0, 0, 0.4), transparent)',
        '-webkit-mask-image': 'linear-gradient(rgba(0, 0, 0, 0.4), transparent)',
      });

      //controllliste nun auch weiter nach untensetzen, damit platz für die reflection ist
      $controll_leiste.css("marginTop", reflection_height);

      if ($pageFlip_wrapper.find(".reflection_wrapper").length <= 0) {
        $pageFlip_wrapper.append($reflection_div);
      }
      else {
        $pageFlip_wrapper.find(".reflection_wrapper").remove();
        $pageFlip_wrapper.append($reflection_div);
      }
    }

    //Default Initialisierung
    // Daten vom HTML-Tag auslesen, falls Parameter undefined sind
    mousewheel_scroll = mousewheel_scroll !== undefined ? mousewheel_scroll : getAttrBool($container, "mousewheel-scroll", false);
    density = density !== undefined ? density : getAttrValue($container, "density", "soft");
    slider = slider !== undefined ? slider : getAttrBool($container, "slider", true);
    bt_options = bt_options !== undefined ? bt_options : getAttrBool($container, "bt-options", true);
    home = home !== undefined ? home : getAttrBool($container, "home", true);
    download = download !== undefined ? download : getAttrBool($container, "download", true);
    prev = prev !== undefined ? prev : getAttrBool($container, "prev", true);
    next = next !== undefined ? next : getAttrBool($container, "next", true);
    zoom_in = zoom_in !== undefined ? zoom_in : getAttrBool($container, "zoom-in", true);
    zoom_out = zoom_out !== undefined ? zoom_out : getAttrBool($container, "zoom-out", true);
    zoom_default = zoom_default !== undefined ? zoom_default : getAttrBool($container, "zoom-default", true);
    zoom_dblclick = zoom_dblclick !== undefined ? zoom_dblclick : getAttrBool($container, "zoom-dblclick", false);
    fullscreen = fullscreen !== undefined ? fullscreen : getAttrBool($container, "fullscreen", true);
    reflection = reflection !== undefined ? reflection : getAttrBool($container, "reflection", false);
    tooltip = tooltip !== undefined ? tooltip : getAttrBool($container, "tooltip", true);
    transform = transform !== undefined ? transform : getAttrBool($container, "transform", true);
    inside_button = inside_button !== undefined ? inside_button : getAttrBool($container, "inside-button", false);
    sound = sound !== undefined ? sound : getAttrBool($container, "sound", false);
    color = color !== undefined ? color : getAttrValue($container, "color", null);
    color_hover = color_hover !== undefined ? color_hover : getAttrValue($container, "color-hover", null);




    //-----------------------------------------------------------------------------------------------------------------------------------
    //Anzahl der Seiten im Buch ausgeben
    const seitenanzahl = pageFlip_Instanz.getPageCount();

    control_text = control_text.replace(/pdf_id/g, buch_id);
    const $controls = jQuery(control_text); // in jQuery-Objekt umwandeln
    const currentIndex = pageFlip_Instanz.getCurrentPageIndex();
    const aktuelleSeite = currentIndex + 1; // weil 0-basiert


    $controls.find('.pdf-book-slider')
      .attr('data-pdf-book', buch_id)
      .attr('max', seitenanzahl);

    $controls.find('.pdf-download')
      .attr('href', download_pdf_link)
      .attr('download', '');

    $controls.find('.bt-options').attr('data-book-id', buch_id);
    $controls.find('.slider').attr('data-book-id', buch_id);

    //Seite x von Seite x im Slider einfügen
    $controls.find('.current_page').html(aktuelleSeite);
    $controls.find('.all_sites').html(seitenanzahl);


    //nun werden nicht erwünschte controlls entfernt

    // Sichtbarkeit einzelner Steuer-Elemente anhand der übergebenen Parameter
    if (slider === false) {
      $controls.find('.slider').addClass('pdf_control_none');
    }

    if (bt_options === false) {
      $controls.find('.bt-options').addClass('pdf_control_none');
    }

    if (home === false) {
      $controls.find('.bt-icon-home').addClass('pdf_control_none');
    }

    if (download === false) {
      $controls.find('.bt-icon-download').addClass('pdf_control_none');
    }

    if (prev === false) {
      $controls.find('.bt-icon-prev').addClass('pdf_control_none');
    }

    if (next === false) {
      $controls.find('.bt-icon-next').addClass('pdf_control_none');
    }

    if (zoom_in === false) {
      $controls.find('.bt-icon-zoom-in').addClass('pdf_control_none');
    }

    if (zoom_out === false) {
      $controls.find('.bt-icon-zoom-out').addClass('pdf_control_none');
    }

    if (zoom_default === false) {
      $controls.find('.bt-icon-zoom-standard').addClass('pdf_control_none');
    }

    if (zoom_dblclick === false) {
      $container.attr('zoom-dblclick', 'false');
    }
    else {
      $container.attr('zoom-dblclick', 'true');
      $container.attr("data-dbl-zoomed", "false");
    }


    if (fullscreen === false) {
      $controls.find('.bt-icon-fullscreen').addClass('pdf_control_none');
    }

    if (sound === true) {
      $controls.find('.bt-icon-sound').addClass('sound_on');
      //sound enable or disable in intsanz
      PageFlipRegistry[buch_id.replace("#", "")].sound = true;

    }
    else {
      PageFlipRegistry[buch_id.replace("#", "")].sound = false;
    }

    // transform
    if (!transform) {
      $controls.find('.bt-icon-book').addClass('pdf_control_none');
    }

    if (tooltip == false) {
      $controls.find("abbr").each(function () {
        jQuery(this).css("display", "none");

      });
    }

    //Button color setzten
    const idSafe = buch_id.replace("#", "") + "_button_color";
    const $btOptions = $controls.find('.bt-options');

    if (!$btOptions.attr('id')) {
      $btOptions.attr('id', idSafe);
    }

    // Jetzt Styles dynamisch anhängen
    let styleContent = "";

    if (color) {
      styleContent += `#${idSafe} i.bi { color: ${color} !important; }\n`;
    }

    if (color_hover) {
      styleContent += `#${idSafe} i.bi:hover { color: ${color_hover} !important; }\n`;
    }

    if (styleContent !== "") {
      jQuery("head").append(`<style type="text/css">${styleContent}</style>`);
    }


    if (mousewheel_scroll === true) {
      $controls.attr('data-mousewheel-scroll', 'true');
    } else {
      $controls.attr('data-mousewheel-scroll', 'false');
    }

    //Buch umschlißene#############################
    // Elemente vorbereiten
    const $buch = jQuery(buch_id);

    // Buch verschachteln
    $buch.wrap('<div class="pdf_book_wrapper"></div>');
    $buch.parent().wrap('<div class="pdf_book_container"></div>');
    $buch.parent().parent().wrap('<div class="pdf_book_fullscreen"></div>');

    // Jetzt NEU suchen
    const $fullscreenWrapper = $buch.closest('.pdf_book_fullscreen');

    // Jetzt erst nach dem echten Fullscreen-Wrapper einfügen
    $fullscreenWrapper.after($controls);

    //prüfe current panzoom scale und setze dementsprechend den rest button auf sichtbar
       check_current_panzoom(buch_id_without_idselector);
   

    //falls inline buttons erwünscht sind, werdend iese nun eingeügt
    if (inside_button == true) {
      //next prev_button
      $buch.prepend("<div class='clear_float'></div>");
      $buch.prepend("<div class='next_inside next' data-pdf-book='" + buch_id + "'><i class='bi bi-arrow-right-square-fill'></i></div>");
      $buch.prepend("<div class='prev_inside prev' data-pdf-book='" + buch_id + "'><i class='bi bi-arrow-left-square-fill'></i></div>");
    }

    // --------------------------------------------------------------------------------------------------
    //reflect_img(buch_id);

    if (reflection == true) {
      $buch.attr("reflaction", "true");
      $buch.after("<div style='clear:both'></div>");
      update_reflaction(pageFlip_Instanz, $buch);
    }
    //-------------------------------------------------------------------------------------------------------


    //nach umblättern
    pageFlip_Instanz.on("flip", (e) => {
      update_reflaction(pageFlip_Instanz, $buch);
      update_pagenumber(pageFlip_Instanz, $buch);
    });

    //vor dem umblättern
  pageFlip_Instanz.on("beforeFlip", (e) => {
      const mp3_path = Joomla.getOptions('system.paths').root + "/media/plg_content_stpageflip/sounds/turn.mp3";
      const flipSound = new Audio(mp3_path);
    if (PageFlipRegistry[buch_id.replace("#", "")].sound == true && userInteracted == true) {
        flipSound.currentTime = 0;
        flipSound.play();
      }
  });



    //beim umblättern ende
    pageFlip_Instanz.on("flipEnd", () => {

    });

    // Listener für Ziehbeginn auf dem Buch-Wrapper
    jQuery($buch).on("mousedown touchstart", function () {
      $buch.find(".reflection_wrapper").css("visibility", "hidden");
    });

    // Optional: Wenn Loslassen wieder anzeigen
    jQuery($buch).on("mouseup touchend", function () {
      $buch.find(".reflection_wrapper").css("visibility", "hidden");
    });



  }

}

// ide funktionen der einzelnen Buttons
//functionen für die controll_buttons#########################################################################################################
//############################################################################################################################################
function go_to_page(id, site) {
  const flipInstance = PageFlipRegistry[id]?.instance;
  if (flipInstance) {
    flipInstance.flip(site - 1); // 1-basiert → 0-basiert
  }
}
function home_pdf(id) {
  const flipInstance = PageFlipRegistry[id]?.instance;
  if (flipInstance) {
    flipInstance.flip(0); // 1-basiert → 0-basiert
  }
}

function download_pdf(pfad) {
  const link = document.createElement("a");
  const filename = pfad.split('/').pop(); // letzter Teil des Pfads
  link.href = pfad;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function prev_pdf(id) {
  const flipInstance = PageFlipRegistry[id]?.instance;
  if (flipInstance) {
    flipInstance.flipPrev(); // 1-basiert → 0-basiert
  }
}

function next_pdf(id) {
  const flipInstance = PageFlipRegistry[id]?.instance;
  if (flipInstance) {
    flipInstance.flipNext(); // 1-basiert → 0-basiert
  }
}



function init_panzoom_if_needed(buch_id) {
  const $panzoom_wrapper = jQuery("#" + buch_id).find(".stf__wrapper");
  const panzoom_wrapper_elem = $panzoom_wrapper.get(0); // echtes DOM-Element holen

  if (!panzoom_wrapper_elem) {
    console.warn("Zoom-Container nicht gefunden für:", buch_id);
    return;
  }

  if (!PageFlipRegistry[buch_id].panzoom) {
    const panzoom = Panzoom(panzoom_wrapper_elem, {
      maxScale: 5,
      minScale: 0.2,
      contain: false,
       disablePan: true // ← wichtig: verhindert unbeabsichtigtes Draggen
    });

    // Optional: anfängliche Skalierung setzen, wenn nötig
    panzoom.zoom(default_panzoom_zoom, { animate: false });

    PageFlipRegistry[buch_id].panzoom = panzoom;
    PageFlipRegistry[buch_id].originalScale = default_panzoom_zoom;
  }
}


function zoom_in_pdf(buch_id, new_zoom = false) {
  init_panzoom_if_needed(buch_id);

  const panzoom = PageFlipRegistry[buch_id].panzoom;
  if (!panzoom) return;

  const current = panzoom.getScale();
  if (new_zoom == false) {
    next = Math.min(current + 0.1, 5);
  }
  else {
    next = new_zoom;
  }
  panzoom.zoom(next, { animate: true });
}

function zoom_out_pdf(buch_id) {
  init_panzoom_if_needed(buch_id);
  const panzoom = PageFlipRegistry[buch_id].panzoom;
  if (!panzoom) return;

  const current = panzoom.getScale();
  const next = Math.max(current - 0.1, 0.2);
  if (next <= 1) {
    zoom_reset_pdf(buch_id);
    return;
  }
  panzoom.zoom(next, { animate: true });
}


function zoom_reset_pdf(buch_id) {
  const entry = PageFlipRegistry[buch_id];
  if (!entry?.panzoom) return;

  entry.panzoom.reset({
    animate: true
  });

  jQuery("#" + buch_id).attr("data-zoomed", "false");

  // Zusätzlich: alle Styling-Reste entfernen (optional)
  const $wrapper = jQuery("#" + buch_id).find(".stf__wrapper");
  if ($wrapper.length > 0) {
    $wrapper.css({
      cursor: 'default'
    });
  }
}



function updateFullscreenButton($controls, isFullscreen) {
  console.log(isFullscreen);
  $controls.find(".fullscreen").each(function () {
    const $btn = jQuery(this);
    const $btn_ico = $btn.closest(".bt-options").find(".bi");
    if (isFullscreen) {
      $btn.closest(".bt-options").attr("data-original_color" ,$btn_ico.css("color"));
      $btn.removeClass("bi-fullscreen").addClass("bi-fullscreen-exit");
      $btn.closest(".controls").addClass("controls_fullscreen");
    } else {
      $btn.removeClass("bi-fullscreen-exit").addClass("bi-fullscreen");
      $btn.closest(".controls").removeClass("controls_fullscreen");
    }
  });
}

function fullscreen_pdf(id) {
  console.log("test");
  const $flipbook = jQuery(id);
  const $container = $flipbook.closest(".pdf_book_fullscreen");
  const $controls = $container.find(".controls").length > 0
    ? $container.find(".controls")
    : $container.next(".controls");

  // 👉 iOS-Fallback
  if (detectOS() === "iOS") {
    const isActive = $flipbook.attr("data-fullscreen-aktiv") === "true";

    if (isActive) {
      // Pseudo-Fullscreen beenden
      $flipbook.attr("data-fullscreen-aktiv", "false");
      $flipbook.removeClass("fullscreen-enabled").addClass("fullscreen-disabled");
      $container.removeClass("pseudo-fullscreen");
      jQuery("body").removeClass("pseudo-fullscreen-active");
      updateFullscreenButton($controls, false);
      if (typeof reflect_display_show === "function") {
        reflect_display_show(id);
      }
      $container.after($controls);
      zoom_reset_pdf(id.replace("#", ""));
    } else {
      // Pseudo-Fullscreen aktivieren
      $flipbook.attr("data-fullscreen-aktiv", "true");
      $flipbook.addClass("fullscreen-enabled").removeClass("fullscreen-disabled");
      $container.addClass("pseudo-fullscreen");
      jQuery("body").addClass("pseudo-fullscreen-active");
      updateFullscreenButton($controls, true);
      if (typeof reflect_display_hide === "function") {
        reflect_display_hide(id);
      }
      $container.append($controls);
    }
    return;
  }

  // 👉 Desktop-Fullscreen prüfen
  const isFullscreen = document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

    //egentliches starten und beenden vom fullscreen
    //console.log("isfullsc" + isFullscreen);
  if (isFullscreen) {
    // Vollbild verlassen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    $flipbook.attr("data-fullscreen-aktiv", "false");
    $flipbook.removeClass("fullscreen-enabled").addClass("fullscreen-disabled");
    updateFullscreenButton($controls, false);
    if (typeof reflect_display_show === "function") {
      reflect_display_show(id);
    }
    $container.after($controls);
    zoom_reset_pdf(id.replace("#", ""));

  } else {
    // Vollbild betreten
    zoom_in_pdf(id.replace("#", ""), 1.3);
    const element = $container.get(0);

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }

    $flipbook.attr("data-fullscreen-aktiv", "true");
    $flipbook.addClass("fullscreen-enabled").removeClass("fullscreen-disabled");
    updateFullscreenButton($controls, true);
    if (typeof reflect_display_hide === "function") {
      reflect_display_hide(id);
    }
    $container.append($controls);
  }
}


function move_back(id) {
  // Reset position
  const pdf_left = jQuery(id).attr("data-original-left");
  const pdf_top = jQuery(id).attr("data-original-top");
  jQuery(id).draggable({ disabled: true });
  const $wrapper = jQuery(id).find(".stf__wrapper");
  if ($wrapper.length > 0) {
    $wrapper.css({
      cursor: 'default'
    });
  }
 
  jQuery(id).css("left", pdf_left);
  jQuery(id).css("top", pdf_top);
  jQuery(id).removeClass("ui-draggable ui-draggable-handle");
   const panzoomInstance = PageFlipRegistry[id.replace("#","")]?.panzoom;

  if (panzoomInstance) {
    panzoomInstance.pan(0, 0);
  }

}


function reflect_display_hide(id) {
  jQuery(id).parent().parent().find(".reflection").each(function () {
    jQuery(this).hide();
  });
}
function reflect_display_show(id) {
  jQuery(id).parent().parent().find(".reflection").each(function () {
    jQuery(this).show();
  });
}

function move_pdf(id) {
  //falls zur zeit draggable aktiv
  if (jQuery(id).hasClass("move_over") == true) {
    reflect_display_show(id);
    jQuery(id).removeClass("ui-draggable ui-draggable-handle ui-draggable-disabled"); 
    jQuery(id).removeClass("move_over");
    jQuery(id).parent().parent().parent().find(".move").removeClass("move_bt_active");
  }
  else {
    jQuery(id).draggable({ disabled: false });
    reflect_display_hide(id);
    jQuery(id).addClass("move_over");
    jQuery(id).parent().parent().parent().find(".move").addClass("move_bt_active");
  }
}





























jQuery(document).ready(function () {

  //click auf buch
  jQuery(document).on('click', 'ui-flipbook', function () {

    if (jQuery(e.target).closest('.move_over').length > 0) {
      // Kein flip, wenn in einem Element mit .move_over geklickt wurde
      return;
    }
    else {
      // Flip ausführen

    }
  });



  // Slider-Eingabe
  jQuery(document).on('input', '.pdf-book-slider', function () {
    const set_page = jQuery(this).val();
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    go_to_page(id, set_page);

  });



  // Home Button
  jQuery(document).on("click", ".bt-options .home", function () {
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    home_pdf(id);
  });

  // Download Button
  jQuery(document).on("click", ".bt-options .pdf-download", function () {
    const pfad = jQuery(this).attr("href");
    download_pdf(pfad);
  });


  // Prev Button
  jQuery(document).on("click", ".bt-options .prev,  .prev", function () {
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    prev_pdf(id);
  });

  // Next Button
  jQuery(document).on("click", ".bt-options .next, .next", function () {
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    next_pdf(id);
  });

  // Zoom-in Button
  jQuery(document).on("click", ".bt-options .zoom-in", function () {
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    check_current_panzoom(id);
    reflect_display_hide(id);
    zoom_in_pdf(id);
  });

  // Zoom-out Button
  jQuery(document).on("click", ".bt-options .zoom-out", function () {
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    check_current_panzoom(id);
    reflect_display_hide(id);
    zoom_out_pdf(id);
  });

  // Zoom-default Button
  jQuery(document).on("click", ".bt-options .zoom-default", function () {
    const id = jQuery(this).attr("data-pdf-book").replace("#", "");
    jQuery(this).closest(".bt-icon-zoom-standard").addClass("pdf_control_none");
    reflect_display_show(id);
    zoom_reset_pdf(id);
  });


  // Fullscreen Button
  jQuery(document).on("click", ".bt-options .fullscreen", function () {
    const btn = jQuery(this);
    const id = btn.closest(".bt-options").attr("data-book-id");

    fullscreen_pdf(id);

  });

  document.addEventListener("fullscreenchange", function () {
  if (!document.fullscreenElement) {
    jQuery(".ui-flipbook[data-fullscreen-aktiv='true']").each(function () {
      const id = "#" + jQuery(this).attr("id");
      console.log("Fullscreen beendet für:", id);

      // Nur das Beenden behandeln, nicht erneut aktivieren!
      jQuery(this).attr("data-fullscreen-aktiv", "false");
      jQuery(this).removeClass("fullscreen-enabled").addClass("fullscreen-disabled");

      const $container = jQuery(this).closest(".pdf_book_fullscreen");
      const $controls = $container.find(".controls").length > 0
        ? $container.find(".controls")
        : $container.next(".controls");

      updateFullscreenButton($controls, false);
      if (typeof reflect_display_show === "function") {
        reflect_display_show(id);
      }
      $container.after($controls);
      zoom_reset_pdf(id.replace("#", ""));
    });
  }
});


  // Draggable aktivieren
  jQuery(document).on("click", ".bt-options .move", function () {
    const id = jQuery(this).closest(".bt-options").attr("data-book-id");
    move_pdf(id);
  });

  // Draggable Reset
  jQuery(document).on("click", ".bt-options .back", function () {
    const id = jQuery(this).closest(".bt-options").attr("data-book-id");
    move_back(id);
    reflect_display_show(id);
  });

  //sound
  jQuery(document).on("click", ".bt-options .bt-icon-sound", function () {
    const $icon = jQuery(this);

    // Wechsle Klassen
    const isOn = $icon.hasClass("sound_on");

    if (isOn) {
      $icon.removeClass("sound_on").addClass("sound_off");
    } else {
      $icon.removeClass("sound_off").addClass("sound_on");
    }

    // Zugriff auf zugehörige PageFlip-Instanz (angenommen ID ist am Icon-DOM oder im Kontext)
    const buch_id = jQuery(this).closest(".bt-options").attr("data-book-id").replace("#", "");
    const instance = PageFlipRegistry?.[buch_id];

    if (instance) {
      instance.sound = !isOn;
      console.log("Sound aktiv:", instance.sound);
    }
  });



  let mouse_over = false;
  let mouse_over_id = "";

  jQuery(document).on('mouseenter mouseleave', '.ui-flipbook', function (e) {
    const $flipbook = jQuery(this);
    const $controls = $flipbook.closest('.pdf_book_fullscreen').next('.controls');
    if (e.type === 'mouseenter' && $controls.attr("data-mousewheel-scroll") === "true") {
      mouse_over = true;
      mouse_over_id = $flipbook.attr("id");
    } else {
      mouse_over = false;
      mouse_over_id = "";
    }
  });


  // jQuery für mouseenter / mouseleave
  jQuery(document).on('mouseenter mouseleave', '.ui-flipbook', function (e) {
    mouse_over = (e.type === 'mouseenter');
    mouse_over_id = mouse_over ? jQuery(this).attr("id") : "";
  });


if (detectOS() !== "iOS" && detectOS() !== "Android") {
  // Vanilla JS für wheel-Event
  window.addEventListener('wheel', function (e) {

    if (!mouse_over) return; // Nur wenn Maus über dem Buch ist
    const id = mouse_over_id;


    if (e.deltaY > 0) {
      // Scroll down → nächste Seite
      prev_pdf(mouse_over_id);
      e.preventDefault(); // jetzt erlaubt!

    } else {
      next_pdf(mouse_over_id);
      e.preventDefault(); // jetzt erlaubt!
    }
  }, { passive: false }); // **WICHTIG**

}// iOS: kein wheel



  jQuery('.ui-flipbook').on('dblclick', function (e) {

    const $flipbook = jQuery(this);
    const id = $flipbook.attr("id");

    init_panzoom_if_needed(id);

    if (!id || !PageFlipRegistry[id] || !PageFlipRegistry[id].panzoom) {
        show_debug_msg("⚠️ Kein Panzoom-Instance gefunden für:", id);
      return;
    }

    const elem = $flipbook.get(0);
    show_debug_msg("Flipbook-id: " + id);
    const rect = elem.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    let offsetY = e.clientY - rect.top;


    const panzoomInstance = PageFlipRegistry[id].panzoom;
    if (!panzoomInstance) return;

    show_debug_msg("Aktuelle Zoom-Stufe:", panzoomInstance.getScale());
    const isZoomed = $flipbook.attr("data-dbl-zoomed");

    if (isZoomed === "true") {
      zoom_reset_pdf(id.replace("#", ""));
      $flipbook.attr("data-dbl-zoomed", "false");
    } else {

      const panzoomElem = PageFlipRegistry[id].panzoom.getElem?.() || this;
      const rect = panzoomElem.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const scale = 1.5;
      const panzoomInstance = PageFlipRegistry[id].panzoom;

      const panX = (rect.width / 2 - offsetX) * (scale - 1);
      const panY = (rect.height / 2 - offsetY) * (scale - 1);

      panzoomInstance.reset({ animate: false });

      setTimeout(() => {
        panzoomInstance.zoom(scale, { animate: false }); // keine Animation dazwischen

        // Danach korrekt pannen
        panzoomInstance.pan(panX, panY, { animate: true });

        show_debug_msg("✅ Zoom + Pan abgeschlossen:", { panX, panY });
      }, 20);
      $flipbook.attr("data-dbl-zoomed", "true");

    }
  });


}); //document.ready(function) ende


