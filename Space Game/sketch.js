let player;
let bullets = [];
let enemies = [];
let stars = [];
let score = 0;
let debugMode = false; // Toggle for showing collision boundaries
let gameTitle = "AI DEFENDER";
let powerUps = [];
let level = 1;
let enemySpawnRate = 0.02;
let gameStarted = false;
let particleEffects = [];
let gameState = "title"; // title, playing, gameOver, leaderboard, difficultySelect
let leaderboard = [];
let playerInitials = "";
let playerEmail = "";
let inputField = "initials"; // initials or email
let difficultyLevel = "medium"; // easy, medium, hard
let difficultyMultipliers = {
  easy: 0.7,
  medium: 1.0,
  hard: 1.5
};
let cursorBlink = true;
let cursorBlinkTime = 0;
let gameInitialized = false; // Flag to track if game has been properly initialized

// Add a background class for more visual interest
class Background {
  constructor() {
    this.gridSize = 50;
    this.gridOpacity = 30;
  }
  
  show() {
    // Draw grid lines
    stroke(100, 200, 255, this.gridOpacity);
    strokeWeight(1);
    
    // Vertical lines
    for (let x = 0; x <= width; x += this.gridSize) {
      line(x, 0, x, height);
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += this.gridSize) {
      line(0, y, width, y);
    }
    
    // Draw nebula-like clouds
    noStroke();
    for (let i = 0; i < 3; i++) {
      let x = (frameCount * 0.1 + i * 500) % (width + 500) - 250;
      let y = (i * 300 + 150) % height;
      
      // Nebula color based on difficulty
      if (difficultyLevel === "easy") {
        fill(0, 100, 200, 5);
      } else if (difficultyLevel === "medium") {
        fill(100, 50, 200, 5);
      } else {
        fill(200, 0, 100, 5);
      }
      
      for (let j = 0; j < 5; j++) {
        ellipse(x, y, 300 + j * 50);
      }
    }
  }
}

// Initialize background in setup
let gameBackground;

// Add a function to ensure the game starts
function ensureGameStarts() {
  // If the game hasn't initialized after 3 seconds, force it to start
  setTimeout(() => {
    if (!gameInitialized) {
      console.warn("Forcing game initialization");
      gameInitialized = true;
      gameState = "title";
      
      // Hide loading overlay if it's still visible
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
    }
  }, 3000);
}

// Expose key variables to global scope for debugging
function exposeDebugVariables() {
  window.gameInitialized = gameInitialized;
  window.gameState = gameState;
  window.leaderboard = leaderboard;
  window.score = score;
  window.difficultyLevel = difficultyLevel;
}

function setup() {
  createCanvas(600, 800);
  player = new Player();
  gameBackground = new Background();
  
  // Create starfield
  for (let i = 0; i < 100; i++) {
    stars.push(new Star());
  }
  
  // Load leaderboard from localStorage
  loadLeaderboard();
  
  // Spawn initial enemies for testing
  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy(random(width), random(-500, 0)));
  }
  
  // Set cursor blink interval
  setInterval(() => {
    cursorBlink = !cursorBlink;
  }, 500);
  
  // Set initialization flag
  gameInitialized = true;
  
  // Ensure the game starts
  ensureGameStarts();
  
  // Expose variables for debugging
  exposeDebugVariables();
  
  console.log("Game initialized successfully!");
  
  // Hide loading overlay
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Simple leaderboard functions using localStorage
function loadLeaderboard() {
  try {
    // Check if Supabase is initialized
    if (window.isSupabaseInitialized && window.globalLeaderboard) {
      console.log("Loading leaderboard from Supabase");
      leaderboard = window.globalLeaderboard;
      return;
    }
    
    // Fallback to localStorage if Supabase is not available
    console.log("Supabase not available, loading from localStorage");
    if (typeof localStorage !== 'undefined') {
      const savedLeaderboard = localStorage.getItem('aiDefenderLeaderboard');
      if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
        return;
      }
    }
    
    // Sample leaderboard data as fallback
    console.log("Using sample leaderboard data");
    leaderboard = [
      { player_initials: "CPU", player_email: "ai@example.com", score: 1500, difficulty: "hard" },
      { player_initials: "BOT", player_email: "bot@example.com", score: 1200, difficulty: "medium" },
      { player_initials: "AI", player_email: "neural@example.com", score: 900, difficulty: "easy" }
    ];
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    // Fallback to sample data
    leaderboard = [
      { player_initials: "CPU", player_email: "ai@example.com", score: 1500, difficulty: "hard" },
      { player_initials: "BOT", player_email: "bot@example.com", score: 1200, difficulty: "medium" },
      { player_initials: "AI", player_email: "neural@example.com", score: 900, difficulty: "easy" }
    ];
  }
}

function saveLeaderboard() {
  // Save to localStorage as backup
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aiDefenderLeaderboard', JSON.stringify(leaderboard));
  }
}

