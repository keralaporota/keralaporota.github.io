/* =====================================================
   TAROT PAGE - the moving parts
   goes with tarot.html. the cards themselves (names, meanings)
   are in tarot-cards.js

   what happens, in order:
   1. pick a reading                        -> buildReadingButtons() + chooseReading()
   2. shuffle                               -> shuffleDeck()
   3. the deck spreads out face down        -> layRibbon() + buildSlots()
   4. picked cards fly to their place       -> pickCard()
   5. turn them over                        -> turnOver()
   6. the reading gets written underneath   -> writeEntry()

   the daily card is the odd one out: once it's picked it stays the same
   for the rest of the day (that bit is in "THE DAILY CARD" near the bottom)

   the card sounds are in "SOUND", right under the settings
   ===================================================== */


/* ---------- SETTINGS (the stuff i'm most likely to change) ---------- */

// THE READINGS. to add one, copy a block and change the words.
//   label     = what the button says
//   about     = the short description under the buttons
//   daily     = true means "one card, and it stays the same all day" (only the daily one has this)
//   positions = one per card, in the order they get picked
//       name  = the tag under the card
//       about = what that spot stands for (shows next to the card in the reading)
//       reads = which line of the card shows up in blue:
//               "past", "present", "future" or "advice" (all written out in tarot-cards.js)
//               "" = no blue line, just the card's general meaning
//
// the layouts (speed, romance, moon, sun, general) come from the Clow Card Fortune Book,
// which i found through cardcaptor.zucchini.cc. the wording here is my own.
const READINGS = [
  { id: "daily", label: "daily card", daily: true,
    about: "One card for today. It stays the same until tomorrow.",
    positions: [
      { name: "today",            about: "your card for the day",                                            reads: "advice" },
    ] },

  { id: "three", label: "3 cards",
    about: "The classic: where you've been, where you are, where it's going.",
    positions: [
      { name: "past",             about: "what led up to this",                                              reads: "past" },
      { name: "present",          about: "where things stand now",                                           reads: "present" },
      { name: "future",           about: "where it's heading if nothing changes",                            reads: "future" },
    ] },

  { id: "speed", label: "speed",
    about: "A quick one: what's causing a problem and what to do about it.",
    positions: [
      { name: "the cause",        about: "what's behind the problem, or what to keep an eye on",             reads: "" },
      { name: "past",             about: "what happened earlier that led here",                              reads: "past" },
      { name: "present",          about: "where things stand now",                                           reads: "present" },
      { name: "the solution",     about: "what to do about it",                                              reads: "advice" },
    ] },

  { id: "romance", label: "romance",
    about: "For when love is on your mind, or any relationship you want to deepen. Think of the other person while you pick.",
    positions: [
      { name: "the other person", about: "what they're like, and what's going on with them",                 reads: "" },
      { name: "past",             about: "where the two of you stood before",                                reads: "past" },
      { name: "present",          about: "where the two of you stand now",                                   reads: "present" },
      { name: "future",           about: "where this goes if things carry on as they are",                   reads: "future" },
      { name: "the obstacle",     about: "what stands in the way of getting closer",                         reads: "" },
      { name: "the result",       about: "how it turns out. read it together with card 3",                   reads: "future" },
      { name: "advice",           about: "a chance to make it better, or another way to look at it",         reads: "advice" },
    ] },

  { id: "moon", label: "moon",
    about: "For problems and questions that aren't about love.",
    positions: [
      { name: "the problem",      about: "what the trouble really is. it may turn out there isn't one",      reads: "" },
      { name: "your influence",   about: "how you affect the other people involved",                         reads: "" },
      { name: "its nature",       about: "whether that influence helps or harms. read it with card 2",       reads: "" },
      { name: "the key",          about: "what, or who, can unlock the outcome you want",                    reads: "" },
      { name: "if it goes well",  about: "the result if the problem is handled well",                        reads: "future" },
      { name: "if it doesn't",    about: "the result if it isn't",                                           reads: "" },
      { name: "the solution",     about: "what to do, or how to shift your thinking, to get the good result", reads: "advice" },
    ] },

  { id: "sun", label: "sun",
    about: "For looking at a worry in detail, starting with yourself.",
    positions: [
      { name: "how you seem",     about: "the you that other people see",                                    reads: "" },
      { name: "how you are",      about: "the you that you know",                                            reads: "" },
      { name: "the problem",      about: "how your nature feeds into the trouble. read it with cards 1 and 2", reads: "present" },
      { name: "the solution",     about: "a way forward, or a change of mindset",                            reads: "advice" },
      { name: "an obstacle",      about: "something that may get in the way. it doesn't have to be beaten, just watched", reads: "" },
      { name: "the key",          about: "who or what can help the solution along",                          reads: "" },
      { name: "a warning",        about: "an attitude or action to avoid while you sort this out",           reads: "" },
      { name: "the result",       about: "what can come of it if you handle this well",                      reads: "future" },
      { name: "a later warning",  about: "something to steer clear of further down the road",                reads: "" },
    ] },

  { id: "general", label: "general",
    about: "The big one, for any question.",
    positions: [
      { name: "the subject",      about: "what this is really about: you, or how you feel about it",         reads: "" },
      { name: "the cause",        about: "what's feeding the trouble",                                       reads: "" },
      { name: "past",             about: "problems from before, settled or not",                             reads: "past" },
      { name: "around you",       about: "what's going on around you while you deal with it",                reads: "present" },
      { name: "the solution",     about: "the card to listen to most",                                       reads: "advice" },
      { name: "the key point",    about: "the one thing the solution hinges on. read it with card 5",        reads: "" },
      { name: "an obstacle",      about: "what could get in the way of the solution",                        reads: "" },
      { name: "the future",       about: "the luck to expect while you carry it out",                        reads: "future" },
      { name: "the result",       about: "how it ends if you solve it",                                      reads: "future" },
      { name: "other people",     about: "how the people around you see all this",                           reads: "" },
    ] },
];

