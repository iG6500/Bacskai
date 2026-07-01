/* ═══════════════════════════════════════════════════════════════════
   BÁCSKAI AKADÉMIA — RENDEZVÉNYEK (egyetlen közös adatforrás)
   ═══════════════════════════════════════════════════════════════════

   EZT A FÁJLT KELL SZERKESZTENED, HA IDŐPONTOT VÁLTOZTATSZ.
   Ha itt átírsz egy dátumot, az AUTOMATIKUSAN frissül a főoldalon
   (a képzéskártyák "Következő időpont" jelzésén) ÉS a Rendezvények
   oldalon is. Sehol máshol nem kell módosítanod.

   ─── Hogyan adj hozzá vagy módosíts egy eseményt? ───

   Minden esemény egy blokk a lenti listában, ilyen formában:

     {
       kepzes: "alapozo",              // melyik képzés (lásd lentebb)
       datum: "2026-07-18",            // dátum ÉV-HÓ-NAP formában
       ido: "09:00–12:00",             // napszak / idősáv
       helyszin: "Baja, képzőterem",   // hol lesz
       megjegyzes: "1. nap"            // opcionális kis kiegészítés (elhagyható)
     },

   A "kepzes" mező csak ez a négy érték lehet:
     "szerdai"  →  SzerdAI est (ingyenes)
     "alapozo"  →  AI Alapozó
     "halado"   →  AI Haladó
     "ceges"    →  Céges AI-képzés

   A dátumot MINDIG "ÉV-HÓ-NAP" alakban írd (pl. 2026-09-05).
   A napnevet és a "júl. 5." formátumot a rendszer AUTOMATIKUSAN
   számolja ki a dátumból — azt nem kell beírnod.

   A múltbeli eseményeket a rendszer automatikusan kihagyja, a
   képzéskártyán mindig a legközelebbi jövőbeli időpont jelenik meg.
   Nyugodtan hagyd bent a régi sorokat, vagy töröld őket — mindegy.
   ═══════════════════════════════════════════════════════════════════ */

window.BACSKAI_ESEMENYEK = [

  // ─── 2026. AUGUSZTUS ───
  {
    kepzes: "szerdai",
    datum: "2026-08-12",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
  },
  {
    kepzes: "szerdai",
    datum: "2026-08-26",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
  },

  // ─── 2026. SZEPTEMBER ───
  {
    kepzes: "szerdai",
    datum: "2026-09-09",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
  },
  {
    kepzes: "alapozo",
    datum: "2026-09-11",
    ido: "09:00–16:00",
    helyszin: "Baja, képzőterem",
    megjegyzes: "6 órás",
  },
  {
    kepzes: "halado",
    datum: "2026-09-18",
    ido: "09:00–18:00",
    helyszin: "Baja, képzőterem",
    megjegyzes: "teljes nap",
  },

 // ─── 2026. OKTÓBER ───
  {
    kepzes: "alapozo",
    datum: "2026-10-08",
    ido: "09:00–16:00",
    helyszin: "Baja, képzőterem",
    megjegyzes: "6 órás",
  },
  {
    kepzes: "halado",
    datum: "2026-10-22",
    ido: "09:00–18:00",
    helyszin: "Baja, képzőterem",
    megjegyzes: "teljes nap",
  },

];


/* ═══════════════════════════════════════════════════════════════════
   INNENTŐL A RENDSZER LOGIKÁJA — ide NEM kell nyúlnod.
   ═══════════════════════════════════════════════════════════════════ */