function addToLeaderboard(initials, email, score, difficulty) {
  // Create a new leaderboard entry object
  const newEntry = { 
    player_initials: initials, 
    player_email: email, 
    score: score, 
    difficulty: difficulty 
  };
  
  // Try to save to Supabase if available
  if (window.saveScoreToSupabase) {
    console.log("Saving score to Supabase:", newEntry);
    // Show saving indicator
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      const message = overlay.querySelector('p');
      if (message) message.textContent = "Submitting score...";
    }
    
    // Save to Supabase
    window.saveScoreToSupabase(initials, email, score, difficulty)
      .then(success => {
        console.log("Score saved to Supabase:", success);
        // Hide overlay
        if (overlay) overlay.style.display = 'none';
      })
      .catch(err => {
        console.error("Error saving to Supabase:", err);
        // Hide overlay
        if (overlay) overlay.style.display = 'none';
        
        // Fallback to local storage
        addToLocalLeaderboard(newEntry);
      });
  } else {
    console.log("Supabase not available, saving locally");
    // Fallback to local storage
    addToLocalLeaderboard(newEntry);
  }
  
  return true;
}

// Helper function to add to local leaderboard
function addToLocalLeaderboard(newEntry) {
  console.log("Adding to local leaderboard:", newEntry);
  
  // Ensure the entry has all required fields
  if (!newEntry.player_initials || !newEntry.score || !newEntry.difficulty) {
    console.error("Invalid leaderboard entry:", newEntry);
    return;
  }
  
  // Make sure email is included
  if (!newEntry.player_email) {
    console.warn("Entry missing email, setting to empty string");
    newEntry.player_email = "";
  }
  
  // Add to local leaderboard
  leaderboard.push(newEntry);
  
  // Sort leaderboard by score (highest first)
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 10 scores
  if (leaderboard.length > 10) {
    leaderboard = leaderboard.slice(0, 10);
  }
  
  // Save to localStorage
  saveLeaderboard();
  
  console.log("Updated local leaderboard:", leaderboard);
}

function draw() {
  // Deep space background
  background(10, 20, 40);
  
  // Draw grid background
  gameBackground.show();
  
  // Draw and update stars
  for (let star of stars) {
    star.update();
    star.show();
  }
  
  // Handle different game states
  switch (gameState) {
    case "title":
      showTitleScreen();
      break;
    case "difficultySelect":
      showDifficultyScreen();
      break;
    case "playing":
      playGame();
      break;
    case "gameOver":
      showGameOverScreen();
      break;
    case "leaderboard":
      showLeaderboardScreen();
      break;
  }
  
  // Update debug variables
  exposeDebugVariables();
}

function playGame() {
  // Update and draw player
  player.update();
  player.show();
  
  // Handle particle effects
  for (let i = particleEffects.length - 1; i >= 0; i--) {
    particleEffects[i].update();
    particleEffects[i].show();
    if (particleEffects[i].isDead()) {
      particleEffects.splice(i, 1);
    }
  }
  
  // Handle power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].update();
    powerUps[i].show();
    
    if (powerUps[i].hits(player)) {
      // Apply power-up effect
      applyPowerUp(powerUps[i].type);
      powerUps.splice(i, 1);
      continue;
    }
    
    if (powerUps[i].offscreen()) {
      powerUps.splice(i, 1);
    }
  }
  
  // Handle bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
      continue;
    }
    
    // Check bullet-enemy collisions
    let bulletHit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(enemies[j])) {
        score += 10 * difficultyMultipliers[difficultyLevel];
        
        // Create explosion effect
        createExplosion(enemies[j].x, enemies[j].y);
        
        // Chance to spawn power-up
        if (random(1) < 0.2) {
          powerUps.push(new PowerUp(enemies[j].x, enemies[j].y));
        }
        
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        bulletHit = true;
        break;
      }
    }
    
    // Skip to next bullet if this one hit an enemy
    if (bulletHit) {
      continue;
    }
  }
  
  // Handle enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();
    if (enemies[i].offscreen()) {
      enemies.splice(i, 1);
      continue;
    }
    if (player.hits(enemies[i])) {
      // Game over condition
      createExplosion(player.x, player.y);
      gameState = "gameOver";
      playerInitials = "";
      playerEmail = "";
      inputField = "initials";
    }
  }
  
  // Spawn new enemies with increasing difficulty
  if (random(1) < enemySpawnRate) {
    enemies.push(new Enemy(random(width), -50));
  }
  
  // Level progression
  if (frameCount % 1000 === 0) {
    level++;
    enemySpawnRate = min(0.1, 0.02 + level * 0.01) * difficultyMultipliers[difficultyLevel];
  }
  
  // Display HUD
  drawHUD();
}

