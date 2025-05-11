document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const pauseScreen = document.getElementById('pause-screen');
    const celebrationScreen = document.getElementById('celebration-screen');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const restartButton = document.getElementById('restart-button');
    const playAgainButton = document.getElementById('play-again');
    const scoreElement = document.getElementById('score');
    const targetScoreElement = document.getElementById('target-score');
    const progressBar = document.getElementById('progress');
    const gameArea = document.getElementById('game-area');
    const countdownElement = document.getElementById('countdown');
    const soundControl = document.getElementById('sound-control');
    const soundIcon = document.getElementById('sound-icon');
    const preloader = document.getElementById('preloader');
    
    // Audio elements
    const popSound = document.getElementById('pop-sound');
    const successSound = document.getElementById('success-sound');
    const backgroundMusic = document.getElementById('background-music');
    
    // Game variables
    let score = 0;
    let targetScore = 18;
    let gameRunning = false;
    let isPaused = false;
    let soundEnabled = true;
    let nextBalloonTimeout;
    let comboCount = 0;
    let comboTimer = null;
    let activeMultiplier = 1;
    let difficultyLevel = 0;
    
    // Balloon colors and sizes
    let balloonColors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#FFD166', // Yellow
        '#7A28CB', // Purple
        '#FF9F1C', // Orange
        '#F72C88', // Pink
    ];
    
    // Special balloon types - Simplified
    const balloonTypes = [
        { type: 'regular', chance: 40, points: 1, speedMultiplier: 1 },
        { type: 'golden', chance: 15, points: 3, speedMultiplier: 1.2 },
        { type: 'bomb', chance: 40, points: -2, speedMultiplier: 0.8 },
        { type: 'heart', chance: 5, points: 1, speedMultiplier: 1 }
    ];
    
    // Power-up types - Simplified and removed magnet
    const powerupTypes = [
        { type: 'slowTime', duration: 8, icon: '⏱️', chance: 40 },
        { type: 'doublePoints', duration: 10, icon: '2️⃣', chance: 40 },
        { type: 'popAll', duration: 0, icon: '💥', chance: 20 }
    ];
    
    // Wait for assets to load
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1000);
    });
    
    // Update target score display
    targetScoreElement.textContent = targetScore;
    
    // Sound controls
    soundControl.addEventListener('click', toggleSound);
    
    function toggleSound() {
        soundEnabled = !soundEnabled;
        
        if (soundEnabled) {
            soundIcon.className = 'fas fa-volume-up';
            if (gameRunning && !isPaused) {
                backgroundMusic.play();
            }
        } else {
            soundIcon.className = 'fas fa-volume-mute';
            backgroundMusic.pause();
        }
    }
    
    // Helper functions for special mechanics
    function selectBalloonType() {
        // Calculate total chance
        const totalChance = balloonTypes.reduce((sum, type) => sum + type.chance, 0);
        
        // Generate random number
        const random = Math.random() * totalChance;
        
        // Find selected type
        let cumulativeChance = 0;
        for (const balloonType of balloonTypes) {
            cumulativeChance += balloonType.chance;
            if (random <= cumulativeChance) {
                return balloonType;
            }
        }
        
        // Fallback to regular
        return balloonTypes[0];
    }
    
    function selectPowerupType() {
        // Calculate total chance
        const totalChance = powerupTypes.reduce((sum, type) => sum + type.chance, 0);
        
        // Generate random number
        const random = Math.random() * totalChance;
        
        // Find selected type
        let cumulativeChance = 0;
        for (const powerupType of powerupTypes) {
            cumulativeChance += powerupType.chance;
            if (random <= cumulativeChance) {
                return powerupType;
            }
        }
        
        // Fallback to first
        return powerupTypes[0];
    }
    
    function shouldGeneratePowerup() {
        // Chance increases with difficulty level
        return Math.random() < (0.05 + difficultyLevel * 0.02);
    }
    
    function createPowerup() {
        if (!gameRunning || isPaused) return;
        
        const powerupType = selectPowerupType();
        const powerup = document.createElement('div');
        powerup.className = 'powerup';
        powerup.dataset.type = powerupType.type;
        
        // Set random position
        const posX = 10 + Math.random() * 80;
        const posY = 10 + Math.random() * 80;
        powerup.style.left = `${posX}%`;
        powerup.style.top = `${posY}%`;
        
        // Add icon
        powerup.innerHTML = `
            <div class="powerup-icon">${powerupType.icon}</div>
            <div class="powerup-glow"></div>
        `;
        
        // Add to game area
        gameArea.appendChild(powerup);
        
        // Add click event
        powerup.addEventListener('click', () => activatePowerup(powerup, powerupType));
        
        // Remove after some time if not collected
        setTimeout(() => {
            if (gameArea.contains(powerup)) {
                powerup.classList.add('fading');
                setTimeout(() => {
                    if (gameArea.contains(powerup)) {
                        powerup.remove();
                    }
                }, 1000);
            }
        }, 7000);
    }
    
    // Start game
    startButton.addEventListener('click', () => {
        startCountdown();
    });
    
    pauseButton.addEventListener('click', pauseGame);
    resumeButton.addEventListener('click', resumeGame);
    restartButton.addEventListener('click', () => {
        pauseScreen.classList.add('hidden');
        startCountdown();
    });
    
    playAgainButton.addEventListener('click', () => {
        celebrationScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        // Stop the celebration music when returning to start screen
        successSound.pause();
        successSound.currentTime = 0;
        resetGame();
    });
    
    // Game functions
    function startCountdown() {
        resetGame();
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        countdownElement.classList.remove('hidden');
        countdownElement.textContent = '3';
        
        let count = 3;
        const countdownInterval = setInterval(() => {
            count--;
            
            if (count <= 0) {
                clearInterval(countdownInterval);
                countdownElement.classList.add('hidden');
                startGame();
            } else {
                countdownElement.textContent = count;
            }
        }, 1000);
    }
    
    function startGame() {
        gameRunning = true;
        isPaused = false;
        
        // Initialize game variables
        score = 0;
        comboCount = 0;
        activeMultiplier = 1;
        difficultyLevel = 0;
        
        // Update UI
        scoreElement.textContent = score;
        progressBar.style.width = '0%';
        
        if (soundEnabled) {
            backgroundMusic.play();
        }
        
        // Start spawning balloons
        generateBalloons();
    }
    
    function pauseGame() {
        if (!gameRunning) return;
        
        isPaused = true;
        gameScreen.classList.add('hidden');
        pauseScreen.classList.remove('hidden');
        
        backgroundMusic.pause();
        
        // Clear any pending balloon generations
        clearTimeout(nextBalloonTimeout);
    }
    
    function resumeGame() {
        if (!gameRunning) return;
        
        isPaused = false;
        pauseScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        if (soundEnabled) {
            backgroundMusic.play();
        }
        
        // Resume balloon generation
        generateBalloons();
    }
    
    function resetGame() {
        score = 0;
        scoreElement.textContent = score;
        progressBar.style.width = '0%';
        gameArea.innerHTML = '';
        gameRunning = false;
        isPaused = false;
        comboCount = 0;
        activeMultiplier = 1;
        difficultyLevel = 0;
        
        // Clear timers
        if (comboTimer) clearTimeout(comboTimer);
        
        // Clear any pending balloon generations
        clearTimeout(nextBalloonTimeout);
        
        // Reset background music
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    function generateBalloons() {
        if (!gameRunning || isPaused) return;
        
        // Maybe generate a powerup
        if (shouldGeneratePowerup()) {
            createPowerup();
        }
        
        // Create multiple balloons at once sometimes for more random distribution
        const balloonCount = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 1;
        
        for (let i = 0; i < balloonCount; i++) {
            // Create a new balloon with slight delay for each additional balloon
            setTimeout(() => {
                if (!gameRunning || isPaused) return;
                
                // Select balloon type
                const balloonType = selectBalloonType();
                
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                balloon.dataset.type = balloonType.type;
                balloon.dataset.points = balloonType.points;
                
                // Set random horizontal position (0% to 100% of game area width)
                const posX = Math.random() * 100;
                balloon.style.left = `${posX}%`;
                
                // Randomize starting position
                const startFromSide = Math.random() < 0.2;
                if (startFromSide) {
                    // Start from side (left or right)
                    balloon.style.top = `${20 + Math.random() * 60}%`;
                    balloon.style.left = Math.random() < 0.5 ? '-10%' : '110%';
                    
                    // Custom animation for side balloons
                    const direction = balloon.style.left === '-10%' ? 1 : -1;
                    const distance = 110 + Math.random() * 20;
                    const duration = (5 + Math.random() * 5) / balloonType.speedMultiplier;
                    
                    balloon.style.animation = 'none';
                    balloon.animate([
                        { transform: `translateX(0) translateY(0) rotate(0deg)` },
                        { transform: `translateX(${direction * distance}%) translateY(-${50 + Math.random() * 100}%) rotate(${direction * 20}deg)` }
                    ], {
                        duration: duration * 1000,
                        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                        fill: 'forwards'
                    });
                    
                    // Remove balloon after animation
                    setTimeout(() => {
                        if (gameArea.contains(balloon)) {
                            balloon.remove();
                        }
                    }, duration * 1000);
                } else {
                    // Start from bottom with random horizontal movement
                    const swayAmount = -20 + Math.random() * 40; // -20% to +20% horizontal drift
                    
                    // Set random size (30 to 80px for more variety)
                    const size = 30 + Math.random() * 50;
                    balloon.style.width = `${size}px`;
                    balloon.style.height = `${size}px`;
                    
                    // Random start position offset for more natural grouping
                    const startOffset = Math.random() < 0.5 ? 100 : (80 + Math.random() * 40);
                    balloon.style.transform = `translateY(${startOffset}%)`;
                    
                    // Set random animation duration (3 to 8 seconds)
                    const duration = (3 + Math.random() * 5) / balloonType.speedMultiplier;
                    
                    // Custom float animation with horizontal sway
                    balloon.style.animation = 'none';
                    balloon.animate([
                        { transform: `translateY(${startOffset}%) translateX(0) rotate(${-5 + Math.random() * 10}deg)` },
                        { transform: `translateY(${startOffset/2}%) translateX(${swayAmount/2}%) rotate(${-10 + Math.random() * 20}deg)` },
                        { transform: `translateY(-150%) translateX(${swayAmount}%) rotate(${-10 + Math.random() * 20}deg)` }
                    ], {
                        duration: duration * 1000,
                        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                        fill: 'forwards'
                    });
                    
                    // Remove balloon after animation
                    setTimeout(() => {
                        if (gameArea.contains(balloon)) {
                            balloon.remove();
                        }
                    }, duration * 1000);
                }
                
                // Set random color based on balloon type
                const colorIndex = Math.floor(Math.random() * balloonColors.length);
                let fillColor = balloonColors[colorIndex];
                let specialClass = '';
                
                // Special styling based on balloon type
                switch(balloonType.type) {
                    case 'golden':
                        fillColor = '#FFD700';
                        specialClass = 'golden-glow';
                        break;
                    case 'bomb':
                        fillColor = '#333333';
                        specialClass = 'bomb-balloon';
                        break;
                }
                
                if (specialClass) {
                    balloon.classList.add(specialClass);
                }
                
                // SVG path based on balloon type
                let svgPath = '';
                if (balloonType.type === 'heart') {
                    svgPath = `
                        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="balloonGradient${colorIndex}${i}" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
                                    <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
                                    <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <path d="M50,30 C80,0 110,50 50,80 C-10,50 20,0 50,30 Z" fill="url(#balloonGradient${colorIndex}${i})" />
                            <path d="M50,80 L50,115" stroke="#333" stroke-width="2" />
                            <path d="M45,115 Q50,120 55,115" stroke="#333" stroke-width="2" fill="none" />
                        </svg>
                    `;
                } else if (balloonType.type === 'bomb') {
                    svgPath = `
                        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="balloonGradient${colorIndex}${i}" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
                                    <stop offset="0%" style="stop-color:#666;stop-opacity:0.5" />
                                    <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="60" r="40" fill="url(#balloonGradient${colorIndex}${i})" />
                            <path d="M50,20 L50,10" stroke="#333" stroke-width="3" />
                            <path d="M50,10 Q55,5 60,10" stroke="#333" stroke-width="3" fill="none" />
                            <text x="50" y="70" font-size="30" text-anchor="middle" fill="white">💣</text>
                        </svg>
                    `;
                } else if (balloonType.type === 'golden') {
                    svgPath = `
                        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="balloonGradient${colorIndex}${i}" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
                                    <stop offset="0%" style="stop-color:white;stop-opacity:0.6" />
                                    <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <path d="M50,10 C25,10 10,30 10,60 C10,80 30,100 50,100 C70,100 90,80 90,60 C90,30 75,10 50,10 Z" fill="url(#balloonGradient${colorIndex}${i})" />
                            <path d="M50,100 L50,115" stroke="#333" stroke-width="2" />
                            <path d="M45,115 Q50,120 55,115" stroke="#333" stroke-width="2" fill="none" />
                            <text x="50" y="70" font-size="25" text-anchor="middle" fill="white">✨</text>
                        </svg>
                    `;
                } else {
                    svgPath = `
                        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="balloonGradient${colorIndex}${i}" cx="50%" cy="40%" r="50%" fx="30%" fy="30%">
                                    <stop offset="0%" style="stop-color:white;stop-opacity:0.3" />
                                    <stop offset="100%" style="stop-color:${fillColor};stop-opacity:1" />
                                </radialGradient>
                            </defs>
                            <path d="M50,10 C25,10 10,30 10,60 C10,80 30,100 50,100 C70,100 90,80 90,60 C90,30 75,10 50,10 Z" fill="url(#balloonGradient${colorIndex}${i})" />
                            <path d="M50,100 L50,115" stroke="#333" stroke-width="2" />
                            <path d="M45,115 Q50,120 55,115" stroke="#333" stroke-width="2" fill="none" />
                        </svg>
                    `;
                }
                
                balloon.innerHTML = svgPath;
                
                // Add balloon to game area
                gameArea.appendChild(balloon);
                
                // Add click/touch event to pop balloon
                balloon.addEventListener('click', popBalloon);
                balloon.addEventListener('touchstart', popBalloon);
                
            }, i * 200); // Small delay between multiple balloons
        }
        
        // Generate next balloon with more random delay (600ms to 1800ms)
        // Delay decreases as difficulty increases
        const difficultyFactor = Math.max(0.6, 1 - (difficultyLevel * 0.1));
        const nextBalloonDelay = (600 + Math.random() * 1200) * difficultyFactor;
        nextBalloonTimeout = setTimeout(generateBalloons, nextBalloonDelay);
    }
    
    function popBalloon(e) {
        e.preventDefault(); // Prevent default touch/click behavior
        
        const balloon = e.currentTarget;
        if (balloon.classList.contains('popped')) return;
        
        // Get balloon type and points
        const balloonType = balloon.dataset.type || 'regular';
        const basePoints = parseInt(balloon.dataset.points || 1);
        
        // Special effects based on balloon type
        if (balloonType === 'doublePoints') {
            activeMultiplier = 2;
            showMessage("Çift puan aktif!", 2000);
            setTimeout(() => {
                activeMultiplier = 1;
            }, 10000);
        }
        
        // Play appropriate sound
        if (soundEnabled) {
            if (balloonType === 'bomb') {
                // Play explosion sound
                const explosionSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1001/1001-preview.mp3');
                explosionSound.volume = 0.3;
                explosionSound.play();
            } else {
                // Play normal pop sound
                popSound.currentTime = 0;
                popSound.play();
            }
        }
        
        // Create particle explosion
        createParticleExplosion(balloon, balloonType);
        
        // Add popped class
        balloon.classList.add('popped');
        
        // Handle combo system
        updateCombo();
        
        // Add points based on balloon type and active multiplier
        incrementScore(basePoints * activeMultiplier);
        
        // Show floating score text
        showFloatingScore(balloon, basePoints * activeMultiplier);
        
        // Remove balloon after animation
        setTimeout(() => {
            balloon.remove();
        }, 300);
    }
    
    function updateCombo() {
        // Clear existing combo timer
        if (comboTimer) clearTimeout(comboTimer);
        
        // Increment combo
        comboCount++;
        
        // Show combo message if significant
        if (comboCount >= 3) {
            showCombo(comboCount);
        }
        
        // Reset combo after delay
        comboTimer = setTimeout(() => {
            if (comboCount >= 3) {
                // Add bonus points when combo ends
                const bonusPoints = Math.min(comboCount - 2, 5); // Cap bonus at 5
                showMessage(`Combo Bonusu: +${bonusPoints}!`, 1500);
                incrementScore(bonusPoints);
            }
            comboCount = 0;
        }, 2000);
    }
    
    function showCombo(count) {
        // Only show for combos >= 3
        if (count < 3) return;
        
        let message = "";
        if (count >= 10) {
            message = "MEGA COMBO!!! 🔥🔥🔥";
        } else if (count >= 7) {
            message = "SÜPER COMBO!! 🔥🔥";
        } else if (count >= 5) {
            message = "HARIKA COMBO! 🔥";
        } else {
            message = `${count}x COMBO!`;
        }
        
        showMessage(message, 1000);
    }
    
    function showFloatingScore(balloon, points) {
        const rect = balloon.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        
        const scoreText = document.createElement('div');
        scoreText.className = 'floating-score';
        
        // Different styling based on point value
        if (points > 2) {
            scoreText.classList.add('high-score');
        } else if (points < 0) {
            scoreText.classList.add('negative-score');
        }
        
        scoreText.textContent = points > 0 ? `+${points}` : points;
        scoreText.style.left = (rect.left - gameAreaRect.left + rect.width / 2) + 'px';
        scoreText.style.top = (rect.top - gameAreaRect.top) + 'px';
        
        gameArea.appendChild(scoreText);
        
        // Animate and remove
        setTimeout(() => {
            scoreText.classList.add('float-away');
            setTimeout(() => {
                scoreText.remove();
            }, 1000);
        }, 10);
    }
    
    function incrementScore(points) {
        score += points;
        // Ensure score doesn't go below 0
        score = Math.max(0, score);
        scoreElement.textContent = score;
        
        // Update progress bar
        const progress = (score / targetScore) * 100;
        progressBar.style.width = `${progress}%`;
        
        if (score >= targetScore) {
            endGame();
        }
    }
    
    function createParticleExplosion(balloon, balloonType) {
        // Get balloon position and color
        const rect = balloon.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        const colorIndex = Math.floor(Math.random() * balloonColors.length);
        
        // Create 8-12 particles
        const particleCount = 8 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-piece';
            particle.style.backgroundColor = balloonColors[colorIndex];
            particle.style.left = (rect.left - gameAreaRect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top - gameAreaRect.top + rect.height / 2) + 'px';
            
            // Random size (3-8px)
            const size = 3 + Math.random() * 5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random shape
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            // Add to game area
            gameArea.appendChild(particle);
            
            // Animate particle in random direction
            const angle = Math.random() * Math.PI * 2; // Random angle
            const distance = 20 + Math.random() * 50; // Random distance
            const duration = 0.5 + Math.random() * 0.5; // Random duration
            
            particle.animate([
                { transform: 'translate(0, 0) rotate(0deg)' },
                { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${Math.random() * 360}deg)` }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)',
                fill: 'forwards'
            });
            
            // Remove particle after animation
            setTimeout(() => {
                if (gameArea.contains(particle)) {
                    particle.remove();
                }
            }, duration * 1000);
        }
    }
    
    function endGame() {
        gameRunning = false;
        
        // Stop background music and play success sound
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        
        if (soundEnabled) {
            successSound.play();
        }
        
        // Add confetti effect
        createConfetti();
        
        // Wait a bit to show celebration screen
        setTimeout(() => {
            gameScreen.classList.add('hidden');
            celebrationScreen.classList.remove('hidden');
        }, 1000);
    }
    
    function createConfetti() {
        for (let i = 0; i < 100; i++) {
            // Delay creation of each confetti piece
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = `${5 + Math.random() * 10}px`;
                confetti.style.height = `${5 + Math.random() * 10}px`;
                confetti.style.backgroundColor = balloonColors[Math.floor(Math.random() * balloonColors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.top = '-20px';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.zIndex = '1000';
                
                // Create unique animation for each piece
                const fallDuration = 3 + Math.random() * 5;
                const swayIntensity = 50 + Math.random() * 100;
                const fallDistance = 100 + Math.random() * (window.innerHeight - 100);
                
                // Keyframes for confetti animation with more natural physics
                const keyframes = [
                    { // Start
                        transform: `translateY(0) translateX(0) rotate(0deg)`,
                        opacity: 1
                    },
                    { // Middle point with sway
                        transform: `translateY(${fallDistance * 0.5}px) translateX(${Math.random() > 0.5 ? swayIntensity : -swayIntensity}px) rotate(${Math.random() * 180}deg)`,
                        opacity: 0.8
                    },
                    { // End point
                        transform: `translateY(${fallDistance}px) translateX(${Math.random() > 0.5 ? swayIntensity/2 : -swayIntensity/2}px) rotate(${Math.random() * 360}deg)`,
                        opacity: 0
                    }
                ];
                
                // Animate with keyframes
                const animation = confetti.animate(keyframes, {
                    duration: fallDuration * 1000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)',
                    fill: 'forwards'
                });
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                animation.onfinish = () => {
                    confetti.remove();
                };
            }, i * 50); // Stagger confetti creation
        }
    }
    
    function activatePowerup(powerupElement, powerupType) {
        if (!gameRunning || isPaused) return;
        
        // Remove powerup element
        powerupElement.remove();
        
        // Show feedback
        showPowerupNotification(powerupType);
        
        // Apply powerup effect
        switch (powerupType.type) {
            case 'slowTime':
                // Slow down all balloons
                const balloons = document.querySelectorAll('.balloon');
                balloons.forEach(balloon => {
                    const animations = balloon.getAnimations();
                    animations.forEach(animation => {
                        animation.playbackRate = 0.5;
                    });
                });
                
                // Set timeout to reset speed
                setTimeout(() => {
                    const currentBalloons = document.querySelectorAll('.balloon');
                    currentBalloons.forEach(balloon => {
                        const animations = balloon.getAnimations();
                        animations.forEach(animation => {
                            animation.playbackRate = 1;
                        });
                    });
                }, powerupType.duration * 1000);
                break;
                
            case 'doublePoints':
                // Double all points
                activeMultiplier = 2;
                
                // Reset after duration
                setTimeout(() => {
                    activeMultiplier = 1;
                    showMessage("Çift puan sona erdi!");
                }, powerupType.duration * 1000);
                break;
                
            case 'popAll':
                // Pop all visible balloons
                const visibleBalloons = document.querySelectorAll('.balloon');
                let delay = 0;
                visibleBalloons.forEach(balloon => {
                    setTimeout(() => {
                        // Trigger an artificial click
                        const event = new Event('click', { bubbles: true });
                        balloon.dispatchEvent(event);
                    }, delay);
                    delay += 100; // Staggered effect
                });
                break;
        }
    }
    
    function showPowerupNotification(powerupType) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let message = '';
        switch (powerupType.type) {
            case 'slowTime':
                message = 'Yavaş Zaman! Balonlar yavaşladı';
                break;
            case 'doublePoints':
                message = 'Çift Puan! Puanlar 2 katına çıktı';
                break;
            case 'popAll':
                message = 'Büyük Patlama! Tüm balonlar patladı';
                break;
        }
        
        notification.innerHTML = `
            <div class="notification-icon">${powerupType.icon}</div>
            <div class="notification-text">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate and remove
        setTimeout(() => {
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 500);
            }, 2500);
        }, 10);
    }
    
    function showMessage(message, duration = 2000) {
        const messageEl = document.createElement('div');
        messageEl.className = 'game-message';
        messageEl.textContent = message;
        
        gameScreen.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.classList.add('show');
            
            setTimeout(() => {
                messageEl.classList.remove('show');
                setTimeout(() => messageEl.remove(), 500);
            }, duration);
        }, 10);
    }
    
    // Touch events optimization for mobile
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.balloon')) {
            e.preventDefault(); // Prevent default touch behavior
        }
    }, { passive: false });
}); 