const DEFAULT_READING = "three";  // which reading is picked when the page opens (an id from above)
const REVERSED_CHANCE = 0.3;      // how often a card comes out upside down. 0 = never, 0.5 = half the time

// where the card pictures are. a card's picture is IMAGE_FOLDER + its id + IMAGE_TYPE
const IMAGE_FOLDER = "./images/tarot/";
const IMAGE_TYPE = ".jpg";

// speeds, in milliseconds (1000 = one second)
const SHUFFLE_TIME = 1300;   // the shuffling wobble (about as long as the riffle sound)
const DEAL_GAP = 9;          // pause between each card as the deck spreads out
const FLY_TIME = 450;        // a picked card flying to its place

// THE SOUNDS (the files are in the media folder).
// volume: 0 = silent, 1 = as loud as the file goes. they were recorded at
// very different loudnesses, so these numbers even them out
const SOUND_FOLDER = "./media/";
//
// my riffle-card-shuffle.mp3 has 2 sounds in it with a silent gap in between,
// so it's been cut into 2 files: part1 = the riffle, part2 = the sound after the gap
const SOUNDS = {
  shuffle: { file: "riffle-part1-shuffle.mp3",    volume: 0.35 },   // the riffle, while the pile shuffles
  spread:  { file: "riffle-part2-spread.mp3",     volume: 0.7 },    // the deck spreading out face down
  place:   { file: "taking-playing-card.mp3",     volume: 1 },      // a picked card sliding to its place (quiet file, so it's turned right up)
  turn:    { file: "turning-playing-card.mp3",    volume: 0.45 },   // a card turning over
  gather:  { file: "shuffling-deck-of-cards.mp3", volume: 0.3 },    // start over: the cards get scooped back into a pile
};


/* ---------- THE PARTS OF THE PAGE WE NEED ---------- */
const setup       = document.getElementById("setup");
const readingChoice = document.getElementById("readingChoice");
const readingAbout = document.getElementById("readingAbout");
const allowReversed = document.getElementById("allowReversed");
const majorOnly   = document.getElementById("majorOnly");
const promptLine  = document.getElementById("prompt");
const spread      = document.getElementById("spread");
const deck        = document.getElementById("deck");
const ribbon      = document.getElementById("ribbon");
const shuffleBtn  = document.getElementById("shuffleBtn");
const revealBtn   = document.getElementById("revealBtn");
const againBtn    = document.getElementById("againBtn");
const reading     = document.getElementById("reading");
const entries     = document.getElementById("entries");
const reversedNote = document.getElementById("reversedNote");
const soundBtn    = document.getElementById("soundBtn");

