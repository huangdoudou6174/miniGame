import { EventType } from "../GameSpecial/GameEventType";
import EventManager from "./EventManager";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";

//音效管理器
export default class AudioManager {
    /**音效资源 */
    private static allClips: { [key: string]: cc.AudioClip } = {};
    private static playingEffectCount: number = 0;
    /**可同时播放的最大音效数量 */
    private static maxEffectCount: number = 2;

    public static init() {
        this.playingEffectCount = 0;
        cc.audioEngine.setMusicVolume(1);
        cc.audioEngine.setEffectsVolume(1);
        this.onEvents();
    }
    private static onEvents() {
        EventManager.on(EventType.AudioEvent.playBGM, this.playBGM, this);
        EventManager.on(EventType.AudioEvent.playClickBtn, this.playClickBtn, this);
        EventManager.on(EventType.AudioEvent.playEffect, this.playEffect, this);
        EventManager.on(EventType.AudioEvent.stopBGM, this.stop, this);
    }

    private static playClickBtn() {
        this.playEffect(GlobalEnum.AudioClip.clickBtn);
    }

    private static playEffect(clip: string) {
        if (undefined === this.allClips[clip]) {
            cc.loader.loadRes(clip, cc.AudioClip, (err, res) => {
                if (err) {
                    this.allClips[clip] = null;
                    cc.warn("要播放的音效资源未找到：", clip);
                    return;
                }
                this.allClips[clip] = res;
                this._playEffect(clip);
            })
        } else {
            this._playEffect(clip);
        }
    }
    private static _playEffect(clip: string) {
        if (null === this.allClips[clip]) return;
        if (this.playingEffectCount < this.maxEffectCount) {
            let id = cc.audioEngine.play(this.allClips[clip], false, 1);
            cc.audioEngine.setFinishCallback(id, this._effectFinish.bind(this));
        }
    }
    private static _effectFinish() {
        this.playingEffectCount--;
        if (this.playingEffectCount < 0) this.playingEffectCount = 0;
    }
    private static playBGM(clip: string, loop: boolean = true) {
        if (undefined === this.allClips[clip]) {
            cc.loader.loadRes(clip, cc.AudioClip, (err, res) => {
                if (err) {
                    this.allClips[clip] = null;
                    cc.warn("要播放的音效资源未找到：", clip);
                    return;
                }
                this.allClips[clip] = res;
                this._playBGM(clip, loop);
            })
        } else {
            this._playBGM(clip, loop);
        }
    }
    private static _playBGM(clip: string, loop: boolean) {
        if (null === this.allClips[clip]) return;
        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(this.allClips[clip], loop);
    }
    private static stop() {
        cc.audioEngine.stopMusic();
    }
}