function showTitleScreen() {
  // Title
  textAlign(CENTER);
  textSize(60);
  fill(100, 200, 255);
  text(gameTitle, width/2, height/3);
  
  // Subtitle
  textSize(24);
  fill(255);
  text("Neural Networks vs. Rogue AI", width/2, height/3 + 50);
  
  // Instructions
  textSize(20);
  text("Arrow Keys: Move", width/2, height/2 + 50);
  text("Space: Fire Neural Beam", width/2, height/2 + 80);
  text("D: Debug Mode", width/2, height/2 + 110);
  
  // Start prompt
  textSize(28);
  if (frameCount % 60 < 30) {
    fill(255, 255, 0);
    text("Press SPACE to Start", width/2, height/2 + 180);
  }
  
  // Leaderboard button
  fill(50, 100, 200);
  rect(width/2 - 100, height - 150, 200, 40, 10);
  fill(255);
  textSize(20);
  text("View Leaderboard", width/2, height - 125);
}

function showDifficultyScreen() {
  textAlign(CENTER);
  textSize(40);
  fill(100, 200, 255);
  text("Select Difficulty", width/2, height/3);
  
  // Easy button
  if (difficultyLevel === "easy") {
    fill(100, 255, 100, 200);
  } else {
    fill(50, 150, 50, 150);
  }
  rect(width/2 - 100, height/2 - 50, 200, 50, 10);
  fill(255);
  textSize(24);
  text("Easy", width/2, height/2 - 20);
  
  // Medium button
  if (difficultyLevel === "medium") {
    fill(255, 200, 100, 200);
  } else {
    fill(150, 100, 50, 150);
  }
  rect(width/2 - 100, height/2 + 20, 200, 50, 10);
  fill(255);
  text("Medium", width/2, height/2 + 50);
  
  // Hard button
  if (difficultyLevel === "hard") {
    fill(255, 100, 100, 200);
  } else {
    fill(150, 50, 50, 150);
  }
  rect(width/2 - 100, height/2 + 90, 200, 50, 10);
  fill(255);
  text("Hard", width/2, height/2 + 120);
  
  // Start button
  fill(100, 200, 255, 200);
  rect(width/2 - 100, height/2 + 170, 200, 50, 10);
  fill(255);
  text("Start Game", width/2, height/2 + 200);
  
  // Difficulty descriptions
  textSize(16);
  textAlign(LEFT);
  fill(200, 200, 200);
  
  if (difficultyLevel === "easy") {
    text("• Slower enemies", width/2 - 250, height/2 + 250);
    text("• More power-ups", width/2 - 250, height/2 + 275);
    text("• Lower score multiplier (0.7x)", width/2 - 250, height/2 + 300);
  } else if (difficultyLevel === "medium") {
    text("• Balanced gameplay", width/2 - 250, height/2 + 250);
    text("• Standard enemy speed", width/2 - 250, height/2 + 275);
    text("• Normal score multiplier (1.0x)", width/2 - 250, height/2 + 300);
  } else if (difficultyLevel === "hard") {
    text("• Faster enemies", width/2 - 250, height/2 + 250);
    text("• More enemies spawn", width/2 - 250, height/2 + 275);
    text("• Higher score multiplier (1.5x)", width/2 - 250, height/2 + 300);
  }
}

function showGameOverScreen() {
  textAlign(CENTER);
  fill(255, 0, 0);
  textSize(48);
  text("GAME OVER", width/2, height/3);
  
  textSize(24);
  fill(255);
  text(`Final Score: ${score}`, width/2, height/3 + 50);
  
  // Connection status indicator
  textSize(14);
  textAlign(RIGHT);
  if (window.isSupabaseInitialized) {
    fill(100, 255, 100);
    text("ONLINE", width - 20, 30);
  } else {
    fill(255, 100, 100);
    text("OFFLINE", width - 20, 30);
  }
  textAlign(CENTER);
  
  // Input fields
  fill(30, 40, 60);
  rect(width/2 - 150, height/2, 300, 50, 5);
  rect(width/2 - 150, height/2 + 70, 300, 50, 5);
  
  // Labels
  textAlign(LEFT);
  textSize(16);
  fill(200, 200, 200);
  text("Enter your initials (3 characters):", width/2 - 150, height/2 - 10);
  text("Enter your email:", width/2 - 150, height/2 + 60);
  
  // Input values
  textSize(24);
  fill(255);
  text(playerInitials + (inputField === "initials" && cursorBlink ? "|" : ""), width/2 - 140, height/2 + 30);
  text(playerEmail + (inputField === "email" && cursorBlink ? "|" : ""), width/2 - 140, height/2 + 100);
  
  // Submit button
  if (playerInitials.length > 0 && isValidEmail(playerEmail)) {
    fill(100, 255, 100);
  } else {
    fill(100, 100, 100);
  }
  rect(width/2 - 100, height/2 + 150, 200, 50, 10);
  fill(255);
  textSize(20);
  textAlign(CENTER);
  text("Submit Score", width/2, height/2 + 180);
  
  // Instructions
  textSize(16);
  fill(200, 200, 200);
  text("Press TAB to switch fields", width/2, height/2 + 240);
  text("Press ENTER to submit", width/2, height/2 + 265);
  
  // Show share buttons if score is submitted
  const shareButtons = document.getElementById('share-buttons');
  if (shareButtons) {
    if (playerInitials.length > 0 && isValidEmail(playerEmail)) {
      // Make player data available for sharing
      window.playerInitials = playerInitials;
      window.score = score;
      window.difficultyLevel = difficultyLevel;
      
      // Show share buttons
      shareButtons.style.display = 'flex';
    } else {
      // Hide share buttons until score is ready to submit
      shareButtons.style.display = 'none';
    }
  }
}

