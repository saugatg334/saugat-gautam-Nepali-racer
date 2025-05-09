class NepalRacer {
    constructor() {
        this.gameState = {
            fuel: 100,
            coins: 0,
            distance: 0,
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
            vehicleSelect: document.getElementById('vehicle-select'),
            stageSelect: document.getElementById('stage-select'),
            startBtn: document.getElementById('start-btn'),
            brakeBtn: document.getElementById('brake-btn'),
            accelerateBtn: document.getElementById('accelerate-btn'),
            retryBtn: document.getElementById('retry-btn'),
            menuBtn: document.getElementById('menu-btn')
        };

        this.physics = {
            velocity: 0,
            acceleration: 0,
            maxSpeed: 10,
            friction: 0.98
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
        this.gameState.isRunning = true;
        this.gameState.currentVehicle = this.elements.vehicleSelect.value;
        this.gameState.currentStage = this.elements.stageSelect.value;

        this.showScreen('game');
        this.gameLoop();
    }

    accelerate() {
        this.physics.acceleration = 0.5;
    }

    stopAccelerate() {
        this.physics.acceleration = 0;
    }

    brake() {
        this.physics.acceleration = -0.3;
    }

    stopBrake() {
        this.physics.acceleration = 0;
    }

    updatePhysics() {
        this.physics.velocity += this.physics.acceleration;
        this.physics.velocity *= this.physics.friction;

        if (this.physics.velocity > this.physics.maxSpeed) {
            this.physics.velocity = this.physics.maxSpeed;
        }

        if (this.physics.velocity < -this.physics.maxSpeed / 2) {
            this.physics.velocity = -this.physics.maxSpeed / 2;
        }

        this.gameState.distance += Math.max(0, this.physics.velocity);
        this.gameState.fuel -= Math.abs(this.physics.velocity) * 0.1;

        if (this.gameState.fuel <= 0) {
            this.gameOver();
        }
    }

    updateUI() {
        this.elements.fuelValue.textContent = Math.round(this.gameState.fuel);
        this.elements.coinValue.textContent = this.gameState.coins;
        this.elements.distanceValue.textContent = Math.round(this.gameState.distance);

        // Update player position based on velocity
        const currentLeft = parseInt(window.getComputedStyle(this.elements.player).left);
        this.elements.player.style.left = `${currentLeft + this.physics.velocity}px`;
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
            Coins: ${this.gameState.coins}
        `;
        this.showScreen('gameOver');
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const game = new NepalRacer();
});