import { Scene } from 'phaser';
import { getLandmarks } from "../../services/landmarkService";

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
        }
    }

    async create ()
    {
        this.createCampusBackdrop();
        this.add.text(30, 25, 'ClubGator Map', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#f97316',
            fontStyle: 'bold'
        }).setDepth(10);

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
                });

                marker.on('pointerout', () => {
                    marker.setScale(1.0);
                    marker.setFillStyle(0xf97316);
                });

                marker.on('pointerdown', () => {
                    infoText.setText(`[${place.id}] ${place.name}: ${place.description}`);
                    infoText.setStyle({ color: '#fde047' });
                });
            });
        } catch (error) {
            console.error("Failed to load landmarks into Phaser scene:", error);
        }
    }
}