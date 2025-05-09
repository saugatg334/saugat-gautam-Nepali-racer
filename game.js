class NepalRacer {
    constructor() {
        this.gameState = {
            fuel: 100,
            coins: 0,
            distance: 0,
            speed: 0,
            isRunning: false,
            currentVehicle: null,
            currentStage: null
        };

        this.screens = {
            menu: document.getElementById('main-menu'),
            game: document.getElementById('game-screen'),
            gameOver: document.getElementById('game-over')
        };

        this.elements = {
            player: document.getElementById('player'),
            fuelValue: document.getElementById('fuel-value'),
            coinValue: document.getElementById('coin-value'),
            distanceValue: document.getElementById('distance-value'),
            speedValue: document.getElementById('speed-value'),
            vehicleSelect: document.getElementById('vehicle-select'),
            stageSelect: document.getElementById('stage-select'),
            startBtn: document.getElementById('start-btn'),
            brakeBtn: document.getElementById('brake-btn'),
            accelerateBtn: document.getElementById('accelerate-btn'),
            retryBtn: document.getElementById('retry-btn'),
            menuBtn: document.getElementById('menu-btn'),
            terrain: document.getElementById('terrain'),
            background: document.getElementById('background')
        };

        this.vehicles = {
            'tata-sumo': { maxSpeed: 12, acceleration: 0.4, handling: 0.8, fuelEfficiency: 0.9, color: '#2ecc71' },
            'mahindra-bolero': { maxSpeed: 13, acceleration: 0.45, handling: 0.85, fuelEfficiency: 0.85, color: '#3498db' },
            'royal-enfield': { maxSpeed: 15, acceleration: 0.5, handling: 0.9, fuelEfficiency: 0.7, color: '#e74c3c' },
            'tempo': { maxSpeed: 8, acceleration: 0.3, handling: 0.7, fuelEfficiency: 1.2, color: '#f1c40f' },
            'sajha-bus': { maxSpeed: 10, acceleration: 0.35, handling: 0.6, fuelEfficiency: 0.8, color: '#27ae60' },
            'tuk-tuk': { maxSpeed: 9, acceleration: 0.35, handling: 0.75, fuelEfficiency: 1.5, color: '#9b59b6' },
            'hotrod': { maxSpeed: 20, acceleration: 0.6, handling: 0.95, fuelEfficiency: 0.5, color: '#e67e22' },
            'mountain-bike': { maxSpeed: 7, acceleration: 0.25, handling: 1, fuelEfficiency: 2, color: '#34495e' }
        };

        this.stages = {
            'east-west': { gravity: 1, friction: 0.98, background: '#87CEEB', terrain: '#27ae60' },
            'araniko': { gravity: 1.1, friction: 0.96, background: '#B0C4DE', terrain: '#95a5a6' },
            'bp': { gravity: 1, friction: 0.97, background: '#87CEEB', terrain: '#8e44ad' },
            'prithvi': { gravity: 1.05, friction: 0.97, background: '#87CEEB', terrain: '#16a085' },
            'nijgadh': { gravity: 1, friction: 0.99, background: '#87CEEB', terrain: '#2c3e50' },
            'moon': { gravity: 0.16, friction: 0.995, background: '#2c3e50', terrain: '#7f8c8d' }
        };

        this.physics = {
            velocity: 0,
            acceleration: 0,
            maxSpeed: 10,
            friction: 0.98,
            gravity: 1
        };

        this.bindEvents();
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.retryBtn.addEventListener('click', () => this.startGame());
        this.elements.menuBtn.addEventListener('click', () => this.showScreen('menu'));

        // Mobile and desktop controls
        this.elements.accelerateBtn.addEventListener('mousedown', () => this.accelerate());
        this.elements.accelerateBtn.addEventListener('touchstart', () => this.accelerate());
        this.elements.accelerateBtn.addEventListener('mouseup', () => this.stopAccelerate());
        this.elements.accelerateBtn.addEventListener('touchend', () => this.stopAccelerate());

        this.elements.brakeBtn.addEventListener('mousedown', () => this.brake());
        this.elements.brakeBtn.addEventListener('touchstart', () => this.brake());
        this.elements.brakeBtn.addEventListener('mouseup', () => this.stopBrake());
        this.elements.brakeBtn.addEventListener('touchend', () => this.stopBrake());

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.accelerate();
            if (e.key === 'ArrowLeft') this.brake();
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowRight') this.stopAccelerate();
            if (e.key === 'ArrowLeft') this.stopBrake();
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    startGame() {
        this.gameState.fuel = 100;
        this.gameState.coins = 0;
        this.gameState.distance = 0;
        this.gameState.speed = 0;
        this.gameState.isRunning = true;
        this.gameState.currentVehicle = this.elements.vehicleSelect.value;
        this.gameState.currentStage = this.elements.stageSelect.value;

        // Apply vehicle properties
        const vehicle = this.vehicles[this.gameState.currentVehicle];
        this.physics.maxSpeed = vehicle.maxSpeed;
        this.elements.player.style.backgroundColor = vehicle.color;

        // Apply stage properties
        const stage = this.stages[this.gameState.currentStage];
        this.physics.friction = stage.friction;
        this.physics.gravity = stage.gravity;
        this.elements.background.style.backgroundColor = stage.background;
        this.elements.terrain.style.backgroundColor = stage.terrain;

        // Reset physics
        this.physics.velocity = 0;
        this.physics.acceleration = 0;

        this.showScreen('game');
        this.gameLoop();
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

        // Scroll background and terrain
        const scrollSpeed = this.physics.velocity * 2;
        const currentTerrainPos = parseFloat(this.elements.terrain.style.left || 0);
        const currentBackgroundPos = parseFloat(this.elements.background.style.left || 0);

        this.elements.terrain.style.left = `${(currentTerrainPos - scrollSpeed) % -800}px`;
        this.elements.background.style.left = `${(currentBackgroundPos - scrollSpeed * 0.5) % -800}px`;
    }

    updateUI() {
        this.elements.fuelValue.textContent = Math.round(this.gameState.fuel);
        this.elements.coinValue.textContent = this.gameState.coins;
        this.elements.distanceValue.textContent = Math.round(this.gameState.distance);
        this.elements.speedValue.textContent = Math.round(this.gameState.speed);

        // Tilt the vehicle based on acceleration
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
            Coins: ${this.gameState.coins}
        `;
        this.showScreen('gameOver');
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new NepalRacer();
});