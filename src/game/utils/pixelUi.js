const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const BUTTON_PALETTES = {
    blue: {
        border: 0x091338,
        face: 0x0021a5,
        hoverFace: 0x1238cc,
        highlight: 0x4d79ff,
        shadow: 0x001366,
        text: '#ffffff'
    },
    orange: {
        border: 0x3b1504,
        face: 0xf37021,
        hoverFace: 0xff8538,
        highlight: 0xffab73,
        shadow: 0xb04507,
        text: '#ffffff'
    },
    cream: {
        border: 0x3d2817,
        face: 0xf4ead5,
        hoverFace: 0xfff8ea,
        highlight: 0xffffff,
        shadow: 0xbda57d,
        text: '#2a1b12'
    }
};

export function createPixelButton(scene, x, y, label, options = {}) {
    const {
        variant = 'blue',
        width = 160,
        height = 42,
        fontSize = 14,
        depth = 10,
        onClick = null
    } = options;

    const palette = BUTTON_PALETTES[variant] || BUTTON_PALETTES.blue;
    const container = scene.add.container(x, y).setDepth(depth);
    const gfx = scene.add.graphics();

    const drawButton = (state) => {
        const isHover = state === 'hover';
        const isDown = state === 'down';
        const faceColor = isHover ? palette.hoverFace : palette.face;
        const topColor = isDown ? palette.shadow : palette.highlight;
        const bottomColor = isDown ? palette.highlight : palette.shadow;
        const offsetY = isDown ? 2 : 0;

        const left = -width / 2;
        const top = -height / 2 + offsetY;

        gfx.clear();

        // outer 3px dark border
        gfx.fillStyle(palette.border, 1);
        gfx.fillRect(left + 3, top, width - 6, height);
        gfx.fillRect(left, top + 3, width, height - 6);

        // main
        gfx.fillStyle(faceColor, 1);
        gfx.fillRect(left + 3, top + 3, width - 6, height - 6);

        // top & left highlights
        gfx.fillStyle(topColor, 1);
        gfx.fillRect(left + 3, top + 3, width - 6, 4);
        gfx.fillRect(left + 3, top + 3, 4, height - 6);

        // bottom & right shadows
        gfx.fillStyle(bottomColor, 1);
        gfx.fillRect(left + 3, top + height - 7, width - 6, 4);
        gfx.fillRect(left + width - 7, top + 3, 4, height - 6);
    };

    drawButton('idle');

    const text = scene.add.text(0, 0, label.toUpperCase(), {
        fontFamily: '"Press Start 2P", "Pixelify Sans", monospace',
        fontSize: `${fontSize}px`,
        color: palette.text,
        align: 'center'
    }).setOrigin(0.5);

    const hitArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

    container.add([gfx, text, hitArea]);

    hitArea.on('pointerover', () => {
        drawButton('hover');
        text.setY(-1);
    });
    hitArea.on('pointerout', () => {
        drawButton('idle');
        text.setY(0);
    });
    hitArea.on('pointerdown', () => {
        drawButton('down');
        text.setY(2);
    });
    hitArea.on('pointerup', () => {
        drawButton('hover');
        text.setY(-1);
        if (onClick) onClick();
    });

    return container;
}