// true if the visitor's device is set to "reduce motion" -> we skip the animations
const lessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ---------- WHAT THE PAGE REMEMBERS DURING A READING ---------- */
let currentReading = READINGS.find(r => r.id === DEFAULT_READING) || READINGS[0];
let shuffled = [];   // the cards in their shuffled order: { card, reversed }
let picked = [];     // the cards picked so far, in order
let turned = 0;      // how many of them are face up


/* ---------- SOUND ---------- */

const SOUND_KEY = "tarot-sound";   // the name the on/off choice is saved under in the browser

// load each sound once so it's ready the moment it's needed
const soundFiles = {};
Object.keys(SOUNDS).forEach(name => {
  soundFiles[name] = new Audio(SOUND_FOLDER + SOUNDS[name].file);
  soundFiles[name].preload = "auto";
});

let soundOn = true;        // flips with the "sound: on / off" button
let shuffleSound = null;   // the riffle / spread sound that's playing right now (kept so i can stop it)

// plays one of the SOUNDS, e.g. playSound("turn")
function playSound(name) {
  if (!soundOn) return null;

  // a fresh copy every time, so sounds can overlap (like "turn over all")
  const copy = soundFiles[name].cloneNode();
  copy.volume = SOUNDS[name].volume;
  copy.play().catch(() => {});   // if the browser refuses to play it, just carry on quietly
  return copy;
}

// stops the riffle / spread sound if it's still going
function stopShuffleSound() {
  if (shuffleSound) shuffleSound.pause();
  shuffleSound = null;
}

// the sound button: remembers the choice for next time + changes its own words
function setSound(on) {
  soundOn = on;
  soundBtn.textContent = on ? "sound: on" : "sound: off";
  soundBtn.setAttribute("aria-pressed", on);
  if (!on) stopShuffleSound();

  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch (e) {
    // browser won't let the page save things. the button still works, it just forgets
  }
}

// was sound switched off last time? (if nothing's saved, it starts on)
function loadSound() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch (e) {
    return true;
  }
}


/* ---------- SMALL HELPERS ---------- */

// mixes up a list (a fair shuffle: every order is equally likely)
function mix(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// makes a new HTML element, e.g. make("p", "entry-name", "The Fool")
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// waits a moment, e.g. await wait(500)
function wait(ms) {
  return new Promise(done => setTimeout(done, lessMotion ? 0 : ms));
}

// "Pick 3 cards." / "Pick 1 more card."
function pickPrompt() {
  const left = currentReading.positions.length - picked.length;
  const more = picked.length > 0 ? " more" : "";
  return `Pick ${left}${more} ${left === 1 ? "card" : "cards"}.`;
}

// readings with more than 3 cards get numbers on their tags ("5. the solution"),
// bc some of the explanations say things like "read it with card 5"
function tagFor(place) {
  const spot = currentReading.positions[place];
  return currentReading.positions.length > 3 ? `${place + 1}. ${spot.name}` : spot.name;
}


/* ---------- 1. SETUP: reading buttons, empty places, the pile ---------- */

// makes the "daily card / 3 cards / speed..." buttons from the READINGS list
function buildReadingButtons() {
  READINGS.forEach(r => {
    const input = make("input");
    input.type = "radio";
    input.name = "reading";
    input.id = "reading-" + r.id;
    input.checked = r === currentReading;

    const label = make("label", "", r.label);
    label.htmlFor = input.id;

    input.addEventListener("change", () => chooseReading(r));

    readingChoice.append(input, label);
  });
}

// switches to a reading: shows its description and sets the table up fresh for it
function chooseReading(r) {
  currentReading = r;

  const count = r.positions.length;
  readingAbout.textContent = `${count} ${count === 1 ? "card" : "cards"}. ${r.about}`;

  clearTable();

  // the daily card was already picked today? then it goes straight back on the table
  if (r.daily) {
    const saved = loadDaily();
    if (saved) showSavedDaily(saved);
  }
}

// draws one empty place (+ its name tag) per card in the reading
function buildSlots() {
  const count = currentReading.positions.length;
  spread.innerHTML = "";

  // the CSS uses these two to size the cards + split big readings into 2 neat rows
  spread.dataset.size = count <= 3 ? "big" : count <= 5 ? "medium" : "small";
  spread.style.setProperty("--per-row", count <= 5 ? count : Math.ceil(count / 2));

  currentReading.positions.forEach((spot, place) => {
    const slot = make("div", "slot");
    // (the \u00a0 is a space that won't break, so "7." never ends up alone on a line)
    slot.append(make("div", "slot-place"), make("div", "slot-label", tagFor(place).replace(". ", ".\u00a0")));
    spread.append(slot);
  });
}

// draws the pile of cards (just a few layers, enough to look like a deck)
function buildDeck() {
  deck.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const layer = make("div", "deck-layer");
    layer.style.setProperty("--lift", i);
    deck.append(layer);
  }
}