function isValidEmail(email) {
  // Basic email validation
  return /\S+@\S+\.\S+/.test(email);
}

function showLeaderboardScreen() {
  textAlign(CENTER);
  textSize(40);
  fill(100, 200, 255);
  text("Leaderboard", width/2, 80);
  
  // Connection status
  textSize(14);
  textAlign(RIGHT);
  if (window.isSupabaseInitialized) {
    fill(100, 255, 100);
    text("ONLINE", width - 20, 30);
  } else {
    fill(255, 100, 100);
    text("OFFLINE", width - 20, 30);
  }
  
  // Headers
  textSize(16);
  fill(200, 200, 200);
  textAlign(LEFT);
  text("Rank", 50, 130);
  text("Initials", 100, 130);
  text("Score", 200, 130);
  text("Email", 300, 130);
  text("Difficulty", 450, 130);
  
  // Leaderboard entries
  for (let i = 0; i < leaderboard.length; i++) {
    const entry = leaderboard[i];
    const y = 160 + i * 30;
    
    // Highlight current player's score
    if (entry.player_initials === playerInitials && entry.score === score) {
      fill(100, 255, 100, 50);
      rect(40, y - 20, width - 80, 30, 5);
    }
    
    textAlign(LEFT);
    fill(255);
    text(`${i + 1}`, 50, y);
    text(entry.player_initials, 100, y);
    text(entry.score, 200, y);
    
    // Display email (truncated if too long)
    const displayEmail = entry.player_email ? 
      (entry.player_email.length > 20 ? entry.player_email.substring(0, 17) + "..." : entry.player_email) : 
      "N/A";
    text(displayEmail, 300, y);
    
    // Color-code difficulty
    if (entry.difficulty === "easy") {
      fill(100, 255, 100);
    } else if (entry.difficulty === "medium") {
      fill(255, 200, 100);
    } else {
      fill(255, 100, 100);
    }
    text(entry.difficulty, 450, y);
  }
  
  // Back button
  fill(100, 100, 200);
  rect(width/2 - 100, height - 100, 200, 50, 10);
  fill(255);
  textAlign(CENTER);
  textSize(20);
  text("Back to Title", width/2, height - 75);
  
  // Refresh button for leaderboard
  fill(100, 200, 100);
  rect(width - 150, height - 100, 120, 50, 10);
  fill(255);
  textAlign(CENTER);
  textSize(20);
  text("Refresh", width - 90, height - 75);
  
  // Share your score button (if you have a score)
  if (playerInitials && score > 0) {
    fill(29, 161, 242, 150);
    rect(width - 150, height - 160, 120, 50, 10);
    fill(255);
    text("Share Score", width - 90, height - 135);
    
    // Draw X/Twitter logo
    fill(255);
    textSize(16);
    text("X", width - 130, height - 135);
  }
}

function drawHUD() {
  // Score and level display
  fill(255);
  textSize(24);
  textAlign(LEFT);
  text(`Score: ${score}`, 20, 40);
  text(`Level: ${level}`, 20, 70);
  
  // Difficulty indicator
  textAlign(RIGHT);
  if (difficultyLevel === "easy") {
    fill(100, 255, 100);
    text("EASY", width - 20, 40);
  } else if (difficultyLevel === "medium") {
    fill(255, 200, 100);
    text("MEDIUM", width - 20, 40);
  } else {
    fill(255, 100, 100);
    text("HARD", width - 20, 40);
  }
  
  // Debug info
  textAlign(LEFT);
  if (debugMode) {
    fill(100, 200, 255);
    text("DEBUG MODE ON - Press D to toggle", 20, 100);
  }
  
  // AI-themed progress bar
  fill(50);
  rect(width - 220, 70, 200, 20);
  
  // Color based on difficulty
  if (difficultyLevel === "easy") {
    fill(100, 255, 100);
  } else if (difficultyLevel === "medium") {
    fill(255, 200, 100);
  } else {
    fill(255, 100, 100);
  }
  
  rect(width - 220, 70, map(score % 100, 0, 100, 0, 200), 20);
  fill(255);
  text("Neural Link: " + floor(score % 100) + "%", width - 220, 65);
  
  // Power-up status indicators
  if (player.shield) {
    fill(50, 255, 100, 150);
    rect(20, height - 70, 30, 30, 5);
    fill(255);
    text("Shield: " + ceil(player.shieldTime / 60) + "s", 60, height - 48);
  }
  
  if (player.powerUpType === "TRIPLE") {
    fill(50, 100, 255, 150);
    rect(20, height - 110, 30, 30, 5);
    fill(255);
    text("Triple Shot: " + ceil(player.powerUpTime / 60) + "s", 60, height - 88);
  }
  
  if (player.speedBoost) {
    fill(255, 255, 50, 150);
    rect(20, height - 150, 30, 30, 5);
    fill(255);
    text("Speed: " + ceil(player.speedBoostTime / 60) + "s", 60, height - 128);
  }
}

