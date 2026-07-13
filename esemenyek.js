/* ═══════════════════════════════════════════════════════════════════
   BÁCSKAI AKADÉMIA — RENDEZVÉNYEK (egyetlen közös adatforrás)
   ═══════════════════════════════════════════════════════════════════

   EZT A FÁJLT KELL SZERKESZTENED, HA IDŐPONTOT VAGY LÉTSZÁMOT VÁLTOZTATSZ.
   Ha itt átírsz valamit, az AUTOMATIKUSAN frissül MINDENHOL:
     • a főoldalon (a képzéskártyák "Következő időpont" jelzésén),
     • a Rendezvények oldalon,
     • és az egyes képzések aloldalain ("Válassz időpontot és jelentkezz").
   Sehol máshol nem kell módosítanod.

   ─── Hogyan adj hozzá vagy módosíts egy eseményt? ───

   Minden esemény egy blokk a lenti listában, ilyen formában:

     {
       kepzes: "alapozo",              // melyik képzés (lásd lentebb)
       datum: "2026-07-18",            // dátum ÉV-HÓ-NAP formában
       ido: "09:00–12:00",             // napszak / idősáv
       helyszin: "Baja, képzőterem",   // hol lesz
       ferohely: 20,                   // ÖSSZES hely ezen az alkalmon
       foglalt: 8,                     // ennyien MÁR jelentkeztek
       megjegyzes: "1. nap"            // opcionális kiegészítés (elhagyható)
     },

   ─── A BETELT állapot ───

   A rendszer a ferohely és foglalt számokból dolgozik, de a látogató
   felé CSAK a "Betelt" állapotot mutatja — azt nem, hogy hány hely van
   még. Ha a foglalt eléri a férőhelyet, a jelzés "Betelt" lesz és a
   jelentkezés gomb letiltódik. Kézi teltre jelölés: telt: true.

   A "kepzes" mező csak ez a négy érték lehet:
     "szerdai"  →  SzerdAI est (ingyenes)
     "alapozo"  →  AI Alapozó
     "halado"   →  AI Haladó
     "ceges"    →  Céges AI-képzés (általában NEM ide, egyedi egyeztetés)

   A dátumot MINDIG "ÉV-HÓ-NAP" alakban írd (pl. 2026-09-05).
   A napnevet és a "júl. 5." formátumot a rendszer automatikusan
   számolja. A múltbeli eseményeket automatikusan kihagyja.
   ═══════════════════════════════════════════════════════════════════ */

window.BACSKAI_ESEMENYEK = [

  // ─── 2026. AUGUSZTUS ───
  {
    kepzes: "szerdai",
    datum: "2026-08-12",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
    ferohely: 30,
    foglalt: 0,
  },

  {
    kepzes: "szerdai",
    datum: "2026-08-26",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
    ferohely: 30,
    foglalt: 0,
  },

  // ─── 2026. SZEPTEMBER ───
  {
    kepzes: "szerdai",
    datum: "2026-09-09",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
    ferohely: 30,
    foglalt: 0,
  },

  {
    kepzes: "halado",
    datum: "2026-09-25",
    ido: "09:00–18:00",
    helyszin: "Baja, képzőterem",
    ferohely: 10,
    foglalt: 0,
  },

   // ─── 2026. OKTÓBER ───
  {
    kepzes: "szerdai",
    datum: "2026-10-09",
    ido: "17:30–19:30",
    helyszin: "Baja, képzőterem",
    ferohely: 30,
    foglalt: 0,
  },
  {
    kepzes: "alapozo",
    datum: "2026-10-09",
    ido: "09:00–16:00",
    helyszin: "Baja, képzőterem",
    ferohely: 20,
    foglalt: 0,
    megjegyzes: "1. nap",
  },

];


/* ═══════════════════════════════════════════════════════════════════
   INNENTŐL A RENDSZER LOGIKÁJA — ide NEM kell nyúlnod.
   ═══════════════════════════════════════════════════════════════════ */

window.BACSKAI = (function () {

  const KEPZESEK = {
    szerdai: {
      cim: "SzerdAI est — AI a mindennapi munkában",
      rovidCim: "SzerdAI est",
      modal: "SzerdAI",
      aloldal: "szerdai.html",
      tag: "free",
      tagFelirat: "Ingyenes",
      gomb: "Foglalok helyet",
      letszam: "30 fő",
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
      letszam: "20 fő",
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
      letszam: "10 fő",
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
    const [y, m, d] = datumStr.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  function maNulla() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }

  function rovidDatum(dt) {
    return HONAP_ROVID[dt.getMonth()] + " " + dt.getDate() + ". (" + NAP_NEV[dt.getDay()] + ")";
  }
  function honapCimke(dt) {
    return dt.getFullYear() + ". " + HONAP_TELJES[dt.getMonth()];
  }
  function teljesDatum(dt) {
    return dt.getFullYear() + ". " + HONAP_TELJES[dt.getMonth()] + " " + dt.getDate() + ".";
  }
  function napNev(dt) {
    return NAP_NEV[dt.getDay()];
  }

  /* Betelt-állapot egy eseményre. A szabad helyek számát NEM tesszük ki
     az oldalra — csak a "Betelt" státuszt jelezzük.
     Visszaad: { telt, szoveg, szin, pont } */
  function ferohelyStatusz(e) {
    const fh = (typeof e.ferohely === "number") ? e.ferohely : null;
    const fg = (typeof e.foglalt === "number") ? e.foglalt : 0;
    const telt = (e.telt === true) || (fh !== null && fg >= fh);
    if (telt) {
      return { telt: true, szoveg: "Betelt", szin: "#94a3b8", pont: "#ef4444" };
    }
    return { telt: false, szoveg: "Jelentkezés nyitva", szin: "var(--coral)", pont: "#22c55e" };
  }

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
          statusz: ferohelyStatusz(e),
        });
      })
      .sort(function (a, b) { return a._dt - b._dt; });
  }

  function kepzesEsemenyei(kepzesKulcs) {
    return osszesEsemeny().filter(function (e) {
      return e.kepzes === kepzesKulcs && e.jovobeli;
    });
  }

  function kovetkezo(kepzesKulcs) {
    const lista = kepzesEsemenyei(kepzesKulcs);
    return lista.length ? lista[0] : null;
  }

  return {
    KEPZESEK: KEPZESEK,
    osszesEsemeny: osszesEsemeny,
    kepzesEsemenyei: kepzesEsemenyei,
    kovetkezo: kovetkezo,
    ferohelyStatusz: ferohelyStatusz,
    rovidDatum: rovidDatum,
    honapCimke: honapCimke,
    teljesDatum: teljesDatum,
    napNev: napNev,
  };

})();
