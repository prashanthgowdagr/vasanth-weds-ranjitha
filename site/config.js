// ============================================================
//  EDIT THIS FILE ONLY — names, dates, venue and texts live here.
// ============================================================
window.WEDDING = {
  groom: "Vasanth",
  bride: "Ranjitha",

  // Parents block under "Ceremony Info". Set one to null to hide it.
  groomParents: null,   // e.g. { title: "Mr. & Mrs.", lines: ["Father Name", "Mother Name"] }
  brideParents: null,

  announcement: "Together with our families\nwe invite you to our wedding",

  // Timezone offset of the venue (IST = +05:30)
  tz: "+05:30",

  // Events. Times are local, "YYYY-MM-DDTHH:MM". `end` is optional.
  events: [
    { title: "Reception", start: "2026-11-28T19:00", end: "2026-11-28T22:00", venue: "Taha Palace",
      desc: "Join us for an evening of celebration, dinner, and heartfelt blessings." },
    { title: "Muhurtham", start: "2026-11-29T09:10", end: "2026-11-29T10:22", venue: "Taha Palace",
      desc: "Join us as we exchange our vows in the sacred Muhurtham ceremony." }
  ],
  mainEvent: 0,       // event used for the "Save the Date" card and the countdown (0 = Reception, 28 Nov)
  receptionEvent: 0,  // event shown in "Reception Info"
  welcomeTime: "",    // optional, e.g. "18:30" (hidden while empty)

  // Venue block: embedded map + ONE "Get directions" link
  venue: {
    title: "Wedding Venue",
    name: "Taha Palace",
    address: "Hiriyur, Karnataka",
    mapQuery: "Taha Palace Wedding Venue, Hiriyur, Karnataka"
  },

  // Closing section (bottom of the page)
  thanksQuote: "May your life together be full of love and your love be full of life.",
  thanks: "Thank you for being part of our journey",
  presence: "Your presence is the greatest gift of all.",

  // Post-wedding: link to the full-resolution album (Google Photos / Drive / R2 …),
  // then set postWedding to true to show the "Photo Album" section.
  postWedding: false,
  albumUrl: "",
  albumNote: "Thank you for celebrating with us! Browse and download all the photos here."
};