function createExplosion(x, y) {
  // Add particle effects for explosion
  for (let i = 0; i < 20; i++) {
    particleEffects.push(new Particle(x, y));
  }
}

function applyPowerUp(type) {
  switch(type) {
    case 0: // Triple shot
      player.powerUpTime = 300;
      player.powerUpType = "TRIPLE";
      break;
    case 1: // Shield
      player.shield = true;
      player.shieldTime = 300;
      break;
    case 2: // Speed boost
      player.speedBoost = true;
      player.speedBoostTime = 300;
      break;
  }
}

function keyPressed() {
  // Add debug logging to see what keys are being pressed
  console.log("Key pressed:", key, "Key code:", keyCode);
  
  if (gameState === "title") {
    if (key === ' ') {
      gameState = "difficultySelect";
    }
  } else if (gameState === "difficultySelect") {
    // Handled by mousePressed
  } else if (gameState === "playing") {
    if (key === ' ') {
      if (player.powerUpType === "TRIPLE") {
        // Triple shot
        bullets.push(new Bullet(player.x, player.y));
        bullets.push(new Bullet(player.x - 10, player.y + 5, -0.3));
        bullets.push(new Bullet(player.x + 10, player.y + 5, 0.3));
      } else {
        bullets.push(new Bullet(player.x, player.y));
      }
    }
    
    if (key === 'd' || key === 'D') {
      debugMode = !debugMode;
    }
  } else if (gameState === "gameOver") {
    console.log("Game over input - Field:", inputField, "Current value:", 
                inputField === "initials" ? playerInitials : playerEmail);
    
    if (keyCode === TAB) {
      // Switch between input fields
      inputField = inputField === "initials" ? "email" : "initials";
      console.log("Switched to field:", inputField);
      return false; // Prevent default tab behavior
    } else if (keyCode === ENTER) {
      // Submit score if valid
      if (playerInitials.length > 0 && isValidEmail(playerEmail)) {
        console.log("Submitting score:", playerInitials, playerEmail, score);
        
        // Make player data available for sharing
        window.playerInitials = playerInitials;
        window.score = score;
        window.difficultyLevel = difficultyLevel;
        
        // Show share buttons
        const shareButtons = document.getElementById('share-buttons');
        if (shareButtons) {
          shareButtons.style.display = 'flex';
        }
        
        // Add to leaderboard
        addToLeaderboard(playerInitials, playerEmail, score, difficultyLevel);
        gameState = "leaderboard";
      } else {
        console.log("Cannot submit - initials or email invalid");
      }
    } else if (keyCode === BACKSPACE) {
      // Handle backspace
      if (inputField === "initials") {
        playerInitials = playerInitials.slice(0, -1);
        console.log("Backspace in initials, new value:", playerInitials);
      } else {
        playerEmail = playerEmail.slice(0, -1);
        console.log("Backspace in email, new value:", playerEmail);
      }
      return false; // Prevent browser back
    } else if (key.length === 1) { // Single character keys
      if (inputField === "initials") {
        // Limit initials to 3 uppercase characters
        if (playerInitials.length < 3) {
          playerInitials += key.toUpperCase();
          console.log("Added to initials, new value:", playerInitials);
        }
      } else {
        // Email input
        playerEmail += key;
        console.log("Added to email, new value:", playerEmail);
      }
    }
  } else if (gameState === "leaderboard") {
    if (keyCode === ESCAPE || key === ' ') {
      // Hide share buttons when leaving leaderboard
      const shareButtons = document.getElementById('share-buttons');
      if (shareButtons) {
        shareButtons.style.display = 'none';
      }
      
      gameState = "title";
    }
  }
  
  // Prevent default behavior for game keys
  return false;
}

function resetGame() {
  setup();
  score = 0;
  level = 1;
  enemySpawnRate = 0.02 * difficultyMultipliers[difficultyLevel];
  bullets = [];
  enemies = [];
  powerUps = [];
  particleEffects = [];
  
  // Spawn initial enemies
  for (let i = 0; i < 5; i++) {
    enemies.push(new Enemy(random(width), random(-500, 0)));
  }
  
  gameState = "playing";
}

