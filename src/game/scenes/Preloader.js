import { Scene } from 'phaser';
import { buildLoadingBackdrop, playTransitionOut } from '../utils/pixelUi';
import grassImg from '../../assets/grass_2d_strip_clean.png';
import skyImg from '../../assets/sky_background.png';
import gatorStandingImg from '../../assets/GatorStanding.png';
import gatorLeft1Img from '../../assets/GatorLeft1.png';
import gatorLeft2Img from '../../assets/GatorLeft2.png';
import gatorRight1Img from '../../assets/GatorRight1.png';
import gatorRight2Img from '../../assets/GatorRight2.png';
import reitzUnionImg from '../../assets/reitz_union_pixel.jpg';
import centuryTowerImg from '../../assets/century_tower_pixel.jpg';
import libraryWestImg from '../../assets/library_west_pixel.jpg';
import plazaAmericasImg from '../../assets/plaza_americas_pixel.jpg';
import marstonLibraryImg from '../../assets/marston_library_pixel.jpg';
import lakeAliceImg from '../../assets/lake_alice_pixel.jpg';
import footballStadiumImg from '../../assets/football_stadium_pixel.jpg';
import sportsArenaImg from '../../assets/sports_arena_pixel.jpg';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this._isTransitioning = false;
        this._startedAt = Date.now();
        const { updateProgress } = buildLoadingBackdrop(this, {
            subtitle: 'Entering Campus',
            showBar: true
        });

        this.load.on('progress', (progress) => {
            updateProgress(progress);
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
        this.load.image('reitz-union', reitzUnionImg);
        this.load.image('century-tower', centuryTowerImg);
        this.load.image('library-west', libraryWestImg);
        this.load.image('plaza-americas', plazaAmericasImg);
        this.load.image('marston-library', marstonLibraryImg);
        this.load.image('lake-alice', lakeAliceImg);
        this.load.image('football-stadium', footballStadiumImg);
        this.load.image('sports-arena', sportsArenaImg);
    }

    create ()
    {
        const elapsed = Date.now() - (this._startedAt || Date.now());
        // keep total preloading time (including exit transition) under 4s max
        const remainingDelay = Math.max(0, Math.min(650, 3350 - elapsed));

        this.time.delayedCall(remainingDelay, () => {
            playTransitionOut(this, () => {
                this.scene.start('Game');
            });
        });
    }
}
