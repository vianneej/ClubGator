import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { LocationScene } from './scenes/LocationScene';
import { AUTO, Game, Scale } from 'phaser';

const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_HORIZONTALLY
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        LocationScene,
        GameOver
    ]
};
const StartGame = (parent) => {
    return new Game({ ...config, parent });
}
export default StartGame;