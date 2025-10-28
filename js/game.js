class MemoryGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MemoryGame' });
        // Juego
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.clicks = 0;
        this.canClick = false;
        this.timeRemaining = 60;
        this.gameEnded = false;
        this.currentLevel = 1;

        // Jugador / UI
        this.playerName = null;
        this.playerCharacter = 0; // índice 1-5
        this.playerReady = false;

        // Leaderboard
        this.leaderboardKey = 'rincones_leaderboard';
    }

    init(data) {
        if (data.level) {
            this.currentLevel = data.level;
            this.score = data.score || 0;
        }

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.clicks = 0;
        this.canClick = false;

        // tiempos por nivel (ajustable)
        this.timeRemaining = this.currentLevel === 4 ? 120 : 60;
        this.gameEnded = false;
    }

    preload() {
        // --- FONDOS por nivel ---
        this.load.image('bg1', 'assets/images/palenque.png');
        this.load.image('bg2', 'assets/images/tequila.png');
        this.load.image('bg3', 'assets/images/sancris.png');
        this.load.image('bg4', 'assets/images/taxco.png');
        this.load.image('bg5', 'assets/images/patzcuaro.png');
        this.load.image('bg6', 'assets/images/palenque.png'); // reutilizar
        this.load.image('bg7', 'assets/images/tequila.png'); // reutilizar
        this.load.image('bg8', 'assets/images/sancris.png'); // reutilizar

        // --- cartas / imágenes---
        for (let i = 1; i <= 5; i++) {
            this.load.image(`card${i}p1`, `assets/images/card${i}p1.jpg`);
            this.load.image(`card${i}p2`, `assets/images/card${i}p2.jpg`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`b${i}a`, `assets/images/b${i}a.png`);
            this.load.image(`b${i}b`, `assets/images/b${i}b.png`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`pre${i}`, `assets/images/pre${i}.png`);
            this.load.image(`re${i}`, `assets/images/re${i}.png`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`es${i}`, `assets/images/es${i}.png`);
            this.load.image(`lu${i}`, `assets/images/lu${i}.png`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`fot${i}`, `assets/images/fot${i}.png`);
            this.load.image(`lug${i}`, `assets/images/lug${i}.png`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`nom${i}`, `assets/images/nom${i}.png`);
            this.load.image(`dul${i}`, `assets/images/dul${i}.png`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`fie${i}`, `assets/images/fie${i}.png`);
            this.load.image(`sta${i}`, `assets/images/sta${i}.png`);
        }
        for (let i = 1; i <= 5; i++) {
            this.load.image(`ves${i}`, `assets/images/ves${i}.png`);
            this.load.image(`ti${i}`, `assets/images/ti${i}.png`);
        }

        this.load.image('cardBack', 'assets/images/cardBack.png');

        // --- VIDEOS DE PERSONAJES 
        
        for (let i = 1; i <= 5; i++) {
            this.load.video(`char${i}`, `assets/images/char${i}.mp4`, 'loadeddata', false, true);
        }
    }

    create() {
        // Fondo dinámico según nivel
        const bgKey = `bg${this.currentLevel}`;
        const bgImage = this.add.image(700, 400, bgKey);
        bgImage.setDisplaySize(1400, 800);
        
        const graphics = this.add.graphics();
        graphics.fillStyle(0xb97438, 0.25);
        graphics.fillRect(0, 0, 1400, 100);
        graphics.fillRect(0, 700, 1400, 100);

        // Título
        this.titleShadow = this.add.text(702, 32, `RINCONES CON MAGIA - NIVEL ${this.currentLevel}`, {
            fontFamily: 'Lobster',
            fontSize: this.currentLevel === 3 ? '48px' : '50px',
            color: '#3b1f10'
        }).setOrigin(0.5).setAlpha(0.4);

        this.add.text(700, 30, `RINCONES CON MAGIA - NIVEL ${this.currentLevel}`, {
            fontFamily: 'Lobster',
            fontSize: this.currentLevel === 3 ? '48px' : '50px',
            color: '#6a2f2f',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        const statsBg = this.add.rectangle(700, 85, 1300, 60, 0xb97438, 0.85);
        statsBg.setStrokeStyle(3, 0x3b1f10, 0.9);

        // Score / Clicks / Tiempo
        this.scoreText = this.add.text(100, 85, `⭐ Puntos: ${this.score}`, {
            fontFamily: 'Cormorant Garamond',
            fontSize: '24px',
            color: '#3b1f10',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0, 0.5);

        this.clicksText = this.add.text(700, 85, '🖱️ Clicks: 0', {
            fontFamily: 'Cormorant Garamond',
            fontSize: '24px',
            color: '#6a2f2f',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setOrigin(0.5);

        const initialTime = this.currentLevel === 4 ? '2:00' : '1:00';
        this.timeText = this.add.text(1300, 85, `⏱️ Tiempo: ${initialTime}`, {
            fontFamily: 'Cormorant Garamond',
            fontSize: '24px',
            color: '#e3a857',
            stroke: '#3b1f10',
            strokeThickness: 2
        }).setOrigin(1, 0.5);

        // Sonidos
        this.createSounds();

        // Temporizador (pausado hasta que empiece el juego real)
        this.timeEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTime,
            callbackScope: this,
            loop: true,
            paused: true
        });

        // Si aún no está listo el jugador mostramos la pantalla inicial de registro/selección
        if (!this.playerReady) {
            this.showPlayerSetup();
            return; // Esperamos que el jugador inicie
        }

        // Si jugador ya listo, creamos tablero
        this.createBoard();
        this.showInitialAlert(); // Mensaje de inicio por nivel
    }

    // ---------------------------
    // Pantalla inicial con nombre y selección de video-personaje
    // ---------------------------
    showPlayerSetup() {
        // Crear overlay DOM sobre el canvas
        const parent = document.getElementById('game-container');
        const existing = document.getElementById('player-setup-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'player-setup-overlay';
        overlay.style.position = 'absolute';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(0,0,0,0.7)';
        overlay.style.zIndex = '9999';
        overlay.style.padding = '20px';
        overlay.innerHTML = `
            <div style="width:900px; max-width:95%; background:#f6e0b3; border:4px solid #667eea; border-radius:12px; padding:20px; text-align:center;">
                <h2 style="margin:6px 0 12px; font-family: Lobster; font-size:28px; color:#6a2f2f;">Bienvenido a Rincones con Magia</h2>
                <p style="margin:0 0 12px; color:#3b1f10;">Escribe tu nombre y elige tu personaje.</p>
                <input id="player-name-input" placeholder="Tu nombre..." style="width:60%; padding:10px; font-size:16px; border-radius:6px; border:2px solid #d6b58a;" />
                <div style="margin-top:12px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;" id="character-choices">
                </div>
                <div style="margin-top:16px;">
                    <button id="start-game-btn" style="padding:10px 18px; font-size:16px; border-radius:8px; background:#48bb78; color:white; border:none; cursor:pointer;">COMENZAR</button>
                </div>
            </div>
        `;

        // Generar 5 videos en miniatura para elegir
        const choicesContainer = overlay.querySelector('#character-choices');
        
        // Nombres de los personajes
        const nombresPersonajes = ['La Llorona', 'Duende Maya', 'Don José', 'Don Cenobio', 'El Nahual'];

        for (let i = 1; i <= 5; i++) {
            const wrap = document.createElement('div');
            wrap.style.display = 'flex';
            wrap.style.flexDirection = 'column';
            wrap.style.alignItems = 'center';

            const vid = document.createElement('video');
            vid.src = `assets/images/char${i}.mp4`;
            vid.width = 140;
            vid.height = 90;
            vid.muted = true;
            vid.loop = true;
            vid.autoplay = true;
            vid.style.border = '3px solid transparent';
            vid.style.borderRadius = '8px';
            vid.style.cursor = 'pointer';
            vid.setAttribute('data-char', i.toString());

            const label = document.createElement('div');
            label.style.fontSize = '12px';
            label.style.marginTop = '6px';
            label.style.fontWeight = 'bold';
            label.style.color = '#3b1f10';
            label.textContent = nombresPersonajes[i-1];

            wrap.appendChild(vid);
            wrap.appendChild(label);
            choicesContainer.appendChild(wrap);

            // click sobre video -> seleccionar
            vid.addEventListener('click', () => {
                // marcar visualmente
                document.querySelectorAll('#character-choices video').forEach(v => {
                    v.style.border = '3px solid transparent';
                });
                vid.style.border = '3px solid #ffd700';
                // guardar índice
                this.playerCharacter = i;
            });
        }

        parent.appendChild(overlay);

        // Botón Start
        const startBtn = document.getElementById('start-game-btn');
        startBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('player-name-input');
            const name = (nameInput.value || '').trim();
            if (!name) {
                alert('Por favor escribe un nombre de jugador.');
                return;
            }
            if (!this.playerCharacter || this.playerCharacter < 1) {
                alert('Selecciona un personaje (video).');
                return;
            }
            // Guardar y cerrar overlay
            this.playerName = name;
            this.playerReady = true;
            const el = document.getElementById('player-setup-overlay');
            if (el) el.remove();

            // Iniciamos el juego por primera vez
            this.createBoard();
            this.showInitialAlert();
        });
    }

    // ---------------------------
    // Panel inicial por nivel
    // ---------------------------
    showInitialAlert() {
        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.85);
        overlay.setDepth(1000);

        const alertPanel = this.add.rectangle(700, 400, 450, 320, 0xf6e0b3, 1);
        alertPanel.setStrokeStyle(5, 0x667eea);
        alertPanel.setDepth(1001);

        const levelIcons = ['🎮', '🚀', '⭐', '🏆', '🎉', '🎭', '🌮', '🎆'];
        const icon = this.add.text(700, 300, levelIcons[(this.currentLevel - 1) % levelIcons.length], {
            fontSize: '60px'
        }).setOrigin(0.5).setDepth(1002);

        const titleText = (this.currentLevel < 5) ? `¡NIVEL ${this.currentLevel}!` : `¡NIVEL ${this.currentLevel}!`;
        const alertTitle = this.add.text(700, 380, titleText, {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ff7d5d',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1002);

        const messageTime = (this.currentLevel === 4) ? '2:00 minutos' : '1:00 minuto';
        const alertMessage = this.add.text(700, 440, `Encuentra los pares\n⏱️ Tienes ${messageTime} ⏱️`, {
            fontSize: '20px',
            color: '#da8a34',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(1002);

        const okButton = this.add.rectangle(700, 520, 180, 55, 0xa02f41);
        okButton.setStrokeStyle(3, 0xffd700);
        okButton.setInteractive();
        okButton.setDepth(1002);

        const okText = this.add.text(700, 520, '¡COMENZAR!', {
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1003);

        this.tweens.add({
            targets: [overlay, alertPanel, icon, alertTitle, alertMessage, okButton, okText],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.8, to: 1 },
            duration: 400,
            ease: 'Back.easeOut'
        });

        okButton.on('pointerover', () => {
            okButton.setFillStyle(0x764ba2);
            this.tweens.add({
                targets: [okButton, okText],
                scale: 1.1,
                duration: 150
            });
        });
        okButton.on('pointerout', () => {
            okButton.setFillStyle(0x667eea);
            this.tweens.add({
                targets: [okButton, okText],
                scale: 1,
                duration: 150
            });
        });

        okButton.on('pointerdown', async () => {
            await activarPantallaCompleta();
            this.playSound(523, 0.15);

            this.tweens.add({
                targets: [overlay, alertPanel, icon, alertTitle, alertMessage, okButton, okText],
                alpha: 0,
                scale: 0.8,
                duration: 300,
                onComplete: () => {
                    overlay.destroy();
                    alertPanel.destroy();
                    icon.destroy();
                    alertTitle.destroy();
                    alertMessage.destroy();
                    okButton.destroy();
                    okText.destroy();

                    // INICIAR JUEGO
                    this.canClick = true;
                    this.timeEvent.paused = false;
                }
            });
        });
    }

    createSounds() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSound(frequency, duration = 0.1, type = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // ---------------------------
    // CREACIÓN DE TABLERO
    // ---------------------------
    createBoard() {
        let cardTypes, shuffled;

        if (this.currentLevel === 1) {
            cardTypes = [1, 2, 3, 4, 5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1: 1, 2: 1, 3: 1, 4: 1, 5: 1};
            this.cardColor = 0x2d3748; this.cardBorderColor = 0x4a5568;
        } else if (this.currentLevel === 2) {
            cardTypes = ['b1', 'b2', 'b3', 'b4', 'b5'];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {b1: 0, b2: 0, b3: 0, b4: 0, b5: 0};
            this.cardColor = 0x2d3748; this.cardBorderColor = 0x4a5568;
        } else if (this.currentLevel === 3) {
            cardTypes = [1, 2, 3, 4, 5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
            this.cardColor = 0x2d3748; this.cardBorderColor = 0x4a5568;
        } else if (this.currentLevel === 4) {
            cardTypes = [1, 2, 3, 4, 5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1: 0, 2: 0, 3: 0, 4: 0, 5:0};
            this.cardColor = 0x2d3748; this.cardBorderColor = 0x4a5568;
        } else if (this.currentLevel === 5) {
            cardTypes = [1,2,3,4,5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1:0,2:0,3:0,4:0,5:0};
            this.cardColor = 0x234e52; this.cardBorderColor = 0x1f4a47;
        } else if (this.currentLevel === 6) {
            cardTypes = [1,2,3,4,5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1:0,2:0,3:0,4:0,5:0};
        } else if (this.currentLevel === 7) {
            cardTypes = [1,2,3,4,5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1:0,2:0,3:0,4:0,5:0};
        } else {
            // Nivel 8
            cardTypes = [1,2,3,4,5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            this.cardPairIndices = {1:0,2:0,3:0,4:0,5:0};
        }

        if (this.currentLevel === 4 || this.currentLevel === 8) {
            this.createLevel4(shuffled);
        } else {
            this.createNormalBoard(shuffled);
        }
    }

    createNormalBoard(shuffled) {
        const startX = 150;
        const startY = 220;
        const spacing = 250;
        const cardSize = 200;

        shuffled.forEach((type, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            const cardContainer = this.add.container(x, y);
            const shadow = this.add.rectangle(2, 2, cardSize, cardSize, 0x000000, 0.3);
            const cardBg = this.add.rectangle(0, 0, cardSize, cardSize, this.cardColor || 0x2d3748);
            cardBg.setStrokeStyle(3, this.cardBorderColor || 0x4a5568);

            const card = this.add.image(0, 0, 'cardBack');
            card.setDisplaySize(195, 195);

            cardContainer.add([shadow, cardBg, card]);
            cardContainer.setSize(cardSize, cardSize);
            cardContainer.setInteractive();

            cardContainer.cardType = type;

            if (this.currentLevel === 1) {
                cardContainer.cardVariant = `p${this.cardPairIndices[type]}`;
                this.cardPairIndices[type]++;
                cardContainer.imageKey = `card${type}${cardContainer.cardVariant}`;
            } else if (this.currentLevel === 2) {
                const variants = ['a', 'b'];
                cardContainer.cardVariant = variants[this.cardPairIndices[type]];
                this.cardPairIndices[type]++;
                cardContainer.imageKey = `${type}${cardContainer.cardVariant}`;
            } else if (this.currentLevel === 3) {
                const variants = ['pre', 're'];
                cardContainer.cardVariant = variants[this.cardPairIndices[type]];
                this.cardPairIndices[type]++;
                cardContainer.imageKey = `${cardContainer.cardVariant}${type}`;
            } else if (this.currentLevel === 5) {
                const variants = ['fot', 'lug'];
                cardContainer.cardVariant = variants[this.cardPairIndices[type]];
                this.cardPairIndices[type]++;
                cardContainer.imageKey = `${cardContainer.cardVariant}${type}`;
            } else if (this.currentLevel === 6) {
                const variants = ['nom', 'dul'];
                cardContainer.cardVariant = variants[this.cardPairIndices[type]];
                this.cardPairIndices[type]++;
                cardContainer.imageKey = `${cardContainer.cardVariant}${type}`;
            } else if (this.currentLevel === 7) {
                const variants = ['fie', 'sta'];
                cardContainer.cardVariant = variants[this.cardPairIndices[type]];
                this.cardPairIndices[type]++;
                cardContainer.imageKey = `${cardContainer.cardVariant}${type}`;
            } else {
                cardContainer.cardVariant = 'p1';
                cardContainer.imageKey = `card${type}p1`;
            }

            cardContainer.isFlipped = false;
            cardContainer.isMatched = false;
            cardContainer.cardImage = card;
            cardContainer.cardBg = cardBg;

            cardContainer.on('pointerdown', () => this.flipCard(cardContainer));

            cardContainer.on('pointerover', () => {
                if (!cardContainer.isMatched && !cardContainer.isFlipped && this.canClick) {
                    this.tweens.add({
                        targets: cardContainer,
                        scale: 1.08,
                        duration: 200,
                        ease: 'Back.easeOut'
                    });
                    cardBg.setStrokeStyle(3, 0xffd700);
                    cardBg.setFillStyle(0x3d4758);
                }
            });

            cardContainer.on('pointerout', () => {
                if (!cardContainer.isMatched && !cardContainer.isFlipped) {
                    this.tweens.add({
                        targets: cardContainer,
                        scale: 1,
                        duration: 200
                    });
                    cardBg.setStrokeStyle(3, 0x4a5568);
                    cardBg.setFillStyle(0x2d3748);
                }
            });

            this.cards.push(cardContainer);
        });
    }

    createLevel4(shuffled) {
        const startX = 150;
        const startY = 280;
        const spacingX = 250;
        const spacingY = 220;
        const cardSize = 200;

        const totalCards = shuffled.length;
        const cols = 5;
        const rows = Math.ceil(totalCards / cols);

        this.cardsContainer = this.add.container(0, 0);

        shuffled.forEach((type, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;

            const cardContainer = this.add.container(x, y);
            const shadow = this.add.rectangle(2, 2, cardSize, cardSize, 0x000000, 0.3);
            const cardBg = this.add.rectangle(0, 0, cardSize, cardSize, 0x2d3748);
            cardBg.setStrokeStyle(3, 0x4a5568);

            const card = this.add.image(0, 0, 'cardBack');
            card.setDisplaySize(195, 195);

            cardContainer.add([shadow, cardBg, card]);
            cardContainer.setSize(cardSize, cardSize);
            cardContainer.setInteractive();

            cardContainer.cardType = type;

            const variants = this.currentLevel === 4 ? ['es', 'lu'] : ['ves','ti'];
            cardContainer.cardVariant = variants[this.cardPairIndices[type]];
            this.cardPairIndices[type]++;
            cardContainer.imageKey = `${cardContainer.cardVariant}${type}`;

            cardContainer.isFlipped = false;
            cardContainer.isMatched = false;
            cardContainer.cardImage = card;
            cardContainer.cardBg = cardBg;

            cardContainer.on('pointerdown', () => this.flipCard(cardContainer));

            cardContainer.on('pointerover', () => {
                if (!cardContainer.isMatched && !cardContainer.isFlipped && this.canClick) {
                    this.tweens.add({
                        targets: cardContainer,
                        scale: 1.08,
                        duration: 200,
                        ease: 'Back.easeOut'
                    });
                    cardBg.setStrokeStyle(3, 0xffd700);
                    cardBg.setFillStyle(0x3d4758);
                }
            });

            cardContainer.on('pointerout', () => {
                if (!cardContainer.isMatched && !cardContainer.isFlipped) {
                    this.tweens.add({
                        targets: cardContainer,
                        scale: 1,
                        duration: 200
                    });
                    cardBg.setStrokeStyle(3, 0x4a5568);
                    cardBg.setFillStyle(0x2d3748);
                }
            });

            this.cardsContainer.add(cardContainer);
            this.cards.push(cardContainer);
        });

        this.maxScrollY = Math.max(0, (rows - 3) * spacingY);
        this.scrollY = 0;
        this.createScrollbar();
    }

    createScrollbar() {
        const scrollbarBg = this.add.rectangle(1370, 500, 20, 420, 0x2d3748, 0.8);
        scrollbarBg.setDepth(100);

        this.scrollThumb = this.add.rectangle(1370, 320, 16, 70, 0x667eea, 1);
        this.scrollThumb.setDepth(101);
        this.scrollThumb.setInteractive({ draggable: true });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.scrollThumb) {
                const minY = 290;
                const maxY = 710;
                const clampedY = Phaser.Math.Clamp(dragY, minY, maxY);
                this.scrollThumb.y = clampedY;

                const scrollPercent = (clampedY - minY) / (maxY - minY);
                this.scrollY = scrollPercent * this.maxScrollY;
                if (this.cardsContainer) this.cardsContainer.y = -this.scrollY;
            }
        });

        this.events.on('update', () => {
            if (this.currentLevel === 4 && this.scrollThumb) {
                const scrollPercent = this.scrollY / this.maxScrollY;
                const minY = 290;
                const maxY = 710;
                this.scrollThumb.y = minY + (scrollPercent * (maxY - minY));
            }
        });
    }

    flipCard(cardContainer) {
        if (!this.canClick || cardContainer.isFlipped || cardContainer.isMatched || this.gameEnded) {
            return;
        }

        this.clicks++;
        this.clicksText.setText(`🖱️ Clicks: ${this.clicks}`);
        this.playSound(440, 0.1);

        this.tweens.add({
            targets: cardContainer,
            scaleX: 0,
            duration: 150,
            onComplete: () => {
                cardContainer.cardImage.setTexture(cardContainer.imageKey);
                cardContainer.cardImage.setDisplaySize(195, 195);
                cardContainer.isFlipped = true;
                cardContainer.cardBg.setStrokeStyle(3, 0x4a5568);

                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1,
                    duration: 150
                });
            }
        });

        this.flippedCards.push(cardContainer);

        if (this.flippedCards.length === 2) {
            this.canClick = false;
            this.time.delayedCall(800, () => this.checkMatch());
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.cardType === card2.cardType) {
            // MATCH
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;
            this.score += 100;
            this.scoreText.setText(`⭐ Puntos: ${this.score}`);

            this.playSound(523, 0.15);
            this.time.delayedCall(80, () => this.playSound(659, 0.15));
            this.time.delayedCall(160, () => this.playSound(784, 0.2));

            this.tweens.add({
                targets: [card1, card2],
                scale: 1.15,
                angle: 360,
                duration: 400,
                ease: 'Back.easeOut'
            });

            card1.cardBg.setStrokeStyle(3, 0x48bb78);
            card2.cardBg.setStrokeStyle(3, 0x48bb78);

            const totalPairs = 5;
            if (this.matchedPairs === totalPairs) {
                this.time.delayedCall(1000, () => this.gameWon());
            }
        } else {
            // NO MATCH -> RESTAR 100 PUNTOS
            this.score = Math.max(0, this.score - 100);
            this.scoreText.setText(`⭐ Puntos: ${this.score}`);

            this.playSound(200, 0.3, 'sawtooth');

            [card1, card2].forEach(card => {
                this.tweens.add({
                    targets: card,
                    x: card.x + 5,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            });

            [card1, card2].forEach(card => {
                this.tweens.add({
                    targets: card,
                    scaleX: 0,
                    duration: 150,
                    delay: 400,
                    onComplete: () => {
                        card.cardImage.setTexture('cardBack');
                        card.cardImage.setDisplaySize(195, 195);
                        card.isFlipped = false;
                        card.cardBg.setStrokeStyle(3, 0x4a5568);

                        this.tweens.add({
                            targets: card,
                            scaleX: 1,
                            duration: 150
                        });
                    }
                });
            });
        }

        this.flippedCards = [];
        this.canClick = true;
    }

    updateTime() {
        if (this.gameEnded) return;

        this.timeRemaining--;

        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.timeText.setText(`⏱️ Tiempo: ${timeString}`);

        if (this.timeRemaining <= 30) {
            this.timeText.setColor('#ff0000');
            this.tweens.add({
                targets: this.timeText,
                scale: 1.2,
                duration: 100,
                yoyo: true,
                ease: 'Quad.easeInOut'
            });
        }

        if (this.timeRemaining <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        this.gameEnded = true;
        this.canClick = false;
        if (this.timeEvent) this.timeEvent.remove();

        this.playSound(200, 0.5, 'sawtooth');

        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.75);
        overlay.setDepth(1000);

        // Panel con gradiente aesthetic
        const losePanel = this.add.rectangle(700, 400, 550, 550, 0x1a1a2e, 0.95);
        losePanel.setDepth(1001);
        
        // Bordes con efecto neón
        const border1 = this.add.rectangle(700, 400, 550, 550);
        border1.setStrokeStyle(4, 0xff6b9d, 1);
        border1.setDepth(1001);
        
        const border2 = this.add.rectangle(700, 400, 560, 560);
        border2.setStrokeStyle(2, 0xc06c84, 0.6);
        border2.setDepth(1001);

        // Decoración esquinas
        const corner1 = this.add.text(430, 150, '╔', { fontSize: '40px', color: '#ff6b9d' }).setDepth(1002);
        const corner2 = this.add.text(950, 150, '╗', { fontSize: '40px', color: '#ff6b9d' }).setDepth(1002);
        const corner3 = this.add.text(430, 620, '╚', { fontSize: '40px', color: '#ff6b9d' }).setDepth(1002);
        const corner4 = this.add.text(950, 620, '╝', { fontSize: '40px', color: '#ff6b9d' }).setDepth(1002);

        const loseText = this.add.text(700, 230, 'JUEGO TERMINADO', {
            fontSize: '52px',
            fontStyle: 'bold',
            color: '#ff6b9d',
            stroke: '#000',
            strokeThickness: 6,
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(1002);

        const sadEmoji = this.add.text(700, 310, '⏰💔', {
            fontSize: '60px'
        }).setOrigin(0.5).setDepth(1002);

        const statsText = this.add.text(700, 440,
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `⭐ PUNTOS: ${this.score}\n\n` +
            `💎 PARES: ${this.matchedPairs}/5\n\n` +
            `🖱️ CLICKS: ${this.clicks}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━`, {
            fontSize: '22px',
            color: '#f0e6ef',
            align: 'center',
            lineSpacing: 0,
            fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(1002);

        // Botón estilo gamer
        const restartBg = this.add.rectangle(700, 590, 280, 70, 0x6c5ce7);
        restartBg.setDepth(1002);
        
        const restartBorder = this.add.rectangle(700, 590, 280, 70);
        restartBorder.setStrokeStyle(3, 0xa29bfe, 1);
        restartBorder.setDepth(1002);

        const restartText = this.add.text(700, 590, '▶ DE NUEVO', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(1003);

        restartBg.setInteractive();

        this.tweens.add({
            targets: [overlay],
            alpha: { from: 0, to: 0.75 },
            duration: 400
        });

        this.tweens.add({
            targets: [losePanel, border1, border2],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.8, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: [loseText, sadEmoji, statsText, corner1, corner2, corner3, corner4],
            alpha: { from: 0, to: 1 },
            y: { from: '-=30', to: '+=30' },
            duration: 500,
            delay: 200,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: [restartBg, restartBorder, restartText],
            alpha: { from: 0, to: 1 },
            duration: 400,
            delay: 600
        });

        // Efecto pulsante en el borde
        this.tweens.add({
            targets: [border1],
            alpha: { from: 1, to: 0.3 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        restartBg.on('pointerover', () => {
            restartBg.setFillStyle(0xa29bfe);
            restartBorder.setStrokeStyle(3, 0xffeaa7, 1);
            this.tweens.add({
                targets: [restartBg, restartBorder, restartText],
                scale: 1.1,
                duration: 150
            });
        });

        restartBg.on('pointerout', () => {
            restartBg.setFillStyle(0x6c5ce7);
            restartBorder.setStrokeStyle(3, 0xa29bfe, 1);
            this.tweens.add({
                targets: [restartBg, restartBorder, restartText],
                scale: 1,
                duration: 150
            });
        });

        restartBg.on('pointerdown', () => {
            this.playSound(440, 0.1);
            this.scene.restart({ level: this.currentLevel, score: 0 });
        });
    }

    gameWon() {
        this.gameEnded = true;
        if (this.timeEvent) this.timeEvent.remove();

        const timeBonus = this.timeRemaining * 10;
        const clickBonus = Math.max(0, 200 - this.clicks * 5);
        this.score += timeBonus + clickBonus;

        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.75);
        overlay.setDepth(1000);

        // Panel aesthetic gamer
        const winPanel = this.add.rectangle(700, 400, 600, 650, 0x0f0e17, 0.95);
        winPanel.setDepth(1001);
        
        // Bordes neón con gradiente
        const border1 = this.add.rectangle(700, 400, 600, 650);
        border1.setStrokeStyle(4, 0xffd700, 1);
        border1.setDepth(1001);
        
        const border2 = this.add.rectangle(700, 400, 610, 660);
        border2.setStrokeStyle(2, 0xffbe0b, 0.6);
        border2.setDepth(1001);

        // Decoración esquinas doradas
        const corner1 = this.add.text(420, 100, '★', { fontSize: '35px', color: '#ffd700' }).setDepth(1002);
        const corner2 = this.add.text(960, 100, '★', { fontSize: '35px', color: '#ffd700' }).setDepth(1002);
        const corner3 = this.add.text(420, 695, '★', { fontSize: '35px', color: '#ffd700' }).setDepth(1002);
        const corner4 = this.add.text(960, 695, '★', { fontSize: '35px', color: '#ffd700' }).setDepth(1002);

        const titleText = this.currentLevel === 8 ? 'VICTORIA!' : 'NIVEL TERMINADO!';
        const winText = this.add.text(700, 170, titleText, {
            fontSize: this.currentLevel === 8 ? '56px' : '54px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 6,
            fontFamily: 'Arial Black'
        }).setOrigin(0.5).setDepth(1002);

        const trophyText = this.add.text(700, 250, this.currentLevel === 8 ? '👑🏆👑' : '🎮✨', {
            fontSize: '50px'
        }).setOrigin(0.5).setDepth(1002);

        const statsText = this.add.text(700, 380,
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `⭐ PUNTUACIÓN FINAL: ${this.score}\n\n` +
            `⏱️ TIEMPO: ${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}\n\n` +
            `🖱️ CLICKS: ${this.clicks}\n\n` +
            `✨ RECOMPENSA: +${timeBonus + clickBonus}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`, {
            fontSize: '20px',
            color: '#f8f9fa',
            align: 'center',
            lineSpacing: 2,
            fontFamily: 'Courier New'
        }).setOrigin(0.5).setDepth(1002);

        let buttonBg, buttonBorder, buttonText;

        if (this.currentLevel === 8) {
            buttonBg = this.add.rectangle(700, 600, 340, 75, 0x6c5ce7);
            buttonBg.setDepth(1002);
            
            buttonBorder = this.add.rectangle(700, 600, 340, 75);
            buttonBorder.setStrokeStyle(3, 0xa29bfe, 1);
            buttonBorder.setDepth(1002);
            
            buttonText = this.add.text(700, 600, '🏆 LEADERBOARD', {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial Black'
            }).setOrigin(0.5).setDepth(1003);
        } else {
            buttonBg = this.add.rectangle(700, 600, 300, 75, 0x00b894);
            buttonBg.setDepth(1002);
            
            buttonBorder = this.add.rectangle(700, 600, 300, 75);
            buttonBorder.setStrokeStyle(3, 0x55efc4, 1);
            buttonBorder.setDepth(1002);
            
            buttonText = this.add.text(700, 600, '▶ SIGUIENTE NIVEL', {
                fontSize: '26px',
                fontStyle: 'bold',
                color: '#ffffff',
                fontFamily: 'Arial Black'
            }).setOrigin(0.5).setDepth(1003);
        }

        buttonBg.setInteractive();

        this.tweens.add({
            targets: [overlay],
            alpha: { from: 0, to: 0.75 },
            duration: 400
        });

        this.tweens.add({
            targets: [winPanel, border1, border2],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1 },
            duration: 600,
            ease: 'Elastic.easeOut'
        });

        this.tweens.add({
            targets: [winText, trophyText, corner1, corner2, corner3, corner4],
            alpha: { from: 0, to: 1 },
            scale: { from: 0, to: 1 },
            duration: 500,
            delay: 200,
            ease: 'Bounce.easeOut'
        });

        this.tweens.add({
            targets: statsText,
            alpha: { from: 0, to: 1 },
            y: { from: 420, to: 380 },
            duration: 400,
            delay: 500
        });

        this.tweens.add({
            targets: [buttonBg, buttonBorder, buttonText],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.8, to: 1 },
            duration: 400,
            delay: 800,
            ease: 'Back.easeOut'
        });

        // Efecto pulsante en bordes
        this.tweens.add({
            targets: [border1],
            alpha: { from: 1, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Efecto de rotación en esquinas
        this.tweens.add({
            targets: [corner1, corner2, corner3, corner4],
            angle: 360,
            duration: 3000,
            repeat: -1
        });

        const victoryMelody = [523, 587, 659, 784, 880];
        victoryMelody.forEach((freq, i) => {
            this.time.delayedCall(i * 150, () => this.playSound(freq, 0.2));
        });

        buttonBg.on('pointerover', () => {
            if (this.currentLevel === 8) {
                buttonBg.setFillStyle(0xa29bfe);
                buttonBorder.setStrokeStyle(3, 0xffeaa7, 1);
            } else {
                buttonBg.setFillStyle(0x55efc4);
                buttonBorder.setStrokeStyle(3, 0xffeaa7, 1);
            }
            this.tweens.add({
                targets: [buttonBg, buttonBorder, buttonText],
                scale: 1.12,
                duration: 150
            });
        });

        buttonBg.on('pointerout', () => {
            if (this.currentLevel === 8) {
                buttonBg.setFillStyle(0x6c5ce7);
                buttonBorder.setStrokeStyle(3, 0xa29bfe, 1);
            } else {
                buttonBg.setFillStyle(0x00b894);
                buttonBorder.setStrokeStyle(3, 0x55efc4, 1);
            }
            this.tweens.add({
                targets: [buttonBg, buttonBorder, buttonText],
                scale: 1,
                duration: 150
            });
        });

        buttonBg.on('pointerdown', () => {
            this.playSound(523, 0.2);

            overlay.destroy();
            winPanel.destroy();
            winText.destroy();
            statsText.destroy();
            trophyText.destroy();
            buttonBg.destroy();
            buttonBorder.destroy();
            buttonText.destroy();
            border1.destroy();
            border2.destroy();
            corner1.destroy();
            corner2.destroy();
            corner3.destroy();
            corner4.destroy();

            if (this.currentLevel === 8) {
                this.saveScoreToLocal();
                this.showLeaderboard();
            } else {
                const nextLevel = this.currentLevel + 1;
                if (nextLevel === 5) {
                    this.showPartTwoCard();
                } else {
                    this.scene.restart({ level: nextLevel, score: this.score });
                }
            }
        });
    }

    showPartTwoCard() {
        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.85);
        overlay.setDepth(1000);

        const panel = this.add.rectangle(700, 400, 800, 420, 0xf6e0b3, 1);
        panel.setStrokeStyle(6, 0xb97438);
        panel.setDepth(1001);

        const title = this.add.text(700, 300, 'PARTE DOS — MÉXICO CON ENCANTO', {
            fontSize: '34px',
            fontStyle: 'bold',
            color: '#6a2f2f',
            stroke: '#ffffff',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        const subtitle = this.add.text(700, 360, 'Nuevos retos y lugares por descubrir.\n¿Listo para la Parte 2?', {
            fontSize: '20px',
            color: '#3b1f10',
            align: 'center'
        }).setOrigin(0.5).setDepth(1002);

        const startBg = this.add.rectangle(700, 480, 220, 65, 0x667eea);
        startBg.setStrokeStyle(3, 0xffd700);
        startBg.setInteractive();
        startBg.setDepth(1002);

        const startText = this.add.text(700, 480, 'COMENZAR PARTE 2', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1003);

        startBg.on('pointerover', () => {
            startBg.setFillStyle(0x764ba2);
            this.tweens.add({ targets: [startBg, startText], scale: 1.05, duration: 120 });
        });
        startBg.on('pointerout', () => {
            startBg.setFillStyle(0x667eea);
            this.tweens.add({ targets: [startBg, startText], scale: 1, duration: 120 });
        });

        startBg.on('pointerdown', () => {
            this.playSound(523, 0.15);
            this.scene.restart({ level: 5, score: this.score });
        });
    }

    saveScoreToLocal() {
        if (!this.playerName) {
            this.playerName = 'JUGADOR';
        }
        const entry = {
            name: this.playerName,
            score: this.score,
            character: this.playerCharacter || 0,
            date: new Date().toISOString()
        };

        let arr = [];
        try {
            const raw = localStorage.getItem(this.leaderboardKey);
            arr = raw ? JSON.parse(raw) : [];
        } catch (e) {
            arr = [];
        }
        arr.push(entry);
        arr.sort((a,b) => b.score - a.score || new Date(b.date) - new Date(a.date));
        localStorage.setItem(this.leaderboardKey, JSON.stringify(arr));
    }

    showLeaderboard() {
        const parent = document.getElementById('game-container');
        const existing = document.getElementById('leaderboard-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'leaderboard-overlay';
        overlay.style.position = 'absolute';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(0,0,0,0.8)';
        overlay.style.zIndex = '9999';
        overlay.style.padding = '20px';
        overlay.style.boxSizing = 'border-box';

        let arr = [];
        try {
            const raw = localStorage.getItem(this.leaderboardKey);
            arr = raw ? JSON.parse(raw) : [];
        } catch (e) {
            arr = [];
        }

        arr.sort((a,b) => b.score - a.score || new Date(b.date) - new Date(a.date));

        // Separar: Top 10 son los que tienen 2500+ puntos
        const top10 = arr.filter(e => e.score >= 2500).slice(0, 10);
        const rest = arr.filter(e => e.score < 2500);

        const html = document.createElement('div');
        html.style.width = '1000px';
        html.style.maxWidth = '95%';
        html.style.maxHeight = '90%';
        html.style.overflowY = 'auto';
        html.style.background = '#f6f0e6';
        html.style.border = '4px solid #b97438';
        html.style.borderRadius = '12px';
        html.style.padding = '18px';
        html.style.boxSizing = 'border-box';
        html.innerHTML = `
            <h2 style="font-family:Lobster; color:#6a2f2f; text-align:center">🏆 Tabla de Clasificación 🏆</h2>
            <p style="text-align:center; color:#3b1f10; margin-top:-8px;">Top 10 (mínimo 2500 pts)</p>
            <div style="display:flex; gap:12px; margin-top:12px;">
                <div style="flex:1;">
                    <h3 style="margin:6px 0 8px; color:#4a5568">⭐ Top 10</h3>
                    <div id="top-list" style="margin:0;"></div>
                </div>
                <div style="flex:1;">
                    <h3 style="margin:6px 0 8px; color:#4a5568">Otros Jugadores</h3>
                    <div id="rest-list" style="margin:0;"></div>
                </div>
            </div>
            <div style="margin-top:14px; display:flex; justify-content:center; gap:12px;">
                <button id="play-again-btn" style="padding:10px 16px; border-radius:8px; background:#48bb78; color:white; border:none; cursor:pointer;">Jugar de nuevo</button>
            </div>
        `;

        const topListContainer = html.querySelector('#top-list');
        if (top10.length === 0) {
            topListContainer.innerHTML = '<p style="color:#718096; font-size:14px;">Aún no hay jugadores con 2500+ puntos</p>';
        } else {
            top10.forEach((e, i) => {
                const item = document.createElement('div');
                item.style.marginBottom = '12px';
                item.style.padding = '8px';
                item.style.background = '#fff';
                item.style.borderRadius = '6px';
                item.style.border = '2px solid #d6b58a';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.gap = '10px';
                
                // Video del personaje
                const vid = document.createElement('video');
                vid.src = `assets/images/char${e.character}.mp4`;
                vid.width = 60;
                vid.height = 40;
                vid.muted = true;
                vid.loop = true;
                vid.autoplay = true;
                vid.style.borderRadius = '4px';
                vid.style.border = '2px solid #ffd700';
                
                const info = document.createElement('div');
                info.style.flex = '1';
                info.innerHTML = `
                    <div style="font-weight:bold; color:#2d3748;">#${i+1} ${e.name}</div>
                    <div style="color:#6a2f2f; font-size:18px;">⭐ ${e.score} pts</div>
                    <div style="font-size:11px; color:#6b7280;">${new Date(e.date).toLocaleString()}</div>
                `;
                
                item.appendChild(vid);
                item.appendChild(info);
                topListContainer.appendChild(item);
            });
        }

        const restListContainer = html.querySelector('#rest-list');
        if (rest.length === 0) {
            restListContainer.innerHTML = '<p style="color:#718096; font-size:14px;">No hay otros jugadores</p>';
        } else {
            rest.forEach((e, i) => {
                const item = document.createElement('div');
                item.style.marginBottom = '10px';
                item.style.padding = '6px';
                item.style.background = '#f7fafc';
                item.style.borderRadius = '4px';
                item.style.border = '1px solid #cbd5e0';
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.gap = '8px';
                
                // Video del personaje más pequeño
                const vid = document.createElement('video');
                vid.src = `assets/images/char${e.character}.mp4`;
                vid.width = 50;
                vid.height = 33;
                vid.muted = true;
                vid.loop = true;
                vid.autoplay = true;
                vid.style.borderRadius = '3px';
                vid.style.border = '1px solid #a0aec0';
                
                const info = document.createElement('div');
                info.style.flex = '1';
                info.innerHTML = `
                    <div style="font-weight:bold; color:#4a5568; font-size:14px;">${e.name}</div>
                    <div style="color:#718096; font-size:13px;">${e.score} pts</div>
                `;
                
                item.appendChild(vid);
                item.appendChild(info);
                restListContainer.appendChild(item);
            });
        }

        overlay.appendChild(html);
        parent.appendChild(overlay);

        document.getElementById('play-again-btn').addEventListener('click', () => {
            const el = document.getElementById('leaderboard-overlay');
            if (el) el.remove();
            this.scene.restart({ level: 1, score: 0 });
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#1a202c',
    scene: MemoryGame,
    dom: { createContainer: true }
};

const game = new Phaser.Game(config);

async function activarPantallaCompleta() {
    const elemento = document.documentElement;

    if (elemento.requestFullscreen) {
        try { await elemento.requestFullscreen(); } catch(e) { console.warn(e); }
    } else if (elemento.webkitRequestFullscreen) {
        try { await elemento.webkitRequestFullscreen(); } catch(e) { console.warn(e); }
    } else if (elemento.msRequestFullscreen) {
        try { await elemento.msRequestFullscreen(); } catch(e) { console.warn(e); }
    }

    try {
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
        }
    } catch (e) {
        console.warn('No se pudo bloquear orientación:', e);
    }
}