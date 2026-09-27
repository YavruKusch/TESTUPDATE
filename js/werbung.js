// Werbung im Browser: AdSense-Banner + Vollbild zwischen Matches (H5 Games Ads, adBreak).
// Bleibt komplett aus (kein Skript, kein Platz), solange PUB leer ist oder der Admin-Schalter
// features.werbung aus ist. Plaetze und Haeufigkeit: ROADMAP Entscheidungsstand Punkt 3.
// Kein ?. / ?? (alte Safari), laeuft ohne Babel.
(function(){
  var PUB = '';                                  // ca-pub-..., kommt mit dem AdSense-Konto
  var SLOT = { unten: '', seite: '' };           // Anzeigenblock-IDs aus AdSense
  var BREIT = 1280;                              // ab dieser Fensterbreite Streifen links + rechts
  var UNTEN_H = 60;                              // reservierte Hoehe unten (px)
  var UNTEN_IM_MATCH = false;                    // Handy im Match: erst nach Abstands- + Ruckelpruefung
  var MATCH = { game: 1, twovtwo: 1 };           // Bildschirme mit laufendem Brett
  var STANDARD_JEDES = 5;                        // Vollbild nach jedem n-ten Match

  var an = false, vollbild = false, jedes = STANDARD_JEDES, geladen = false, zaehler = 0, bild = 'menu';
  var vorschau = /[?&]werbungvorschau=1/.test(location.search);  // graue Kaesten statt echter Werbung
  var boxen = {};

  function ag(){ return (window.adsbygoogle = window.adsbygoogle || []); }

  function laden(){
    if (geladen || vorschau) return;
    geladen = true;
    ag();
    window.adBreak = window.adConfig = function(o){ ag().push(o); };
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + PUB;
    s.setAttribute('data-ad-frequency-hint', '120s');   // Google-Mindestabstand zwischen Vollbildern
    document.head.appendChild(s);
    window.adConfig({ preloadAdBreaks: 'on', sound: 'on' });
  }

  function box(name, css, format){
    if (boxen[name]) return;
    var d = document.createElement('div');
    d.id = 'ww-werbung-' + name;
    d.style.cssText = 'position:fixed;z-index:50;display:flex;align-items:center;justify-content:center;' + css;
    if (vorschau){
      d.style.background = 'rgba(128,128,128,0.35)';
      d.textContent = 'Anzeige';
    } else {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = 'display:block;width:100%;height:100%;';
      ins.setAttribute('data-ad-client', PUB);
      ins.setAttribute('data-ad-slot', name === 'unten' ? SLOT.unten : SLOT.seite);
      ins.setAttribute('data-ad-format', format);
      d.appendChild(ins);
    }
    document.body.appendChild(d);
    boxen[name] = d;
    if (!vorschau) ag().push({});
  }

  function weg(name){
    var d = boxen[name];
    if (!d) return;
    if (d.parentNode) d.parentNode.removeChild(d);
    delete boxen[name];
  }

  function aktualisieren(){
    var breit = window.innerWidth >= BREIT;
    var unten = an && (!MATCH[bild] || breit || UNTEN_IM_MATCH);
    var seiten = an && breit;
    if (an) laden();
    if (unten) box('unten', 'left:0;right:0;bottom:0;height:' + UNTEN_H + 'px;', 'horizontal'); else weg('unten');
    if (seiten){
      box('links', 'left:0;top:0;bottom:' + (unten ? UNTEN_H : 0) + 'px;width:160px;', 'vertical');
      box('rechts', 'right:0;top:0;bottom:' + (unten ? UNTEN_H : 0) + 'px;width:160px;', 'vertical');
    } else { weg('links'); weg('rechts'); }
    var root = document.documentElement;
    root.classList[unten ? 'add' : 'remove']('ww-werbung-unten');
    root.classList[seiten ? 'add' : 'remove']('ww-werbung-seiten');
    root.style.setProperty('--ww-werbung-unten', (unten ? UNTEN_H : 0) + 'px');
  }

  window.WWWerbung = {
    // adminCfg aus barricade_admin_config (kommt ohnehin per Listener, kein Extra-Read)
    konfig: function(cfg){
      var f = (cfg && cfg.features) || {};
      an = vorschau || (!!f.werbung && !!PUB);
      vollbild = an && !!f.werbungVollbild;
      var n = cfg && cfg.werbungJedes;
      jedes = (typeof n === 'number' && n >= 1 && n <= 50 && Math.floor(n) === n) ? n : STANDARD_JEDES;
      aktualisieren();
    },
    bildschirm: function(name){ bild = name; aktualisieren(); },
    // nach dem Ende eines echten Matches; true = Vollbild angefragt (Google entscheidet, ob eins kommt)
    matchEnde: function(){
      if (!vollbild) return false;
      zaehler++;
      if (zaehler % jedes !== 0) return false;
      if (!vorschau) window.adBreak({ type: 'next', name: 'match_ende' });
      return true;
    }
  };
  window.addEventListener('resize', function(){ if (an) aktualisieren(); });
})();
