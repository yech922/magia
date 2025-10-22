class MemoryGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MemoryGame' });
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.clicks = 0;
        this.canClick = false;
        this.timeRemaining = 60; 
        this.gameEnded = false;
        this.currentLevel = 1;
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
       
        this.timeRemaining = this.currentLevel === 4 ? 120 : 60;
        this.gameEnded = false;
    }

    preload() {
        // NIVEL 1
        for (let i = 1; i <= 5; i++) {
            this.load.image(`card${i}p1`, `assets/images/card${i}p1.jpg`);
            this.load.image(`card${i}p2`, `assets/images/card${i}p2.jpg`);
        }
        
        // NIVEL 2
        for (let i = 1; i <= 5; i++) {
            this.load.image(`b${i}a`, `assets/images/b${i}a.png`);
            this.load.image(`b${i}b`, `assets/images/b${i}b.png`);
        }
        
        // NIVEL 3
        for (let i = 1; i <= 5; i++) {
            this.load.image(`pre${i}`, `assets/images/pre${i}.png`);
            this.load.image(`re${i}`, `assets/images/re${i}.png`);
        }
        
        // NIVEL 4
        for (let i = 1; i <= 5; i++) {
            this.load.image(`es${i}`, `assets/images/es${i}.png`);
            this.load.image(`lu${i}`, `assets/images/lu${i}.png`);
        }
        
        this.load.image('cardBack', 'assets/images/cardBack.png');
    }

   create() {
    
    const bg = this.add.rectangle(700, 400, 1400, 800, 0xd8c4a0);

   
    const graphics = this.add.graphics();
    graphics.fillStyle(0xb97438, 0.25);
    graphics.fillRect(0, 0, 1400, 100);
    graphics.fillRect(0, 700, 1400, 100);

    const titleShadow = this.add.text(702, 32, `RINCONES CON MAGIA - NIVEL ${this.currentLevel}`, {
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

  
    this.createBoard();

 
    this.createSounds();


    this.showInitialAlert();

    
    this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateTime,
        callbackScope: this,
        loop: true,
        paused: true
    });
}


    showInitialAlert() {
      
        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.85);
        overlay.setDepth(1000);
        
      
        const alertPanel = this.add.rectangle(700, 400, 450, 320, 0xf6e0b3, 1);
        alertPanel.setStrokeStyle(5, 0x667eea);
        alertPanel.setDepth(1001);

     
        const levelIcons = ['🎮', '🚀', '⭐', '🏆'];
        const icon = this.add.text(700, 300, levelIcons[this.currentLevel - 1], {
            fontSize: '60px'
        }).setOrigin(0.5).setDepth(1002);

        const levelTitles = ['¡Bienvenido!', '¡NIVEL 2!', '¡NIVEL 3!', '¡NIVEL FINAL!'];
        const titleText = levelTitles[this.currentLevel - 1];
        const alertTitle = this.add.text(700, 380, titleText, {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ff7d5d',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1002);

        // Mensaje
        const messageTime = this.currentLevel === 4 ? '2:00 minutos' : '1:00 minuto';
        const alertMessage = this.add.text(700, 440, 
            `Encuentra los pares\n⏱️ Tienes ${messageTime} ⏱️`, {
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

      
        okButton.on('pointerdown', () => {
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

    createBoard() {
        let cardTypes, shuffled;
        
        if (this.currentLevel === 1) {
            // NIVEL 1
            cardTypes = [1, 2, 3, 4, 5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            
            this.cardPairIndices = {1: 1, 2: 1, 3: 1, 4: 1, 5: 1};
        } else if (this.currentLevel === 2) {
            // NIVEL 2
            cardTypes = ['b1', 'b2', 'b3', 'b4', 'b5'];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            
            this.cardPairIndices = {b1: 0, b2: 0, b3: 0, b4: 0, b5: 0};
        } else if (this.currentLevel === 3) {
            // NIVEL 3
            cardTypes = [1, 2, 3, 4, 5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            
            this.cardPairIndices = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        } else {
            // NIVEL 4
            cardTypes = [1, 2, 3, 4, 5];
            const pairs = [...cardTypes, ...cardTypes];
            shuffled = Phaser.Utils.Array.Shuffle(pairs);
            
            
            this.cardPairIndices = {1: 0, 2: 0, 3: 0, 4: 0, 5:0};
        }

        if (this.currentLevel === 4) {
            // NIVEL 4
            this.createLevel4(shuffled);
        } else {
            // NIVELES 1-3
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
            const cardBg = this.add.rectangle(0, 0, cardSize, cardSize, this.cardColor);
            cardBg.setStrokeStyle(3, this.cardBorderColor);

            

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
    const spacingX = 250; // espacio horizontal
    const spacingY = 220; // espacio vertical
    const cardSize = 200;

    // Calcular filas y columnas dinámicamente según la cantidad de cartas
    const totalCards = shuffled.length;
    const cols = 5; // máximo 5 cartas por fila
    const rows = Math.ceil(totalCards / cols);

    // Contenedor para todas las cartas del nivel 4
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

        const variants = ['es', 'lu'];
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
                this.cardsContainer.y = -this.scrollY;
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
            // NO MATCH
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
//cambiar el color despues de 30s
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
        this.timeEvent.remove();

        // Sonido de derrota
        this.playSound(200, 0.5, 'sawtooth');

        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.85);
        overlay.setDepth(1000);
        
        const losePanel = this.add.rectangle(700, 400, 520, 500, 0x1a202c, 1);
        losePanel.setStrokeStyle(5, 0xff6b6b);
        losePanel.setDepth(1001);

        const loseText = this.add.text(700, 220, '¡TIEMPO AGOTADO!', {
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#ff6b6b',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(1002);

        const sadEmoji = this.add.text(700, 300, '⏰', {
            fontSize: '70px'
        }).setOrigin(0.5).setDepth(1002);

        const statsText = this.add.text(700, 410, 
            `Puntuación: ${this.score}\n\n` +
            `Parejas encontradas: ${this.matchedPairs}/5\n\n` +
            `🖱️ Clicks: ${this.clicks}`, {
            fontSize: '22px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setDepth(1002);

        const restartBg = this.add.rectangle(700, 560, 230, 65, 0x667eea);
        restartBg.setStrokeStyle(3, 0xffd700);
        restartBg.setInteractive();
        restartBg.setDepth(1002);

        const restartText = this.add.text(700, 560, '🔄 REINTENTAR', {
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1003);

        this.tweens.add({
            targets: [overlay, losePanel],
            alpha: { from: 0, to: 1 },
            duration: 400
        });

        this.tweens.add({
            targets: [loseText, sadEmoji, statsText],
            alpha: { from: 0, to: 1 },
            scale: { from: 0.8, to: 1 },
            duration: 500,
            delay: 200,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: [restartBg, restartText],
            alpha: { from: 0, to: 1 },
            duration: 400,
            delay: 600
        });

        restartBg.on('pointerover', () => {
            restartBg.setFillStyle(0x764ba2);
            this.tweens.add({
                targets: [restartBg, restartText],
                scale: 1.1,
                duration: 150
            });
        });

        restartBg.on('pointerout', () => {
            restartBg.setFillStyle(0x667eea);
            this.tweens.add({
                targets: [restartBg, restartText],
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
        this.timeEvent.remove();

        const timeBonus = this.timeRemaining * 10;
        const clickBonus = Math.max(0, 200 - this.clicks * 5);
        this.score += timeBonus + clickBonus;

        const overlay = this.add.rectangle(700, 400, 1400, 800, 0x000000, 0.85);
        overlay.setDepth(1000);
        
        const winPanel = this.add.rectangle(700, 400, 520, 600, 0x1a202c, 1);
        winPanel.setStrokeStyle(5, 0xffd700);
        winPanel.setDepth(1001);

        const titleText = this.currentLevel === 4 ? '¡JUEGO COMPLETADO!' : '¡FELICIDADES!';
        const winText = this.add.text(700, 180, titleText, {
            fontSize: this.currentLevel === 4 ? '38px' : '44px',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(1002);

        const statsText = this.add.text(700, 310, 
            `Puntuación Final: ${this.score}\n\n\n` +
            `⏱️ Tiempo restante: ${Math.floor(this.timeRemaining / 60)}:${(this.timeRemaining % 60).toString().padStart(2, '0')}\n\n\n` +
            `🖱️ Clicks: ${this.clicks}\n\n\n` +
            `✨ Bonus: ${timeBonus + clickBonus} pts`, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 0
        }).setOrigin(0.5).setDepth(1002);

        const trophyText = this.add.text(700, 500, '🏆', {
            fontSize: '60px'
        }).setOrigin(0.5).setDepth(1002);

        let buttonBg, buttonText;
        
        if (this.currentLevel === 4) {
            buttonBg = this.add.rectangle(700, 580, 250, 65, 0x667eea);
            buttonBg.setStrokeStyle(3, 0xffd700);
            buttonBg.setInteractive();
            buttonBg.setDepth(1002);

            buttonText = this.add.text(700, 580, '🔄 JUGAR DE NUEVO', {
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(1003);
        } else {
            buttonBg = this.add.rectangle(700, 580, 250, 65, 0x48bb78);
            buttonBg.setStrokeStyle(3, 0xffd700);
            buttonBg.setInteractive();
            buttonBg.setDepth(1002);

            buttonText = this.add.text(700, 580, '➡️ SIGUIENTE NIVEL', {
                fontSize: '20px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(1003);
        }

        this.tweens.add({
            targets: [overlay, winPanel],
            alpha: { from: 0, to: 1 },
            duration: 400
        });

        this.tweens.add({
            targets: [winText, trophyText],
            alpha: { from: 0, to: 1 },
            scale: { from: 0, to: 1 },
            duration: 500,
            delay: 200,
            ease: 'Bounce.easeOut'
        });

        this.tweens.add({
            targets: statsText,
            alpha: { from: 0, to: 1 },
            y: { from: 350, to: 330 },
            duration: 400,
            delay: 500
        });

        this.tweens.add({
            targets: [buttonBg, buttonText],
            alpha: { from: 0, to: 1 },
            duration: 400,
            delay: 800
        });

        const victoryMelody = [523, 587, 659, 784, 880];
        victoryMelody.forEach((freq, i) => {
            this.time.delayedCall(i * 150, () => this.playSound(freq, 0.2));
        });

        buttonBg.on('pointerover', () => {
            if (this.currentLevel === 4) {
                buttonBg.setFillStyle(0x764ba2);
            } else {
                buttonBg.setFillStyle(0x38a169);
            }
            this.tweens.add({
                targets: [buttonBg, buttonText],
                scale: 1.1,
                duration: 150
            });
        });

        buttonBg.on('pointerout', () => {
            if (this.currentLevel === 4) {
                buttonBg.setFillStyle(0x667eea);
            } else {
                buttonBg.setFillStyle(0x48bb78);
            }
            this.tweens.add({
                targets: [buttonBg, buttonText],
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
            buttonText.destroy();
            
            // Lógica de niveles
            if (this.currentLevel === 1) {
                this.scene.restart({ level: 2, score: this.score });
            } else if (this.currentLevel === 2) {
                this.scene.restart({ level: 3, score: this.score });
            } else if (this.currentLevel === 3) {
                this.scene.restart({ level: 4, score: this.score });
            } else {
                // Nivel 4 completado poder  reiniciar desde nivel 1
                this.scene.restart({ level: 1, score: 0 });
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1400,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#1a202c',
    scene: MemoryGame
};

const game = new Phaser.Game(config);