export function buildLoadingBackdrop(scene, options = {}) {
    const { width, height } = scene.scale;
    const { subtitle = '', showBar = true } = options;

    if (scene.textures.exists('loading-screen')) {
        scene.add.image(width / 2, height / 2, 'loading-screen')
            .setDisplaySize(width, height)
            .setDepth(0);
    } else {
        scene.add.rectangle(width / 2, height / 2, width, height, 0x8ad44c).setDepth(0);
    }

    const laptopGlow = scene.add.ellipse(440, 345, 110, 75, 0x7ef9ff, 0.16).setDepth(1);
    scene.tweens.add({
        targets: laptopGlow,
        alpha: { from: 0.08, to: 0.24 },
        scaleX: { from: 0.96, to: 1.05 },
        scaleY: { from: 0.96, to: 1.05 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    //  floating sparkles across the grass
    for (let i = 0; i < 14; i++) {
        const px = randInt(60, width - 60);
        const py = randInt(60, height - 60);
        const size = randInt(4, 7);
        const sparkle = scene.add.rectangle(px, py, size, size, i % 2 === 0 ? 0xfff8b8 : 0xffffff, 0.75)
            .setDepth(2);

        scene.tweens.add({
            targets: sparkle,
            y: py - randInt(18, 40),
            alpha: { from: 0.15, to: 0.85 },
            duration: randInt(1400, 2600),
            delay: randInt(0, 900),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // "loading..." text
    const loadingText = scene.add.text(195, height - 96, 'Loading...', {
        fontFamily: '"Press Start 2P", "Pixelify Sans", monospace',
        fontSize: '26px',
        color: '#ffffff',
        stroke: '#234a1c',
        strokeThickness: 7
    }).setOrigin(0.5).setDepth(5);

    let dotStep = 0;
    scene.time.addEvent({
        delay: 320,
        loop: true,
        callback: () => {
            dotStep = (dotStep % 3) + 1;
            loadingText.setText(`Loading${'.'.repeat(dotStep)}`);
        }
    });

    if (subtitle) {
        scene.add.text(195, height - 54, subtitle.toUpperCase(), {
            fontFamily: '"Pixelify Sans", sans-serif',
            fontSize: '18px',
            color: '#fff8dc',
            stroke: '#234a1c',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(5);
    }

    let updateProgress = () => {};
    if (showBar) {
        const barX = 195;
        const barY = subtitle ? height - 28 : height - 56;
        const barW = 240;
        const barH = 18;

        const barFrame = scene.add.graphics().setDepth(5);
        barFrame.fillStyle(0x1f3d18, 1);
        barFrame.fillRect(barX - barW / 2 - 4, barY - barH / 2 - 4, barW + 8, barH + 8);
        barFrame.fillStyle(0x3a6e2c, 1);
        barFrame.fillRect(barX - barW / 2, barY - barH / 2, barW, barH);

        const barFill = scene.add.rectangle(barX - barW / 2 + 2, barY, 4, barH - 4, 0xf37021)
            .setOrigin(0, 0.5)
            .setDepth(6);

        updateProgress = (progress) => {
            const clamped = Math.max(0, Math.min(1, progress));
            barFill.width = Math.max(4, (barW - 4) * clamped);
        };
    }

    return { loadingText, updateProgress };
}

/**
 * tile wipe
 */
export function playTransitionOut(scene, onComplete) {
    if (scene._isTransitioning) return;
    scene._isTransitioning = true;

    const { width, height } = scene.scale;
    const cols = 16;
    const rows = 12;
    const tileW = Math.ceil(width / cols);
    const tileH = Math.ceil(height / rows);

    const tiles = [];
    let maxDelay = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const color = (r + c) % 2 === 0 ? 0x0021a5 : 0xf37021;
            const tile = scene.add.rectangle(
                c * tileW + tileW / 2,
                r * tileH + tileH / 2,
                tileW + 2,
                tileH + 2,
                color
            )
                .setDepth(999)
                .setScale(0)
                .setAlpha(0.95);

            const delay = (r + c) * 16;
            if (delay > maxDelay) maxDelay = delay;

            scene.tweens.add({
                targets: tile,
                scale: 1,
                alpha: 1,
                duration: 210,
                delay,
                ease: 'Back.easeOut'
            });
            tiles.push(tile);
        }
    }

    scene.time.delayedCall(maxDelay + 230, () => {
        if (onComplete) onComplete();
    });
}

export function playTransitionIn(scene) {
    const { width, height } = scene.scale;
    const cols = 16;
    const rows = 12;
    const tileW = Math.ceil(width / cols);
    const tileH = Math.ceil(height / rows);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const color = (r + c) % 2 === 0 ? 0x0021a5 : 0xf37021;
            const tile = scene.add.rectangle(
                c * tileW + tileW / 2,
                r * tileH + tileH / 2,
                tileW + 2,
                tileH + 2,
                color
            )
                .setDepth(999)
                .setScale(1);

            const delay = (r + c) * 14;
            scene.tweens.add({
                targets: tile,
                scale: 0,
                alpha: 0,
                duration: 220,
                delay,
                ease: 'Cubic.easeIn',
                onComplete: () => tile.destroy()
            });
        }
    }
}