// builds one real card (the kind that can turn over) for a place in the reading
function makeCard(entry, place) {
  const card = make("button", "card");
  card.type = "button";
  card.setAttribute("aria-label", `${tagFor(place)}: face down. turn over`);
  if (entry.reversed) card.classList.add("is-reversed");

  const picture = make("img");
  picture.src = IMAGE_FOLDER + entry.card.id + IMAGE_TYPE;   // loads now, so it's ready when it gets turned over
  picture.alt = "";

  const face = make("span", "card-face");
  face.append(picture);
  const inner = make("span", "card-inner");
  inner.append(make("span", "card-back"), face);
  card.append(inner);

  card.addEventListener("click", () => turnOver(card, entry, place));
  return card;
}


/* ---------- 2. SHUFFLE ---------- */
async function shuffleDeck() {
  // lock the setup so nothing changes mid-reading
  shuffleBtn.disabled = true;
  setup.classList.add("is-locked");
  setup.querySelectorAll("input").forEach(input => input.disabled = true);

  // which cards go in: all 78, or just the 22 major arcana if that box is ticked
  const cardsInPlay = majorOnly.checked
    ? TAROT_CARDS.filter(card => card.suit === "major")
    : TAROT_CARDS;

  // the real shuffle: decide the order, and which cards are upside down
  shuffled = mix(cardsInPlay).map(card => ({
    card: card,
    reversed: allowReversed.checked && Math.random() < REVERSED_CHANCE,
  }));

  // the pretend shuffle: the pile's layers slide apart and back together
  promptLine.textContent = "Shuffling...";
  shuffleSound = playSound("shuffle");
  if (!lessMotion) {
    deck.querySelectorAll(".deck-layer").forEach((layer, i) => {
      const side = i % 2 === 0 ? 1 : -1;   // every other layer goes the other way
      layer.animate(
        {
          translate: ["0 0", `${side * 62}% ${-4 * i}%`, "0 0"],
          rotate: ["0deg", `${side * 7}deg`, "0deg"],
        },
        { duration: SHUFFLE_TIME / 3, iterations: 3, delay: i * 35, easing: "ease-in-out" }
      );
    });
  }
  await wait(SHUFFLE_TIME + 250);

  layRibbon();
}


