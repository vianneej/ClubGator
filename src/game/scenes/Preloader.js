import { Scene } from 'phaser';
import grassImg from '../../assets/grass_2d_strip_clean.png';
import skyImg from '../../assets/sky_background.png';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');

        // Absolute Vite URLs — clear path so it is not prefixed with "assets/"
        this.load.setPath('');
        this.load.image('sky', skyImg);
        this.load.image('grass', grassImg);
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
