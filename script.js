let artworks = [];
let currentIndex = 0;
let score = 0;
let currentRound = 1;
const TOTAL_ROUNDS = 5;
let roundResults = [];

async function loadData() {
  try {
    const res = await fetch('data.json');
    artworks = await res.json();
    
    // Shuffle the artworks for a more engaging experience
    shuffleArray(artworks);
    
    showArtwork();
  } catch (error) {
    console.error('Error loading artwork data:', error);
    document.getElementById("game-container").innerHTML = "<p>Unable to load artwork data. Please try again later.</p>";
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
  document.getElementById("art-artist").textContent = "Artist: " + art.artist;
  document.getElementById("art-year").textContent = "Year: " + art.year;
  document.getElementById("art-style").textContent = "Style: " + art.movement;
  
  document.getElementById("guess").value = "";
  document.getElementById("result").textContent = "";
  document.getElementById("current-round").textContent = currentRound;
  
  // Enable the guess field and button
  document.getElementById("guess").disabled = false;
  document.getElementById("check-btn").disabled = false;
}

function checkGuess() {
  const guessInput = document.getElementById("guess");
  const userGuessText = guessInput.value.replace(/,/g, '');
  const userGuess = parseFloat(userGuessText);
  
  if (isNaN(userGuess) || userGuess < 0) {
    document.getElementById("result").textContent = "Please enter a valid number.";
    return;
  }
  
  const actualPrice = artworks[currentIndex].price;
  const diff = Math.abs(userGuess - actualPrice);
  const percentDiff = Math.min(100, Math.abs((diff / actualPrice) * 100));
  
  let resultMessage = `Real price: $${actualPrice.toLocaleString()}. `;
  resultMessage += `Accuracy: ${Math.max(0, Math.min(100, 100 - percentDiff)).toFixed(1)}%. `;
  let pointsEarned = 0;
  
  // Calculate points based on how close the guess was
  if (percentDiff <= 25) {
    pointsEarned = 10;
    resultMessage += `Excellent! You were only off by ${percentDiff.toFixed(1)}%. +${pointsEarned} points!`;
  } else if (percentDiff <= 35) {
    pointsEarned = 5;
    resultMessage += `Very good! You were off by ${percentDiff.toFixed(1)}%. +${pointsEarned} points!`;
  } else if (percentDiff <= 50) {
    pointsEarned = 2;
    resultMessage += `Not bad! You were off by ${percentDiff.toFixed(1)}%. +${pointsEarned} points!`;
  } else {
    resultMessage += `You were off by ${percentDiff.toFixed(1)}%. Try again!`;
  }
  
  score += pointsEarned;
  document.getElementById("score").textContent = score;
  document.getElementById("result").textContent = resultMessage;
  
  // Store round result
  roundResults.push({
    round: currentRound,
    artwork: artworks[currentIndex].title,
    artist: artworks[currentIndex].artist,
    actualPrice: actualPrice,
    userGuess: userGuess,
    percentDiff: percentDiff,
    pointsEarned: pointsEarned
  });
  
  // Disable the guess field and button after submission
  guessInput.disabled = true;
  document.getElementById("check-btn").disabled = true;
}

function nextArtwork() {
  if (document.getElementById("check-btn").disabled === false) {
    // If the user hasn't made a guess, prompt them
    if (confirm("You haven't made a guess yet. Do you want to skip this artwork?")) {
      // Store a skipped round result
      roundResults.push({
        round: currentRound,
        artwork: artworks[currentIndex].title,
        artist: artworks[currentIndex].artist,
        actualPrice: artworks[currentIndex].price,
        userGuess: "Skipped",
        percentDiff: 100,
        pointsEarned: 0
      });
    } else {
      return; // Don't proceed if they choose not to skip
    }
  }
  
  currentRound++;
  
  if (currentRound > TOTAL_ROUNDS) {
    showSummary();
    return;
  }
  
  currentIndex = (currentIndex + 1) % artworks.length;
  showArtwork();
}

function showSummary() {
  const modal = document.getElementById("summary-modal");
  const summaryContent = document.getElementById("summary-content");
  
  // Calculate overall accuracy
  let totalPercentOff = 0;
  let roundsWithGuesses = 0;
  
  roundResults.forEach(result => {
    if (result.userGuess !== "Skipped") {
      totalPercentOff += result.percentDiff;
      roundsWithGuesses++;
    }
  });
  
  const averageAccuracy = roundsWithGuesses > 0 ? 
    Math.max(0, Math.min(100, 100 - (totalPercentOff / roundsWithGuesses))) : 0;
  
  // Create summary HTML
  let summaryHTML = `
    <div class="summary-header">
      <h3>Final Score: ${score} points</h3>
      <p>Overall Accuracy: ${averageAccuracy.toFixed(1)}%</p>
    </div>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Round</th>
          <th>Artwork</th>
          <th>Real Price</th>
          <th>Your Guess</th>
          <th>Accuracy</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  roundResults.forEach(result => {
    const accuracy = result.userGuess !== "Skipped" ? 
      (100 - result.percentDiff).toFixed(1) + "%" : "N/A";
    
    const userGuessDisplay = result.userGuess !== "Skipped" ? 
      "$" + result.userGuess.toLocaleString() : "Skipped";
    
    summaryHTML += `
      <tr>
        <td>${result.round}</td>
        <td>${result.artwork}</td>
        <td>$${result.actualPrice.toLocaleString()}</td>
        <td>${userGuessDisplay}</td>
        <td>${accuracy}</td>
        <td>${result.pointsEarned}</td>
      </tr>
    `;
  });
  
  summaryHTML += `
      </tbody>
    </table>
  `;
  
  summaryContent.innerHTML = summaryHTML;
  modal.style.display = "flex";
}

function resetGame() {
  // Reset game state
  score = 0;
  currentRound = 1;
  roundResults = [];
  
  // Reshuffle artworks
  shuffleArray(artworks);
  currentIndex = 0;
  
  // Reset UI
  document.getElementById("score").textContent = score;
  document.getElementById("summary-modal").style.display = "none";
  
  showArtwork();
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', loadData);