function mousePressed() {
  // Ensure the game is initialized before processing clicks
  if (!gameInitialized) return;
  
  console.log("Mouse pressed at:", mouseX, mouseY, "Game state:", gameState);
  
  if (gameState === "title") {
    // Check if leaderboard button was clicked
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
        mouseY > height - 150 && mouseY < height - 110) {
      gameState = "leaderboard";
      console.log("Showing leaderboard");
    } else {
      // Clicking anywhere else on title screen also starts the game
      gameState = "difficultySelect";
      console.log("Showing difficulty select");
    }
  } else if (gameState === "difficultySelect") {
    // Easy button
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
        mouseY > height/2 - 50 && mouseY < height/2) {
      difficultyLevel = "easy";
      console.log("Selected Easy difficulty");
    }
    // Medium button
    else if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
             mouseY > height/2 + 20 && mouseY < height/2 + 70) {
      difficultyLevel = "medium";
      console.log("Selected Medium difficulty");
    }
    // Hard button
    else if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
             mouseY > height/2 + 90 && mouseY < height/2 + 140) {
      difficultyLevel = "hard";
      console.log("Selected Hard difficulty");
    }
    // Start button
    else if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
             mouseY > height/2 + 170 && mouseY < height/2 + 220) {
      resetGame();
      console.log("Game started with " + difficultyLevel + " difficulty");
    }
  } else if (gameState === "gameOver") {
    console.log("Game over mouse click - Current field:", inputField);
    
    // Check if submit button was clicked
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
        mouseY > height/2 + 150 && mouseY < height/2 + 200) {
      if (playerInitials.length > 0 && isValidEmail(playerEmail)) {
        // Add to leaderboard
        console.log("Submitting score via click:", playerInitials, playerEmail, score);
        addToLeaderboard(playerInitials, playerEmail, score, difficultyLevel);
        gameState = "leaderboard";
      } else {
        console.log("Cannot submit - initials or email invalid");
      }
    }
    // Check if initials field was clicked
    else if (mouseX > width/2 - 150 && mouseX < width/2 + 150 && 
             mouseY > height/2 && mouseY < height/2 + 50) {
      inputField = "initials";
      console.log("Switched to initials field");
    }
    // Check if email field was clicked
    else if (mouseX > width/2 - 150 && mouseX < width/2 + 150 && 
             mouseY > height/2 + 70 && mouseY < height/2 + 120) {
      inputField = "email";
      console.log("Switched to email field");
    }
  } else if (gameState === "leaderboard") {
    // Check if back button was clicked
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
        mouseY > height - 100 && mouseY < height - 50) {
      gameState = "title";
    }
    // Check if refresh button was clicked
    else if (mouseX > width - 150 && mouseX < width - 30 && 
             mouseY > height - 100 && mouseY < height - 50) {
      console.log("Refreshing leaderboard");
      
      // Show loading indicator
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.style.display = 'flex';
        const message = overlay.querySelector('p');
        if (message) message.textContent = "Refreshing leaderboard...";
      }
      
      // Try to refresh from Supabase
      if (window.loadLeaderboardFromSupabase) {
        window.loadLeaderboardFromSupabase()
          .then(data => {
            console.log("Leaderboard refreshed from Supabase:", data);
            if (data && data.length > 0) {
              leaderboard = data;
            }
            // Hide overlay
            if (overlay) overlay.style.display = 'none';
          })
          .catch(err => {
            console.error("Error refreshing leaderboard:", err);
            // Hide overlay
            if (overlay) overlay.style.display = 'none';
            // Fallback to localStorage
            loadLeaderboard();
          });
      } else {
        console.log("Supabase not available, loading from localStorage");
        // Hide overlay
        if (overlay) overlay.style.display = 'none';
        // Fallback to localStorage
        loadLeaderboard();
      }
    }
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.alpha = 255;
    this.size = random(5, 10);
    this.color = [random(200, 255), random(100, 200), random(0, 100)];
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
    this.size *= 0.95;
  }
  
  show() {
    noStroke();
    fill(this.color[0], this.color[1], this.color[2], this.alpha);
    ellipse(this.x, this.y, this.size);
  }
  
  isDead() {
    return this.alpha <= 0;
  }
}

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = floor(random(3)); // 0: Triple shot, 1: Shield, 2: Speed
    this.size = 20;
    this.speed = 2;
    this.angle = 0;
  }
  
  update() {
    this.y += this.speed;
    this.angle += 0.05;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw power-up
    noStroke();
    
    switch(this.type) {
      case 0: // Triple shot - blue
        fill(50, 100, 255);
        break;
      case 1: // Shield - green
        fill(50, 255, 100);
        break;
      case 2: // Speed - yellow
        fill(255, 255, 50);
        break;
    }
    
    // Power-up shape
    beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = TWO_PI / 5 * i - PI/2;
      let r1 = this.size / 2;
      let r2 = this.size / 4;
      let x1 = cos(angle) * r1;
      let y1 = sin(angle) * r1;
      vertex(x1, y1);
      
      angle += TWO_PI / 10;
      let x2 = cos(angle) * r2;
      let y2 = sin(angle) * r2;
      vertex(x2, y2);
    }
    endShape(CLOSE);
    
    // Glowing effect
    noFill();
    strokeWeight(2);
    
    switch(this.type) {
      case 0: // Triple shot
        stroke(50, 100, 255, 150);
        break;
      case 1: // Shield
        stroke(50, 255, 100, 150);
        break;
      case 2: // Speed
        stroke(255, 255, 50, 150);
        break;
    }
    
    ellipse(0, 0, this.size * 1.5);
    pop();
  }
  
  offscreen() {
    return this.y > height + this.size;
  }
  
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size/2 + player.size/2;
  }
}