window.BACSKAI = (function () {

  // Képzés-metaadatok: cím, jelentkezés neve, aloldal, kártyacímke stílusa
  const KEPZESEK = {
    szerdai: {
      cim: "SzerdAI est — AI a mindennapi munkában",
      rovidCim: "SzerdAI est",
      modal: "SzerdaAI",
      aloldal: "szerdai.html",
      tag: "free",
      tagFelirat: "Ingyenes",
      gomb: "Foglalok helyet",
      letszam: "15–30 fő",
      leiras: "Kötetlen, 2 órás ismertető est azoknak, akik szeretnék megérteni, mire használható ma az AI — előzetes tudás nélkül.",
    },
    alapozo: {
      cim: "AI Alapozó workshop",
      rovidCim: "AI Alapozó",
      modal: "AI Alapozó",
      aloldal: "ai-alapozo.html",
      tag: "paid",
      tagFelirat: "AI Alapozó",
      gomb: "Jelentkezem",
      letszam: "10–20 fő",
      leiras: "Az AI-eszközök biztonságos, gyakorlati használata a napi munkában. Részvételi díj: 39 900 Ft.",
    },
    halado: {
      cim: "AI Haladó workshop",
      rovidCim: "AI Haladó",
      modal: "AI Haladó",
      aloldal: "ai-halado.html",
      tag: "paid",
      tagFelirat: "AI Haladó",
      gomb: "Jelentkezem",
      letszam: "8–10 fő",
      leiras: "Egynapos haladó workshop azoknak, akik már használják az AI-t és többet hoznának ki belőle. Részvételi díj: 79 900 Ft.",
    },
    ceges: {
      cim: "Céges AI-képzés",
      rovidCim: "Céges AI-képzés",
      modal: "Céges AI-képzés",
      aloldal: "ceges-ai-kepzes.html",
      tag: "corp",
      tagFelirat: "Céges",
      gomb: "Ajánlatot kérek",
      letszam: "5–15 fő",
      leiras: "Testreszabott, helyszíni képzés a csapatodnak, AI Act-megfelelést segítő belső szabályzattal.",
    },
  };

  const HONAP_ROVID = ["jan.", "febr.", "márc.", "ápr.", "máj.", "jún.",
                       "júl.", "aug.", "szept.", "okt.", "nov.", "dec."];
  const HONAP_TELJES = ["január", "február", "március", "április", "május", "június",
                        "július", "augusztus", "szeptember", "október", "november", "december"];
  const NAP_NEV = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];

  function parse(datumStr) {
    // "2026-07-18" → Date (helyi idő, dél, hogy ne csússzon időzóna miatt)
    const [y, m, d] = datumStr.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  function maNulla() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  // "júl. 18. (szombat)"
  function rovidDatum(dt) {
    return HONAP_ROVID[dt.getMonth()] + " " + dt.getDate() + ". (" + NAP_NEV[dt.getDay()] + ")";
  }
  // "2026. július"
  function honapCimke(dt) {
    return dt.getFullYear() + ". " + HONAP_TELJES[dt.getMonth()];
  }
  // "2026. július 18., szombat"
  function teljesDatum(dt) {
    return dt.getFullYear() + ". " + HONAP_TELJES[dt.getMonth()] + " " + dt.getDate() + "., " + NAP_NEV[dt.getDay()];
  }

  // Az összes esemény feldúsítva + rendezve dátum szerint
  function osszesEsemeny() {
    const nyers = window.BACSKAI_ESEMENYEK || [];
    return nyers
      .map(function (e) {
        const dt = parse(e.datum);
        const meta = KEPZESEK[e.kepzes] || {};
        return Object.assign({}, e, {
          _dt: dt,
          meta: meta,
          jovobeli: dt >= maNulla(),
        });
      })
      .sort(function (a, b) { return a._dt - b._dt; });
  }

  // Egy adott képzés legközelebbi jövőbeli eseménye (vagy null)
  function kovetkezo(kepzesKulcs) {
    const lista = osszesEsemeny().filter(function (e) {
      return e.kepzes === kepzesKulcs && e.jovobeli;
    });
    return lista.length ? lista[0] : null;
  }

  return {
    KEPZESEK: KEPZESEK,
    osszesEsemeny: osszesEsemeny,
    kovetkezo: kovetkezo,
    rovidDatum: rovidDatum,
    honapCimke: honapCimke,
    teljesDatum: teljesDatum,
  };

})();
