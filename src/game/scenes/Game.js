import { Scene } from 'phaser';
import { getLandmarks } from "../../services/landmarkService";
import { createPixelButton, playTransitionIn, playTransitionOut } from '../utils/pixelUi';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    createCampusBackdrop ()
    {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor(0x42d3f3);
        if (this.textures.exists('sky')) {
            this.add.image(width / 2, height / 2, 'sky')
                .setDisplaySize(width, height)
                .setDepth(0);
        }

        if (this.textures.exists('grass')) {
            const grass = this.add.image(width / 2, height, 'grass')
                .setOrigin(0.5, 1)
                .setDepth(1);
            const grassScale = width / grass.width;
            grass.setScale(grassScale);
            const grassDisplayHeight = grass.height * grassScale;
            this.grassTopY = height - grassDisplayHeight + (470 / 540) * grassDisplayHeight;
        }
    }

    async create ()
    {
        this._isTransitioning = false;
        this.game.events.emit('chat-room-change', 'campus');
        this.createCampusBackdrop();
        this.createMapButton();
        playTransitionIn(this);

        this.createGator();

        const infoText = this.add.text(512, 720, 'Click any UF landmark to explore campus in detail!', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#cbd5e1',
            backgroundColor: '#0f172a',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(10);

        try {
            const landmarks = await getLandmarks();
            landmarks.forEach((place) => {
                const marker = this.add.circle(place.x, place.y, 14, 0xf97316);
                marker.setStrokeStyle(3, 0xffffff);
                marker.setInteractive({ useHandCursor: true });
                marker.setDepth(5);
                this.add.text(place.x, place.y + 18, place.name, {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    color: '#ffffff',
                    backgroundColor: '#000000aa',
                    padding: { x: 4, y: 2 }
                }).setOrigin(0.5, 0).setDepth(5);

                marker.on('pointerover', () => {
                    marker.setScale(1.3);
                    marker.setFillStyle(0x38bdf8);
                    infoText.setText(`${place.name}: ${place.description}`);
                    infoText.setStyle({ color: '#fde047' });
                });

                marker.on('pointerout', () => {
                    marker.setScale(1.0);
                    marker.setFillStyle(0xf97316);
                });

                marker.on('pointerdown', () => {
                    playTransitionOut(this, () => {
                        this.scene.start('LoadingScene', {
                            targetScene: 'LocationScene',
                            targetData: { landmarkId: place.id },
                            subtitle: place.name
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Failed to load landmarks into Phaser scene:", error);
        }
    }

    createMapButton ()
    {
        createPixelButton(this, 118, 40, 'CAMPUS MAP', {
            variant: 'blue',
            width: 186,
            height: 42,
            fontSize: 13,
            depth: 20,
            onClick: () => this.openCampusMap()
        });
    }

    openCampusMap ()
    {
        if (this.mapPopup) {
            return;
        }

        const { width, height } = this.scale;
        this.mapPopup = this.add.container(0, 0).setDepth(100);

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x5cc2f2, 0.78)
            .setInteractive();
        const panel = this.add.rectangle(width / 2, height / 2, 820, 610, 0x5cc2f2)
            .setStrokeStyle(5, 0x0021A5);
        const header = this.add.rectangle(width / 2, height / 2 - 265, 820, 80, 0x0021A5)
            .setOrigin(0.5);
        const title = this.add.text(width / 2 - 390, height / 2 - 265, 'Campus Map', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 20,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.mapPopup.add([backdrop, panel, header, title]);

        if (this.textures.exists('campus-map')) {
            const mapImage = this.add.image(width / 2, height / 2 + 35, 'campus-map')
                .setDisplaySize(760, 500)
                .setOrigin(0.5);
            this.mapPopup.add(mapImage);
        } else {
            const mapPlaceholder = this.add.rectangle(width / 2, height / 2 + 35, 760, 500, 0x5cc2f2)
                .setStrokeStyle(4, 0xf97316)
                .setFillStyle(0x5cc2f2);
            const placeholderTitle = this.add.text(width / 2, height / 2 - 5,
                'Campus Map', {
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: 22,
                    color: '#ffbb00',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
            const placeholderText = this.add.text(width / 2, height / 2 + 38,
                'Map image coming soon', {
                    fontFamily: 'Pixelify Sans, monospace',
                    fontSize: 20,
                    color: '#ffffff'
                }).setOrigin(0.5);
            this.mapPopup.add([mapPlaceholder, placeholderTitle, placeholderText]);
        }

        const closeButton = createPixelButton(this, width / 2 + 372, height / 2 - 265, 'X', {
            variant: 'orange',
            width: 42,
            height: 42,
            fontSize: 16,
            onClick: () => this.closeCampusMap()
        });
        this.mapPopup.add(closeButton);

        backdrop.on('pointerdown', (pointer, localX, localY, event) => {
            if (pointer && event) {
                event.stopPropagation();
            }
            this.closeCampusMap();
        });

        this.mapEscapeHandler = () => this.closeCampusMap();
        this.input.keyboard.on('keydown-ESC', this.mapEscapeHandler);
    }

    closeCampusMap ()
    {
        if (!this.mapPopup) {
            return;
        }

        if (this.mapEscapeHandler) {
            this.input.keyboard.off('keydown-ESC', this.mapEscapeHandler);
            this.mapEscapeHandler = null;
        }
        this.mapPopup.destroy(true);
        this.mapPopup = null;
    }

    createGator ()
    {
        if (!this.anims.exists('gator-walk-left')) {
            this.anims.create({
                key: 'gator-walk-left',
                frames: [
                    { key: 'gator-left-1' },
                    { key: 'gator-left-2' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('gator-walk-right')) {
            this.anims.create({
                key: 'gator-walk-right',
                frames: [
                    { key: 'gator-right-1' },
                    { key: 'gator-right-2' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        const groundY = this.grassTopY ?? 650;
        this.gator = this.add.sprite(512, groundY, 'gator-standing')
            .setOrigin(0.5, 1)
            .setScale(0.11)
            .setDepth(6);
        this.gatorDisplayWidth = this.gator.displayWidth;
        this.gatorDisplayHeight = this.gator.displayHeight;
        this.setGatorDisplaySize();

        this.gatorFacing = 'right';
        this.gatorIsWalking = false;

        this.gatorKeys = this.input.keyboard.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
            upArrow: 'UP',
            downArrow: 'DOWN',
            leftArrow: 'LEFT',
            rightArrow: 'RIGHT'
        });
    }

    setGatorDisplaySize ()
    {
        if (!this.gator) {
            return;
        }
        this.gator.setOrigin(0.5, 1);
        this.gator.setDisplaySize(this.gatorDisplayWidth, this.gatorDisplayHeight);
    }

    update (time, delta)
    {
        if (!this.gator || !this.gatorKeys || this.mapPopup) {
            return;
        }

        let dx = 0;
        if (this.gatorKeys.left.isDown || this.gatorKeys.leftArrow.isDown) {
            dx -= 1;
        }
        if (this.gatorKeys.right.isDown || this.gatorKeys.rightArrow.isDown) {
            dx += 1;
        }

        if (dx !== 0) {
            const speed = 180;
            this.gator.x += dx * speed * (delta / 1000);
            this.gator.y = this.grassTopY ?? 650;

            const halfWidth = (this.gator.displayWidth / 2);
            this.gator.x = Math.max(halfWidth, Math.min(this.scale.width - halfWidth, this.gator.x));

            if (dx < 0) {
                this.gatorFacing = 'left';
            } else if (dx > 0) {
                this.gatorFacing = 'right';
            }

            const animationKey = this.gatorFacing === 'left'
                ? 'gator-walk-left'
                : 'gator-walk-right';
            if (!this.gator.anims.isPlaying || this.gator.anims.currentAnim?.key !== animationKey) {
                this.gator.play(animationKey);
            }
            this.setGatorDisplaySize();
            this.gatorIsWalking = true;
        } else if (this.gatorIsWalking) {
            this.gator.anims.stop();
            this.gator.setTexture('gator-standing');
            this.setGatorDisplaySize();
            this.gatorIsWalking = false;
        }
    }
}