class Player {
  constructor() {
    this.x = width/2;
    this.y = height - 100;
    this.size = 40;
    this.speed = 5;
    this.shield = false;
    this.shieldTime = 0;
    this.powerUpType = "";
    this.powerUpTime = 0;
    this.speedBoost = false;
    this.speedBoostTime = 0;
  }
  
  update() {
    // Movement with potential speed boost
    let currentSpeed = this.speed;
    if (this.speedBoost) {
      currentSpeed = this.speed * 1.5;
    }
    
    if (keyIsDown(LEFT_ARROW)) this.x -= currentSpeed;
    if (keyIsDown(RIGHT_ARROW)) this.x += currentSpeed;
    this.x = constrain(this.x, this.size/2, width - this.size/2);
    
    // Update power-up timers
    if (this.powerUpTime > 0) {
      this.powerUpTime--;
      if (this.powerUpTime <= 0) {
        this.powerUpType = "";
      }
    }
    
    if (this.shieldTime > 0) {
      this.shieldTime--;
      if (this.shieldTime <= 0) {
        this.shield = false;
      }
    }
    
    if (this.speedBoostTime > 0) {
      this.speedBoostTime--;
      if (this.speedBoostTime <= 0) {
        this.speedBoost = false;
      }
    }
  }
  
  show() {
    push();
    translate(this.x, this.y);
    
    // Shield effect
    noFill();
    strokeWeight(2);
    stroke(100, 200, 255, 150);
    arc(0, 0, this.size * 1.5, this.size * 1.5, PI, TWO_PI);
    
    // Active shield visualization
    if (this.shield) {
      noFill();
      strokeWeight(3);
      stroke(50, 255, 100, 150 + sin(frameCount * 0.1) * 50);
      ellipse(0, 0, this.size * 1.8);
      
      // Shield particles
      for (let i = 0; i < 3; i++) {
        let angle = frameCount * 0.05 + i * TWO_PI / 3;
        let x = cos(angle) * this.size * 0.9;
        let y = sin(angle) * this.size * 0.9;
        fill(100, 255, 150, 150);
        noStroke();
        ellipse(x, y, 5);
      }
    }
    
    // Main ship body
    noStroke();
    fill(50, 100, 200);
    beginShape();
    vertex(0, -25);  // Top point
    vertex(-20, 15); // Bottom left
    vertex(-10, 5);  // Inner left
    vertex(0, 15);   // Bottom middle
    vertex(10, 5);   // Inner right
    vertex(20, 15);  // Bottom right
    endShape(CLOSE);
    
    // Cockpit/AI core
    fill(150, 230, 255);
    ellipse(0, -5, 15, 20);
    
    // Glowing engine effects
    fill(100, 200, 255, 150);
    ellipse(-12, 15, 8, 12);
    ellipse(12, 15, 8, 12);
    
    // Thruster flames
    fill(255, 150, 50);
    beginShape();
    vertex(-14, 15);
    vertex(-10, 15);
    vertex(-12, 15 + random(10, 20));
    endShape(CLOSE);
    
    beginShape();
    vertex(14, 15);
    vertex(10, 15);
    vertex(12, 15 + random(10, 20));
    endShape(CLOSE);
    
    // Power-up indicator
    if (this.powerUpType === "TRIPLE") {
      fill(50, 100, 255);
      textSize(10);
      text("3X", 0, -30);
    }
    
    if (this.speedBoost) {
      fill(255, 255, 50);
      textSize(10);
      text("SPEED", 0, 30);
    }
    
    // Draw collision boundary in debug mode
    if (debugMode) {
      noFill();
      stroke(0, 255, 0);
      ellipse(0, 0, this.size * 0.7);
    }
    
    pop();
  }
  
  hits(enemy) {
    // Shield protects from hits
    if (this.shield) return false;
    
    let d = dist(this.x, this.y, enemy.x, enemy.y);
    // Use a smaller collision radius (70% of the original) to better match the visual shape
    return d < (this.size/2 + enemy.size/2) * 0.7;
  }
}

class Bullet {
  constructor(x, y, angleOffset = 0) {
    this.x = x;
    this.y = y;
    this.speed = -10;
    this.size = 10;
    this.angleOffset = angleOffset;
  }
  
