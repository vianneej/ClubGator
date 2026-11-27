import { Scene } from 'phaser';
import { createPixelButton, playTransitionIn, playTransitionOut } from '../utils/pixelUi';

// Import images
import GlassesImg from '../../assets/Glasses.png';
import SunglassesImg from '../../assets/Sunglasses.png';
import WizardHatImg from '../../assets/WizardHat.png';
import BeanieImg from '../../assets/Beanie.png';
import BaseballCapImg from '../../assets/BaseballCap.png';
import CrownImg from '../../assets/Crown.png';
import MonocleImg from '../../assets/Monocle.png';
import BowImg from '../../assets/Bow.png';

export class CustomizationScene extends Scene {
    constructor() {
        super('CustomizationScene');
    }

    preload() {
        // Load all accessory images
        this.load.image('Glasses', GlassesImg);
        this.load.image('Sunglasses', SunglassesImg);
        this.load.image('WizardHat', WizardHatImg);
        this.load.image('Beanie', BeanieImg);
        this.load.image('BaseballCap', BaseballCapImg);
        this.load.image('Crown', CrownImg);
        this.load.image('Monocle', MonocleImg);
        this.load.image('Bow', BowImg);
    }

    create() {
        playTransitionIn(this);
        const { width, height } = this.scale;

        // Background
        this.cameras.main.setBackgroundColor(0x87ceeb);
        this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);

        // Title
        this.add.text(width / 2, 40, 'Customize Your Gator', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 24,
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // State
        this.selectedAccessories = {};
        this.currentPage = 0;
        this.gatorAccessories = {};
        this.itemsPerPage = 6;

        // Categories
        this.categories = [
            { name: 'Hats', key: 'hat', color: 0xf0a8d8 },
            { name: 'Glasses', key: 'glasses', color: 0xc5e1a5 },
            { name: 'Outfits', key: 'outfit', color: 0xffccbc },
            { name: 'Accessories', key: 'accessory', color: 0xffe0b2 }
        ];
        this.selectedCategory = 'hat';
        this.categoryTabs = {};

        // Create category tabs
        this.categories.forEach((cat, index) => {
            const y = 100 + index * 80;
            const tab = this.add.rectangle(45, y, 70, 60, cat.color)
                .setOrigin(0.5)
                .setStrokeStyle(this.selectedCategory === cat.key ? 3 : 1, 0x333333)
                .setInteractive({ useHandCursor: true });

            this.add.text(45, y, cat.name, {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: 11,
                color: '#333333'
            }).setOrigin(0.5).setWordWrapWidth(50);

            tab.on('pointerdown', () => this.selectCategory(cat.key));
            this.categoryTabs[cat.key] = tab;
        });

        // Gator preview area
        const previewX = width - 150;
        const previewY = height / 2;
        this.add.rectangle(previewX, previewY, 220, 300, 0xffffff).setStrokeStyle(3, 0x666666);
        this.add.text(previewX, previewY - 130, 'Preview', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 14,
            color: '#333333'
        }).setOrigin(0.5);

        // Gator
        this.gator = this.add.sprite(previewX, previewY + 20, 'gator-standing')
            .setScale(0.15)
            .setOrigin(0.5);

        // Accessory layer
        this.accessoryLayer = this.add.container(previewX, previewY + 20);

        // Items grid
        this.updateItemsGrid();

