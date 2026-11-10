import { Scene } from 'phaser';
import { getLandmarkById } from '../../services/landmarkService';

export class LocationScene extends Scene {
    constructor() {
        super('LocationScene');
    }

    init(data) {
        this.landmarkId = data?.landmarkId || 'century-tower';
    }

    async create() {
        const { width, height } = this.scale;

        // Clean sky background
        this.add.rectangle(width / 2, height / 2, width, height, 0x5cc2f2);

        // Fetch location details
        let landmarkData = null;
        try {
            landmarkData = await getLandmarkById(this.landmarkId);
        } catch (err) {
            console.warn('Error fetching landmark data:', err);
        }

        // Custom name override map
        const NAME_MAP = {
            'football-stadium': 'THE SWAMP',
            'sports-arena': "O'DOME",
            'library-west': 'LIB WEST',
            'marston-library': 'MARSTON',
            'student-union': 'REITZ UNION',
            'century-tower': 'CENTURY TOWER'
        };

        const rawName = landmarkData?.name || this.landmarkId;
        const displayName = (NAME_MAP[this.landmarkId] || NAME_MAP[rawName.toLowerCase()] || rawName).toUpperCase();

        // 1. Header Title
        this.add.text(width / 2, 70, displayName, {
            fontFamily: 'Pixelify Sans, sans-serif',
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5);

        // 2. Back to Map Button
        const backBtn = this.add.text(120, 50, '← Back to Map', {
            fontFamily: 'Pixelify Sans, sans-serif',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#0021A5',
            padding: { x: 12, y: 6 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Game'));

        backBtn.on('pointerover', () => backBtn.setStyle({ color: '#ffbb00' }));
        backBtn.on('pointerout', () => backBtn.setStyle({ color: '#ffffff' }));

        // 3. Dialogue / Info Popup Box at bottom
        this.dialogueBox = this.add.text(width / 2, height - 70, 'Click any interactable object to inspect it!', {
            fontFamily: 'Pixelify Sans, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: { x: 24, y: 12 },
            align: 'center',
            wordWrap: { width: width - 160 }
        }).setOrigin(0.5);

        // 4. Render Interactables
        const interactables = landmarkData?.interactables || [];
        interactables.forEach((item) => {
            // Interactive pedestal
            const itemBox = this.add.rectangle(item.x, item.y, 74, 74, 0xf37021)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(item.x, item.y - 48, item.label, {
                fontFamily: 'Pixelify Sans, sans-serif',
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#0021A5',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            // Hover effects
            itemBox.on('pointerover', () => {
                itemBox.setFillStyle(0xffa050);
                this.dialogueBox.setText(`Inspect: ${item.label}`);
                this.dialogueBox.setStyle({ color: '#38bdf8' });
            });

            itemBox.on('pointerout', () => {
                itemBox.setFillStyle(0xf37021);
            });

            // Click: Print message into dialogue box instead of alert()
            itemBox.on('pointerdown', () => {
                this.dialogueBox.setText(`${item.message || 'Nothing special here.'}`);
                this.dialogueBox.setStyle({ color: '#fde047' });
            });
        });
    }
}