  update() {
    this.y += this.speed;
    this.x += this.speed * this.angleOffset;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    
    // Neural network themed bullet
    noStroke();
    
    // Glowing effect
    fill(100, 200, 255, 100);
    ellipse(0, 0, this.size * 2);
    
    // Main bullet
    fill(150, 230, 255);
    ellipse(0, 0, this.size);
    
    // Neural connections
    stroke(200, 255, 255);
    strokeWeight(1);
    line(-this.size/2, 0, this.size/2, 0);
    line(0, -this.size/2, 0, this.size/2);
    
    // Pulse effect based on frame
    let pulseSize = 5 + sin(frameCount * 0.2) * 2;
    noStroke();
    fill(255);
    ellipse(0, 0, pulseSize);
    
    pop();
  }
  
  offscreen() {
    return this.y < -this.size;
  }
  
  hits(enemy) {
    let d = dist(this.x, this.y, enemy.x, enemy.y);
    return d < this.size/2 + enemy.size/2 * 0.8;
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 40;
    
    // Adjust speed based on difficulty
    this.baseSpeed = 3;
    this.speed = this.baseSpeed * difficultyMultipliers[difficultyLevel];
    
    // Add movement patterns for harder difficulties
    this.movementType = "straight";
    if (difficultyLevel === "medium" && random(1) < 0.3) {
      this.movementType = "zigzag";
      this.amplitude = random(1, 3);
      this.frequency = random(0.02, 0.05);
    } else if (difficultyLevel === "hard") {
      if (random(1) < 0.5) {
        this.movementType = "zigzag";
        this.amplitude = random(2, 5);
        this.frequency = random(0.03, 0.08);
      } else if (random(1) < 0.3) {
        this.movementType = "homing";
        this.homingStrength = 0.01;
      }
    }
    
    // Visual enhancements based on difficulty
    if (difficultyLevel === "hard") {
      this.size = 45; // Slightly larger
      this.glowIntensity = 1.5; // More intense glow
    } else if (difficultyLevel === "medium") {
      this.glowIntensity = 1.2;
    } else {
      this.glowIntensity = 1.0;
    }
    
    // Animation properties
    this.angle = 0;
    this.pulseOffset = random(0, TWO_PI);
  }
  
  update() {
    // Basic downward movement
    this.y += this.speed;
    
    // Apply movement pattern
    if (this.movementType === "zigzag") {
      this.x += sin(frameCount * this.frequency) * this.amplitude;
    } else if (this.movementType === "homing" && player) {
      // Gradually move toward player
      let dx = player.x - this.x;
      this.x += dx * this.homingStrength;
    }
    
    // Keep within screen bounds
    this.x = constrain(this.x, this.size/2, width - this.size/2);
    
    // Update animation
    this.angle += 0.02;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw AI enemy ship - hexagonal design with glowing core
    noStroke();
    
    // Glowing effect - intensity based on difficulty
    let glowAlpha = 50 * this.glowIntensity;
    let glowSize = this.size * 1.2;
    
    // Pulsing glow
    let pulseAmount = sin(frameCount * 0.1 + this.pulseOffset) * 10;
    
    fill(255, 0, 100, glowAlpha);
    ellipse(0, 0, glowSize + pulseAmount);
    
    // Main body - hexagonal shape
    fill(50, 0, 80);
    beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i - PI/6;
      let x = cos(angle) * this.size/2;
      let y = sin(angle) * this.size/2;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // AI core - pulsing center
    let pulseSize = 15 + sin(frameCount * 0.1 + this.pulseOffset) * 5;
    
    // Color based on difficulty
    if (difficultyLevel === "easy") {
      fill(255, 0, 100);
    } else if (difficultyLevel === "medium") {
      fill(255, 50, 0);
    } else {
      fill(255, 0, 0);
    }
    
    ellipse(0, 0, pulseSize);
    
    // AI "eye" - scanning beam
    fill(255, 100, 200);
    ellipse(0, 0, 8);
    
    // Circuit pattern
    stroke(200, 0, 150);
    strokeWeight(1);
    line(-this.size/3, -this.size/3, this.size/3, this.size/3);
    line(this.size/3, -this.size/3, -this.size/3, this.size/3);
    
    // Additional details for harder difficulties
    if (difficultyLevel === "medium" || difficultyLevel === "hard") {
      // Extra circuit lines
      stroke(200, 0, 150, 150);
      noFill();
      ellipse(0, 0, this.size * 0.7);
      
      // Spikes for hard mode
      if (difficultyLevel === "hard") {
        fill(150, 0, 50);
        for (let i = 0; i < 6; i++) {
          let angle = TWO_PI / 6 * i;
          push();
          rotate(angle);
          triangle(0, -this.size/2, -5, -this.size/2 - 10, 5, -this.size/2 - 10);
          pop();
        }
      }
    }
    
    // Draw collision boundary in debug mode
    if (debugMode) {
      noFill();
      stroke(255, 0, 0);
      ellipse(0, 0, this.size * 0.7);
    }
    
    pop();
  }
  
  offscreen() {
    return this.y > height + this.size;
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.z = random(1, 3);
    this.speed = this.z;
  }
  
  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
  }
  
  show() {
    fill(255, 255, 200);
    noStroke();
    ellipse(this.x, this.y, this.z);
  }
}