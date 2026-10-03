/* =====================================================
   THE DECK PAGE - every card + what it means
   goes with tarot-deck.html. the cards come from tarot-cards.js,
   so if i change a meaning there it changes here too

   what this does:
   1. lays all 78 cards out, one section per suit   -> buildSuits()
   2. click a card = a sheet pops up with both of
      its meanings (upright + reversed)             -> openCard()
   ===================================================== */


/* ---------- SETTINGS ---------- */

// the sections, in the order they show up. the id has to match "suit" in tarot-cards.js
const SUITS = [
  { id: "major",     title: "Major arcana", about: "the big themes" },
  { id: "wands",     title: "Wands",        about: "drive, ideas, work" },
  { id: "cups",      title: "Cups",         about: "feelings, relationships" },
  { id: "swords",    title: "Swords",       about: "thinking, truth, conflict" },
  { id: "pentacles", title: "Pentacles",    about: "money, craft, home" },
];

// the lines shown for each side of a card, in this order.
// first word = the name of the line in tarot-cards.js, second = the label on the page
const LINES = [
  ["past",    "in the past"],
  ["present", "in the present"],
  ["future",  "in the future"],
  ["advice",  "as advice"],
];

// where the card pictures are (same as on the tarot page)
const IMAGE_FOLDER = "./images/tarot/";
const IMAGE_TYPE = ".jpg";


/* ---------- THE PARTS OF THE PAGE WE NEED ---------- */
const suits      = document.getElementById("suits");
const cardSheet  = document.getElementById("cardSheet");
const sheetBody  = document.getElementById("sheetBody");
const sheetClose = document.getElementById("sheetClose");


/* ---------- SMALL HELPER ---------- */

// makes a new HTML element, e.g. make("p", "sheet-meaning", "some words")
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}


/* ---------- 1. LAY OUT ALL THE CARDS ---------- */
function buildSuits() {
  SUITS.forEach(suit => {
    const section = make("section", "suit");

    // the little paper heading: "Wands  drive, ideas, work"
    const heading = make("h2", "suit-title paper", suit.title);
    heading.append(make("span", "suit-about", suit.about));
    section.append(heading);

    // the cards of that suit
    const grid = make("div", "card-grid");
    TAROT_CARDS.filter(card => card.suit === suit.id).forEach(card => {
      const button = make("button", "deck-card");
      button.type = "button";

      const picture = make("img");
      picture.src = IMAGE_FOLDER + card.id + IMAGE_TYPE;
      picture.alt = "";
      picture.loading = "lazy";   // only loads the picture once it's about to scroll into view

      button.append(picture, make("span", "deck-card-name", card.name));
      button.addEventListener("click", () => openCard(card));
      grid.append(button);
    });

    section.append(grid);
    suits.append(section);
  });
}


/* ---------- 2. THE POP-UP SHEET FOR ONE CARD ---------- */

// builds one half of the sheet: "upright" or "reversed"
function buildSide(title, side, isReversed) {
  const box = make("section", "sheet-side");

  box.append(make("h3", isReversed ? "side-title is-reversed" : "side-title", title));
  box.append(make("p", "sheet-keywords", side.keywords));
  box.append(make("p", "sheet-meaning", side.meaning));

  // "in the past: ...", "in the present: ..." etc
  const list = make("dl", "sheet-lines");
  LINES.forEach(([key, label]) => {
    list.append(make("dt", "", label), make("dd", "", side[key]));
  });
  box.append(list);

  return box;
}

function openCard(card) {
  sheetBody.innerHTML = "";

  const picture = make("img", "sheet-picture");
  picture.src = IMAGE_FOLDER + card.id + IMAGE_TYPE;
  picture.alt = "";

  const words = make("div", "sheet-words");
  const name = make("h2", "sheet-name", card.name);
  name.id = "sheetName";
  words.append(
    name,
    buildSide("upright", card.upright, false),
    buildSide("reversed", card.reversed, true)
  );

  sheetBody.append(picture, words);
  cardSheet.showModal();
  cardSheet.scrollTop = 0;   // always open at the top, even if the last card was scrolled down
}

// ways to close it: the close button, clicking the dark area around the sheet,
// or the Esc key (the browser does that one by itself)
sheetClose.addEventListener("click", () => cardSheet.close());
cardSheet.addEventListener("click", event => {
  if (event.target === cardSheet) cardSheet.close();
});


/* ---------- SET EVERYTHING UP WHEN THE PAGE OPENS ---------- */
buildSuits();

// a link like tarot-deck.html#major-09 opens straight onto that card
function openLinkedCard() {
  const linked = TAROT_CARDS.find(card => "#" + card.id === location.hash);
  if (linked) openCard(linked);
}
openLinkedCard();
window.addEventListener("hashchange", openLinkedCard);   // also if the # changes while the page is already open
