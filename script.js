let artworks = [];
let currentIndex = 0;
let score = 0;

async function loadData() {
  try {
    const res = await fetch('data.json');
    artworks = await res.json();
    
    // Shuffle the artworks for a more engaging experience
    shuffleArray(artworks);
    
    showArtwork();
  } catch (error) {
    console.error('Error loading artwork data:', error);
    document.getElementById("game-container").innerHTML = "<p>Không thể tải dữ liệu tranh. Vui lòng thử lại sau.</p>";
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showArtwork() {
  const art = artworks[currentIndex];
  document.getElementById("art-image").src = art.image;
  document.getElementById("art-title").textContent = art.title;
  document.getElementById("art-artist").textContent = "Nghệ sĩ: " + art.artist;
  document.getElementById("art-year").textContent = "Năm: " + art.year;
  document.getElementById("art-style").textContent = "Phong cách: " + art.movement;
  
  document.getElementById("guess").value = "";
  document.getElementById("result").textContent = "";
  
  // Enable the guess field and button
  document.getElementById("guess").disabled = false;
  document.getElementById("check-btn").disabled = false;
}

function checkGuess() {
  const guessInput = document.getElementById("guess");
  const userGuess = parseInt(guessInput.value.replace(/,/g, ''));
  
  if (isNaN(userGuess) || userGuess < 0) {
    document.getElementById("result").textContent = "Vui lòng nhập một số hợp lệ.";
    return;
  }
  
  const actualPrice = artworks[currentIndex].price;
  const diff = Math.abs(userGuess - actualPrice);
  const percentDiff = (diff / actualPrice) * 100;
  
  let resultMessage = `Giá thật: $${actualPrice.toLocaleString()}. `;
  let pointsEarned = 0;
  
  // Calculate points based on how close the guess was
  if (percentDiff <= 5) {
    pointsEarned = 10;
    resultMessage += `Tuyệt vời! Bạn chỉ đoán lệch ${percentDiff.toFixed(1)}%. +${pointsEarned} điểm!`;
  } else if (percentDiff <= 15) {
    pointsEarned = 5;
    resultMessage += `Rất tốt! Bạn đoán lệch ${percentDiff.toFixed(1)}%. +${pointsEarned} điểm!`;
  } else if (percentDiff <= 30) {
    pointsEarned = 2;
    resultMessage += `Khá đấy! Bạn đoán lệch ${percentDiff.toFixed(1)}%. +${pointsEarned} điểm!`;
  } else {
    resultMessage += `Bạn đoán lệch ${percentDiff.toFixed(1)}%. Hãy thử lại!`;
  }
  
  score += pointsEarned;
  document.getElementById("score").textContent = score;
  document.getElementById("result").textContent = resultMessage;
  
  // Disable the guess field and button after submission
  guessInput.disabled = true;
  document.getElementById("check-btn").disabled = true;
}

function nextArtwork() {
  currentIndex = (currentIndex + 1) % artworks.length;
  showArtwork();
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', loadData);
