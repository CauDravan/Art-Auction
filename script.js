let artworks = [];
let currentIndex = 0;

async function loadData() {
  const res = await fetch('data.json');
  artworks = await res.json();
  showArtwork();
}

function showArtwork() {
  const art = artworks[currentIndex];
  document.getElementById("art-image").src = art.image;
  document.getElementById("art-title").textContent = art.title;
  document.getElementById("art-artist").textContent = "Nghệ sĩ: " + art.artist;
  document.getElementById("guess").value = "";
  document.getElementById("result").textContent = "";
}

function checkGuess() {
  const userGuess = parseInt(document.getElementById("guess").value);
  const actualPrice = artworks[currentIndex].price;
  const diff = Math.abs(userGuess - actualPrice);
  const result = `Giá thật: $${actualPrice.toLocaleString()}. Bạn đoán lệch $${diff.toLocaleString()}.`;
  document.getElementById("result").textContent = result;
}

function nextArtwork() {
  currentIndex = (currentIndex + 1) % artworks.length;
  showArtwork();
}

loadData();