/* ---------- 3. SPREAD THE DECK OUT FACE DOWN ---------- */
function layRibbon() {
  const deckSpot = deck.getBoundingClientRect();   // remember where the pile was

  // show the empty places for this reading
  buildSlots();
  spread.hidden = false;

  // swap the pile for the ribbon of face-down cards
  deck.hidden = true;
  shuffleBtn.hidden = true;
  againBtn.hidden = false;
  ribbon.hidden = false;
  ribbon.innerHTML = "";
  ribbon.classList.toggle("is-small", shuffled.length < 40);   // fewer cards = spread them wider (see tarot.css)

  shuffled.forEach((entry, i) => {
    const back = make("button", "ribbon-card");
    back.type = "button";
    back.setAttribute("aria-label", `face-down card ${i + 1} of ${shuffled.length}`);

    // a tiny random tilt + nudge so the row looks hand-laid
    back.style.setProperty("--tilt", (Math.random() * 5 - 2.5).toFixed(1) + "deg");
    back.style.setProperty("--nudge", (Math.random() * 6 - 3).toFixed(1) + "px");

    back.addEventListener("click", () => pickCard(entry, back));
    ribbon.append(back);
  });

  // the riffle is done, now the sound of the deck spreading out
  stopShuffleSound();
  shuffleSound = playSound("spread");

  // each card slides out from where the pile was, one after another
  if (!lessMotion) {
    ribbon.querySelectorAll(".ribbon-card").forEach((back, i) => {
      const spot = back.getBoundingClientRect();
      const x = deckSpot.left + deckSpot.width / 2 - (spot.left + spot.width / 2);
      const y = deckSpot.top + deckSpot.height / 2 - (spot.top + spot.height / 2);
      back.animate(
        { translate: [`${x}px ${y}px`, "0 0"] },
        { duration: 420, delay: i * DEAL_GAP, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" }
      );
    });
  }

  promptLine.textContent = pickPrompt();

  // if the cards run off the bottom of the screen, scroll down to them
  if (ribbon.getBoundingClientRect().bottom > window.innerHeight) {
    promptLine.scrollIntoView({ behavior: lessMotion ? "auto" : "smooth", block: "start" });
  }
}


/* ---------- 4. PICK A CARD ---------- */
function pickCard(entry, back) {
  const place = picked.length;                           // 0 = first place, 1 = second...
  const count = currentReading.positions.length;
  if (place >= count) return;                            // already picked enough

  picked.push(entry);

  playSound("place");

  // the daily card gets remembered the moment it's picked
  if (currentReading.daily) saveDaily(entry);

  // build the real card (face down for now) inside its place
  const card = makeCard(entry, place);
  const slotPlace = spread.children[place].querySelector(".slot-place");
  slotPlace.classList.add("is-full");
  slotPlace.append(card);

  // fly it from where it was in the ribbon to its place
  if (!lessMotion) {
    const from = back.getBoundingClientRect();
    const to = card.getBoundingClientRect();
    card.animate(
      {
        transform: [
          `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`,
          "none",
        ],
      },
      { duration: FLY_TIME, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
  }

  // leave a gap where it was
  back.classList.add("is-taken");
  back.disabled = true;

  // picked them all? put the rest of the deck away
  if (picked.length === count) {
    ribbon.hidden = true;
    revealBtn.hidden = count === 1;   // no need for "turn over all" with one card
    promptLine.textContent = count === 1 ? "Click your card to turn it over." : "Click a card to turn it over.";
    spread.querySelector(".card").focus({ preventScroll: true });
  } else {
    promptLine.textContent = pickPrompt();
  }
}


/* ---------- 5. TURN A CARD OVER ---------- */
function turnOver(card, entry, place) {
  if (card.classList.contains("is-up")) return;   // already face up

  card.classList.add("is-up");
  turned++;
  playSound("turn");

  const way = entry.reversed ? ", reversed" : "";
  card.setAttribute("aria-label", `${tagFor(place)}: ${entry.card.name}${way}`);

  writeEntry(entry, place);

  // all face up? the reading is finished
  if (turned === currentReading.positions.length) {
    revealBtn.hidden = true;
    promptLine.textContent = currentReading.daily
      ? "That's your card for today. A new one tomorrow."
      : "That's your reading.";
  }
}

// the "Turn over all" button: flips whatever is still face down, one by one
async function turnOverAll() {
  revealBtn.disabled = true;
  const cards = spread.querySelectorAll(".card");
  for (let i = 0; i < cards.length; i++) {
    // (isConnected = still on the page, in case "Start over" was pressed meanwhile)
    if (cards[i].isConnected && !cards[i].classList.contains("is-up")) {
      cards[i].click();
      await wait(350);
    }
  }
  revealBtn.disabled = false;
}


/* ---------- 6. WRITE THE READING ---------- */
function writeEntry(entry, place) {
  const card = entry.card;
  const spot = currentReading.positions[place];                  // where it landed: { name, about, reads }
  const side = entry.reversed ? card.reversed : card.upright;    // which half of the card to read from

  // show the sheet of paper
  reading.hidden = false;

  const box = make("article", "entry");
  box.style.order = place;   // keeps entries in reading order, whichever gets turned over first

  // small picture of the card
  const thumb = make("img", "entry-thumb");
  thumb.src = IMAGE_FOLDER + card.id + IMAGE_TYPE;
  thumb.alt = "";
  if (entry.reversed) thumb.classList.add("is-reversed");

  const words = make("div", "entry-words");

  // "5. the solution" + what that spot stands for
  const position = make("p", "entry-position", tagFor(place));
  position.append(make("span", "entry-about", spot.about));
  words.append(position);

  // "The Tower  reversed"
  const name = make("h3", "entry-name");
  name.append(card.name);
  if (entry.reversed) name.append(" ", make("span", "entry-way", "reversed"));
  words.append(name);

  // keywords, then what the card means this way up
  words.append(make("p", "entry-keywords", side.keywords));
  words.append(make("p", "entry-meaning", side.meaning));

  // the blue line = what the card says in THIS spot (past / present / future / advice)
  // so a past card talks in past tense, a future card in future tense
  if (spot.reads) words.append(make("p", "entry-says", side[spot.reads]));

  // a reversed card showed up -> show the small note explaining what reversed means
  if (entry.reversed) reversedNote.hidden = false;

  box.append(thumb, words);
  entries.append(box);
}


/* ---------- CLEAR THE TABLE / START OVER ---------- */

// wipes everything back to "deck on the table, nothing picked"
function clearTable() {
  shuffled = [];
  picked = [];
  turned = 0;
  stopShuffleSound();

  spread.innerHTML = "";
  spread.hidden = true;
  ribbon.innerHTML = "";
  ribbon.hidden = true;
  entries.innerHTML = "";
  reading.hidden = true;
  reversedNote.hidden = true;

  // bring back the deck + unlock the setup
  deck.hidden = false;
  shuffleBtn.hidden = false;
  shuffleBtn.disabled = false;
  revealBtn.hidden = true;
  againBtn.hidden = true;
  setup.classList.remove("is-locked");
  setup.querySelectorAll("input").forEach(input => input.disabled = false);

  promptLine.textContent = "Shuffle the deck to begin.";
}

// the "Start over" button: same reading again from the top
// (for the daily card that just means today's card comes back)
function startOver() {
  chooseReading(currentReading);
  playSound("gather");
}


/* ---------- THE DAILY CARD ----------
   the picked card is saved in the visitor's own browser with today's date.
   same day = same card comes back. next day = they get to pick a new one. */

const DAILY_KEY = "tarot-daily-card";   // the name it's saved under

// today's date like "2026-10-02" (the visitor's own date, wherever they are)
function today() {
  const now = new Date();
  const two = n => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
}

// remember today's card
function saveDaily(entry) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({
      date: today(),
      id: entry.card.id,
      reversed: entry.reversed,
    }));
  } catch (e) {
    // some browsers won't let a page save things (private windows etc).
    // then it just isn't remembered, nothing breaks
  }
}

