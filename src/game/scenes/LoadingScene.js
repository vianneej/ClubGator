import { Scene } from 'phaser';
import { buildLoadingBackdrop, playTransitionIn, playTransitionOut } from '../utils/pixelUi';

export class LoadingScene extends Scene {
    constructor() {
        super('LoadingScene');
    }

    init(data) {
        this.targetScene = data?.targetScene || 'Game';
        this.targetData = data?.targetData || {};
        this.subtitle = data?.subtitle || '';
        this.durationMs = Math.min(data?.durationMs || 1200, 2600);
    }

    create() {
        this._isTransitioning = false;
        this._didFinish = false;
        const { updateProgress } = buildLoadingBackdrop(this, {
            subtitle: this.subtitle,
            showBar: true
        });

        playTransitionIn(this);

        const finish = () => {
            if (this._didFinish) return;
            this._didFinish = true;
            playTransitionOut(this, () => {
                this.scene.start(this.targetScene, this.targetData);
            });
        };

        // 4s max for loading screen
        this.time.delayedCall(3350, finish);

        const state = { progress: 0 };
        this.tweens.add({
            targets: state,
            progress: 1,
            duration: this.durationMs,
            ease: 'Sine.easeInOut',
            onUpdate: () => updateProgress(state.progress),
            onComplete: finish
        });
    }
}
