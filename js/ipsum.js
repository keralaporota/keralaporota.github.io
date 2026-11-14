// ---- word bank ----
// add/remove words here. each one gets picked at random.
var words = [
  // kerala sweets + snacks
  "unniyappam", "neyyappam", "ela ada", "payasam", "pazham pori",
  "banana chips", "tapioca crisps", "achappam", "kozhukatta", "halwa",
  "avalose unda", "kalathappam", "murukku",
  // mithai from everywhere
  "coconut ladoo", "coconut barfi", "besan ladoo", "jalebi", "kaju katli",
  "peda", "gulab jamun", "rasgulla", "soan papdi", "mysore pak",
  "kesari", "boondi", "malpua", "chikki",
  // bakery
  "cardamom toast", "ghee biscuit", "shortbread", "jam roll", "sweet bun",
  "cream bun", "bun maska", "rusk", "khari biscuit", "nankhatai",
  "plum cake", "honey cake", "butter cookies",
  // western bakery + cafe
  "croissant", "french toast", "cinnamon roll", "pain au chocolat", "eclair",
  "madeleine", "scones", "banana bread", "brownie", "custard tart",
  "lemon tart", "waffles", "pancakes", "apple pie", "donut", "fudge",
  "caramel", "vanilla sponge", "strawberry jam", "clotted cream",
  // sweet bits
  "jaggery", "palm sugar", "honeycomb", "rice flakes", "cardamom",
  "condensed milk", "rose syrup", "roasted cashews", "sesame brittle",
  // drinks
  "milky chai", "kaapi", "filter coffee", "rose milk"
];

// sentence endings, like "...with milky chai." or "...and one more cup of tea."
// also the mixed up combos live here
var endings = [
  "with milky chai", "and one more cup of tea", "with kaapi",
  "and a little more jaggery", "with filter coffee", "and rose milk",
  "and french toast with pazham pori on top", "with a croissant dipped in kaapi",
  "and banana bread with jaggery butter", "with cardamom brownies",
  "and pancakes with palm sugar syrup", "with scones and coconut jam",
  "and a cinnamon roll for later", "with waffles and halwa on the side"
];

// ---- helpers ----

// random whole number between min and max
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// random item from a list
function pick(list) {
  return list[rand(0, list.length - 1)];
}

// capital first letter
function capital(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---- making the text ----

// one sentence = a little list of sweets
// comma somewhere in the middle, sometimes a "with/and" ending
function makeSentence() {
  var count = rand(4, 6);   // sweets per sentence
  var parts = [];

  for (var i = 0; i < count; i++) {
    var w = pick(words);
    // no repeats in one sentence
    while (parts.indexOf(w) !== -1) {
      w = pick(words);
    }
    parts.push(w);
  }

  // comma after the 2nd or 3rd sweet
  var commaAt = rand(1, Math.min(2, count - 2));
  parts[commaAt] += ",";

  var sentence = parts.join(" ");

  // 40% get an ending
  if (Math.random() < 0.4) {
    sentence += " " + pick(endings);
  }

  return capital(sentence) + ".";
}

// one paragraph = 2 to 4 sentences
function makeParagraph() {
  var count = rand(2, 4);
  var sentences = [];
  for (var i = 0; i < count; i++) {
    sentences.push(makeSentence());
  }
  return sentences.join(" ");
}

// ---- putting it on the page ----

var output = document.getElementById("output");

function generate() {
  var howMany = parseInt(document.getElementById("paraCount").value) || 1;
  var html = "";

  for (var i = 0; i < howMany; i++) {
    html += "<p>" + makeParagraph() + "</p>";
  }

  output.innerHTML = html;
}

// ---- copy button ----
// copies plain text, blank line between paragraphs
function copyText() {
  var paras = output.querySelectorAll("p");
  var text = [];
  paras.forEach(function (p) { text.push(p.textContent); });

  navigator.clipboard.writeText(text.join("\n\n")).then(function () {
    var msg = document.getElementById("copiedMsg");
    msg.textContent = "copied!";
    setTimeout(function () { msg.textContent = ""; }, 1500);  // hides after 1.5s
  });
}

// buttons + regenerate when number changes
document.getElementById("makeBtn").addEventListener("click", generate);
document.getElementById("copyBtn").addEventListener("click", copyText);
document.getElementById("paraCount").addEventListener("change", generate);

// first batch on page load
generate();