// get today's card back. gives null if there isn't one (or it's from another day)
function loadDaily() {
  try {
    const saved = JSON.parse(localStorage.getItem(DAILY_KEY));
    if (!saved || saved.date !== today()) return null;

    const card = TAROT_CARDS.find(c => c.id === saved.id);
    return card ? { card: card, reversed: saved.reversed === true } : null;
  } catch (e) {
    return null;
  }
}

// puts today's card straight on the table, already face up, with its reading
function showSavedDaily(entry) {
  picked = [entry];
  turned = 1;

  // no deck or shuffling this time
  deck.hidden = true;
  shuffleBtn.hidden = true;

  buildSlots();
  spread.hidden = false;

  const card = makeCard(entry, 0);
  card.classList.add("is-up");
  card.setAttribute("aria-label", `${tagFor(0)}: ${entry.card.name}${entry.reversed ? ", reversed" : ""}`);

  const slotPlace = spread.children[0].querySelector(".slot-place");
  slotPlace.classList.add("is-full");
  slotPlace.append(card);

  writeEntry(entry, 0);
  promptLine.textContent = "This is your card for today. A new one tomorrow.";
}


/* ---------- SET EVERYTHING UP WHEN THE PAGE OPENS ---------- */
buildReadingButtons();
buildDeck();
chooseReading(currentReading);
setSound(loadSound());

shuffleBtn.addEventListener("click", shuffleDeck);
deck.addEventListener("click", () => { if (!shuffleBtn.disabled) shuffleDeck(); });   // clicking the pile shuffles too
revealBtn.addEventListener("click", turnOverAll);
againBtn.addEventListener("click", startOver);
soundBtn.addEventListener("click", () => setSound(!soundOn));
