import { Scene } from 'phaser';
import grassImg from '../../assets/grass_2d_strip_clean.png';
import skyImg from '../../assets/sky_background.png';
import gatorStandingImg from '../../assets/GatorStanding.png';
import gatorLeft1Img from '../../assets/GatorLeft1.png';
import gatorLeft2Img from '../../assets/GatorLeft2.png';
import gatorRight1Img from '../../assets/GatorRight1.png';
import gatorRight2Img from '../../assets/GatorRight2.png';

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
        this.load.image('gator-standing', gatorStandingImg);
        this.load.image('gator-left-1', gatorLeft1Img);
        this.load.image('gator-left-2', gatorLeft2Img);
        this.load.image('gator-right-1', gatorRight1Img);
        this.load.image('gator-right-2', gatorRight2Img);
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