        // Back button
        createPixelButton(this, 50, 30, 'BACK', {
            variant: 'orange',
            width: 100,
            height: 36,
            fontSize: 11,
            depth: 20,
            onClick: () => this.goBack()
        });
    }

    selectCategory(categoryKey) {
        this.selectedCategory = categoryKey;
        this.currentPage = 0;

        Object.keys(this.categoryTabs).forEach(key => {
            this.categoryTabs[key].setStrokeStyle(key === categoryKey ? 3 : 1, 0x333333);
        });

        this.updateItemsGrid();
    }

    updateItemsGrid() {
        if (this.itemsContainer) {
            this.itemsContainer.destroy(true);
        }

        const itemsData = this.getItemsForCategory();
        const { width } = this.scale;
        this.itemsContainer = this.add.container(0, 0);

        const totalPages = Math.ceil(itemsData.length / this.itemsPerPage);
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, itemsData.length);
        const pageItems = itemsData.slice(startIndex, endIndex);

        const gridStartX = 150;
        const gridStartY = 150;
        const cols = 3;

        pageItems.forEach((item, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = gridStartX + col * 100;
            const y = gridStartY + row * 100;

            // Background box
            const bg = this.add.rectangle(x, y, 85, 85, 0xe8d5f2)
                .setOrigin(0.5)
                .setStrokeStyle(this.selectedAccessories[this.selectedCategory] === item.key ? 3 : 2,
                                this.selectedAccessories[this.selectedCategory] === item.key ? 0x0066ff : 0x9c88b8)
                .setInteractive({ useHandCursor: true });

            // Click handler
            bg.on('pointerdown', () => {
                this.selectedAccessories[this.selectedCategory] = item.key;
                this.applyToGator(item);
                this.updateItemsGrid();
            });

            this.itemsContainer.add(bg);

            // Display image
            if (item.texture) {
                const img = this.add.image(x, y - 15, item.texture)
                    .setOrigin(0.5)
                    .setDisplaySize(65, 65);
                this.itemsContainer.add(img);
            }

            // Label
            const label = this.add.text(x, y + 32, item.name, {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: 10,
                color: '#333333',
                align: 'center'
            }).setOrigin(0.5).setWordWrapWidth(75);
            this.itemsContainer.add(label);
        });

        // Pagination
        if (totalPages > 1) {
            const pageControlX = width / 2 - 100;
            const pageControlY = this.scale.height - 60;

            if (this.currentPage > 0) {
                createPixelButton(this, pageControlX, pageControlY, '<', {
                    variant: 'blue',
                    width: 40,
                    height: 40,
                    fontSize: 16,
                    onClick: () => { this.currentPage--; this.updateItemsGrid(); }
                });
            }

            this.add.text(pageControlX + 50, pageControlY + 8, `${this.currentPage + 1} / ${totalPages}`, {
                fontFamily: 'Pixelify Sans, monospace',
                fontSize: 12,
                color: '#333333'
            }).setOrigin(0.5);

            if (this.currentPage < totalPages - 1) {
                createPixelButton(this, pageControlX + 100, pageControlY, '>', {
                    variant: 'blue',
                    width: 40,
                    height: 40,
                    fontSize: 16,
                    onClick: () => { this.currentPage++; this.updateItemsGrid(); }
                });
            }
        }

        this.add.existing(this.itemsContainer);
    }

    applyToGator(item) {
        // Remove old accessory
        if (this.gatorAccessories[this.selectedCategory]) {
            this.gatorAccessories[this.selectedCategory].destroy();
        }

        // Add new accessory
        if (item.texture) {
            const accessory = this.add.image(0, -40, item.texture)
                .setOrigin(0.5)
                .setDisplaySize(90, 90);
            this.accessoryLayer.add(accessory);
            this.gatorAccessories[this.selectedCategory] = accessory;
        }
    }

    getItemsForCategory() {
        const items = {
            hat: [
                { name: 'None', key: 'none', texture: null },
                { name: 'Wizard Hat', key: 'wizard-hat', texture: 'WizardHat' },
                { name: 'Beanie', key: 'beanie', texture: 'Beanie' },
                { name: 'Ball Cap', key: 'ball-cap', texture: 'BaseballCap' },
                { name: 'Crown', key: 'crown', texture: 'Crown' }
            ],
            glasses: [
                { name: 'None', key: 'none', texture: null },
                { name: 'Glasses', key: 'glasses', texture: 'Glasses' },
                { name: 'Sunglasses', key: 'sunglasses', texture: 'Sunglasses' },
                { name: 'Monocle', key: 'monocle', texture: 'Monocle' }
            ],
            outfit: [
                { name: 'None', key: 'none', texture: null }
            ],
            accessory: [
                { name: 'None', key: 'none', texture: null },
                { name: 'Bow', key: 'bow', texture: 'Bow' }
            ]
        };

        return items[this.selectedCategory] || [];
    }

    goBack() {
        playTransitionOut(this, () => {
            this.registry.set('selectedAccessories', this.selectedAccessories);
            this.scene.start('Game');
        });
    }
}
