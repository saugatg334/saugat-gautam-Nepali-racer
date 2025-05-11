class NepalRacer {
    constructor() {
        this.gameState = {
            fuel: 100,
            coins: 0,
            diamonds: 0,
            distance: 0,
            speed: 0,
            isRunning: false,
            currentVehicle: null,
            currentStage: null,
            level: 1,
            score: 0
        };

        this.screens = {
            loading: document.getElementById('loading-screen'),
            menu: document.getElementById('main-menu'),
            game: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over')
        };

        this.elements = {
            player: document.getElementById('player'),
            fuelValue: document.getElementById('fuel-value'),
            coinValue: document.getElementById('coin-value'),
            diamondValue: document.getElementById('diamond-value'),
            distanceValue: document.getElementById('distance-value'),
            speedValue: document.getElementById('speed-value'),
            scoreValue: document.getElementById('score-value'),
            levelValue: document.getElementById('level-value'),
            vehicleSelect: document.getElementById('vehicle-select'),
            stageSelect: document.getElementById('stage-select'),
            startBtn: document.getElementById('start-btn'),
            brakeBtn: document.getElementById('brake-btn'),
            accelerateBtn: document.getElementById('accelerate-btn'),
            retryBtn: document.getElementById('retry-btn'),
            menuBtn: document.getElementById('menu-btn'),
            terrain: document.getElementById('terrain'),
            background: document.getElementById('background'),
            loadingProgress: document.querySelector('.loading-progress'),
            obstacles: document.getElementById('obstacles'),
            collectibles: document.getElementById('collectibles'),
            vehiclePreview: document.getElementById('vehicle-preview'),
            stagePreview: document.getElementById('stage-preview')
        };

        this.vehicles = {
            'tata-sumo': { maxSpeed: 12, acceleration: 0.4, handling: 0.8, fuelEfficiency: 0.9, color: '#2ecc71', level: 1 },
            'mahindra-bolero': { maxSpeed: 13, acceleration: 0.45, handling: 0.85, fuelEfficiency: 0.85, color: '#3498db', level: 1 },
            'royal-enfield': { maxSpeed: 15, acceleration: 0.5, handling: 0.9, fuelEfficiency: 0.7, color: '#e74c3c', level: 2 },
            'tempo': { maxSpeed: 8, acceleration: 0.3, handling: 0.7, fuelEfficiency: 1.2, color: '#f1c40f', level: 1 },
            'sajha-bus': { maxSpeed: 10, acceleration: 0.35, handling: 0.6, fuelEfficiency: 0.8, color: '#27ae60', level: 2 },
            'tuk-tuk': { maxSpeed: 9, acceleration: 0.35, handling: 0.75, fuelEfficiency: 1.5, color: '#9b59b6', level: 1 },
            'hotrod': { maxSpeed: 20, acceleration: 0.6, handling: 0.95, fuelEfficiency: 0.5, color: '#e67e22', level: 3 },
            'mountain-bike': { maxSpeed: 7, acceleration: 0.25, handling: 1, fuelEfficiency: 2, color: '#34495e', level: 1 },
            'mustang': { maxSpeed: 25, acceleration: 0.7, handling: 0.9, fuelEfficiency: 0.4, color: '#c0392b', level: 4 },
            'super-bike': { maxSpeed: 30, acceleration: 0.8, handling: 0.95, fuelEfficiency: 0.3, color: '#d35400', level: 5 }
        };

        this.stages = {
            'east-west': {
                gravity: 1,
                friction: 0.98,
                background: '#87CEEB',
                terrain: '#27ae60',
                difficulty: 1,
                levels: Array(100).fill().map((_, i) => ({
                    levelNumber: i + 1,
                    diamondBonus: i + 10,
                    unlockCharacter: i === 0,
                    unlockVehicle: i === 0,
                    unlockStage: i === 0
                }))
            }
        };

        this.collectibles = {
            coin: { value: 1, color: '#f1c40f', radius: 10 },
            diamond: { value: 10, color: '#3498db', radius: 8 }
        };

        this.gameState = {
            ...this.gameState,
            currentLevel: 1,
            unlockedCharacters: [],
            unlockedVehicles: [],
            unlockedStages: [],
            coins: 0,
            diamonds: 0
        };

        this.physics = {
            velocity: 0,
            acceleration: 0,
            maxSpeed: 10,
            friction: 0.98,
            gravity: 1
        };

        this.init();
    }

    completeLevel() {
        const currentStage = this.stages[this.gameState.currentStage];
        const currentLevel = currentStage.levels[this.gameState.currentLevel - 1];

        this.gameState.diamonds += currentLevel.diamondBonus;

        if (currentLevel.unlockCharacter) this.gameState.unlockedCharacters.push('Character_' + this.gameState.currentLevel);
        if (currentLevel.unlockVehicle) this.gameState.unlockedVehicles.push(this.gameState.currentVehicle);
        if (currentLevel.unlockStage) this.gameState.unlockedStages.push(this.gameState.currentStage);

        if (this.gameState.currentLevel < currentStage.levels.length) {
            this.gameState.currentLevel++;
        } else {
            this.gameOver();
        }

        this.updateUI();
    }

    purchaseItem(itemType, itemName) {
        const prices = {
            vehicle: 100,
            stage: 200
        };

        if (this.gameState.coins >= prices[itemType]) {
            this.gameState.coins -= prices[itemType];
            
            if (itemType === 'vehicle') {
                this.gameState.unlockedVehicles.push(itemName);
            } else if (itemType === 'stage') {
                this.gameState.unlockedStages.push(itemName);
            }

            this.updateUI();
            alert(`${itemName} purchased successfully!`);
        } else {
            alert('Not enough coins to purchase this item.');
        }
    }

    useDiamondBoost() {
        if (this.gameState.diamonds > 0) {
            this.physics.maxSpeed += 2;
            this.gameState.diamonds--;
            this.updateUI();
            alert('Boost activated!');
        } else {
            alert('Not enough diamonds for a boost.');
        }
    }

    init() {
        this.updatePreviewImages();
        
        this.elements.vehicleSelect.addEventListener('change', () => this.updatePreviewImages());
        this.elements.stageSelect.addEventListener('change', () => this.updatePreviewImages());

        this.elements.loadingProgress.style.width = '100%';
        setTimeout(() => {
            this.screens.loading.style.display = 'none';
            this.showScreen('menu');
        }, 3000);

        this.bindEvents();
    }

    updatePreviewImages() {
        const selectedVehicle = this.elements.vehicleSelect.selectedOptions[0];
        const selectedStage = this.elements.stageSelect.selectedOptions[0];
        
        if (selectedVehicle.dataset.image) {
            this.elements.vehiclePreview.src = selectedVehicle.dataset.image;
        }
        
        if (selectedStage.dataset.image) {
            this.elements.stagePreview.src = selectedStage.dataset.image;
        }
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.retryBtn.addEventListener('click', () => this.startGame());
        this.elements.menuBtn.addEventListener('click', () => this.showScreen('menu'));

        this.elements.accelerateBtn.addEventListener('mousedown', () => this.accelerate());
        this.elements.accelerateBtn.addEventListener('touchstart', () => this.accelerate());
        this.elements.accelerateBtn.addEventListener('mouseup', () => this.stopAccelerate());
        this.elements.accelerateBtn.addEventListener('touchend', () => this.stopAccelerate());

        this.elements.brakeBtn.addEventListener('mousedown', () => this.brake());
        this.elements.brakeBtn.addEventListener('touchstart', () => this.brake());
        this.elements.brakeBtn.addEventListener('mouseup', () => this.stopBrake());
        this.elements.brakeBtn.addEventListener('touchend', () => this.stopBrake());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.accelerate();
            if (e.key === 'ArrowLeft') this.brake();
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight') this.stopAccelerate();
            if (e.key === 'ArrowLeft') this.stopBrake();
        });
    }

    spawnCollectible() {
        const type = Math.random() < 0.8 ? 'coin' : 'diamond';
        const collectible = document.createElement('div');
        collectible.className = `collectible ${type}`;
        collectible.style.left = '800px';
        collectible.style.top = `${Math.random() * 300 + 100}px`;
        this.elements.collectibles.appendChild(collectible);

        const moveCollectible = () => {
            const left = parseFloat(collectible.style.left);
            if (left < -50) {
                collectible.remove();
            } else {
                collectible.style.left = `${left - this.physics.velocity * 2}px`;
                this.checkCollision(collectible, type);
                if (this.gameState.isRunning) {
                    requestAnimationFrame(moveCollectible);
                }
            }
        };

        requestAnimationFrame(moveCollectible);
    }

    checkCollision(collectible, type) {
        const playerRect = this.elements.player.getBoundingClientRect();
        const collectibleRect = collectible.getBoundingClientRect();

        if (!(playerRect.right < collectibleRect.left || 
              playerRect.left > collectibleRect.right || 
              playerRect.bottom < collectibleRect.top || 
              playerRect.top > collectibleRect.bottom)) {
            if (type === 'coin') {
                this.gameState.coins++;
                this.gameState.score += 100;
            } else {
                this.gameState.diamonds++;
                this.gameState.score += 1000;
            }
            collectible.remove();
            this.updateUI();
        }
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    startGame() {
        this.gameState.fuel = 100;
        this.gameState.coins = 0;
        this.gameState.diamonds = 0;
        this.gameState.distance = 0;
        this.gameState.speed = 0;
        this.gameState.score = 0;
        this.gameState.isRunning = true;
        this.gameState.currentVehicle = this.elements.vehicleSelect.value;
        this.gameState.currentStage = this.elements.stageSelect.value;

        const vehicle = this.vehicles[this.gameState.currentVehicle];
        this.physics.maxSpeed = vehicle.maxSpeed;
        this.elements.player.style.backgroundColor = vehicle.color;

        const stage = this.stages[this.gameState.currentStage];
        this.physics.friction = stage.friction;
        this.physics.gravity = stage.gravity;
        this.elements.background.style.backgroundColor = stage.background;
        this.elements.terrain.style.backgroundColor = stage.terrain;

        this.physics.velocity = 0;
        this.physics.acceleration = 0;

        this.elements.collectibles.innerHTML = '';

        this.showScreen('game');
        this.gameLoop();
        this.spawnCollectibles();
    }

    spawnCollectibles() {
        if (this.gameState.isRunning) {
            this.spawnCollectible();
            setTimeout(() => this.spawnCollectibles(), Math.random() * 2000 + 1000);
        }
    }

    accelerate() {
        const vehicle = this.vehicles[this.gameState.currentVehicle];
        this.physics.acceleration = vehicle.acceleration;
    }

    stopAccelerate() {
        this.physics.acceleration = 0;
    }

    brake() {
        const vehicle = this.vehicles[this.gameState.currentVehicle];
        this.physics.acceleration = -vehicle.acceleration * 0.6;
    }

    stopBrake() {
        this.physics.acceleration = 0;
    }

    updatePhysics() {
        const vehicle = this.vehicles[this.gameState.currentVehicle];
        const stage = this.stages[this.gameState.currentStage];

        this.physics.velocity += this.physics.acceleration * this.physics.gravity;
        this.physics.velocity *= this.physics.friction;

        if (this.physics.velocity > this.physics.maxSpeed) {
            this.physics.velocity = this.physics.maxSpeed;
        }

        if (this.physics.velocity < -this.physics.maxSpeed / 2) {
            this.physics.velocity = -this.physics.maxSpeed / 2;
        }

        this.gameState.distance += Math.max(0, this.physics.velocity);
        this.gameState.speed = Math.abs(this.physics.velocity) * 10;
        this.gameState.fuel -= (Math.abs(this.physics.velocity) * 0.1) / vehicle.fuelEfficiency;

        if (this.gameState.fuel <= 0) {
            this.gameOver();
        }

        const scrollSpeed = this.physics.velocity * 2;
        const currentTerrainPos = parseFloat(this.elements.terrain.style.left || 0);
        const currentBackgroundPos = parseFloat(this.elements.background.style.left || 0);

        this.elements.terrain.style.left = `${(currentTerrainPos - scrollSpeed) % -800}px`;
        this.elements.background.style.left = `${(currentBackgroundPos - scrollSpeed * 0.5) % -800}px`;
    }

    updateUI() {
        this.elements.fuelValue.textContent = Math.round(this.gameState.fuel);
        this.elements.coinValue.textContent = this.gameState.coins;
        this.elements.diamondValue.textContent = this.gameState.diamonds;
        this.elements.distanceValue.textContent = Math.round(this.gameState.distance);
        this.elements.speedValue.textContent = Math.round(this.gameState.speed);
        this.elements.scoreValue.textContent = this.gameState.score;
        this.elements.levelValue.textContent = this.stages[this.gameState.currentStage].difficulty;

        const tiltAngle = this.physics.acceleration * 5;
        this.elements.player.style.transform = `rotate(${tiltAngle}deg)`;
    }

    gameLoop() {
        if (!this.gameState.isRunning) return;

        this.updatePhysics();
        this.updateUI();

        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver() {
        this.gameState.isRunning = false;
        const finalStats = document.getElementById('final-stats');
        finalStats.innerHTML = `
            Distance: ${Math.round(this.gameState.distance)}m<br>
            Top Speed: ${Math.round(this.gameState.speed)} km/h<br>
            Coins: ${this.gameState.coins}<br>
            Diamonds: ${this.gameState.diamonds}<br>
            Score: ${this.gameState.score}
        `;
        this.showScreen('gameOver');
    }
}

updatePreviewImages() {
    const selectedVehicle = this.elements.vehicleSelect.selectedOptions[0];
    const selectedStage = this.elements.stageSelect.selectedOptions[0];

    // Vehicle preview
    if (selectedVehicle && selectedVehicle.dataset.image) {
        this.elements.vehiclePreview.src = selectedVehicle.dataset.image;
        this.elements.vehiclePreview.alt = selectedVehicle.value;
    } else {
        this.elements.vehiclePreview.src = '';
        this.elements.vehiclePreview.alt = 'No vehicle selected';
    }

    // Stage preview
    if (selectedStage && selectedStage.dataset.image) {
        this.elements.stagePreview.src = selectedStage.dataset.image;
        this.elements.stagePreview.alt = selectedStage.value;
    } else {
        this.elements.stagePreview.src = '';
        this.elements.stagePreview.alt = 'No stage selected';
    }
}
window.addEventListener('load', () => {
    const game = new NepalRacer();
});
