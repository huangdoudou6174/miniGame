// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const fuzzyTime = "time";
@ccclass
export default class FuzzyEffect extends cc.Component {

    @property(cc.MeshRenderer)
    protected mesh: cc.MeshRenderer = null;
    protected fuzzyMat: cc.Material = null;
    onLoad() {
        this.fuzzyMat = this.mesh.getMaterial(0);
        this.stop();
        this.clear();
    }

    protected spd: number = 0.5;
    /**设置模糊效果的播放速度 */
    public setSpeed(spd: number) {
        if (undefined !== spd) this.spd = spd;
    }

    protected _playing: boolean = false;
    public get playing() { return this._playing; }
    public play(spd?: number) {
        this._playing = true;
        if (undefined !== spd) {
            this.spd = spd;
        }
        this.elapse = -1;
    }
    /**停止播放模糊效果，但不会清除当前已渲染的模糊效果 */
    public stop() {
        this._playing = false;
    }
    /**清空模糊效果 */
    public clear() {
        this.elapse = -1.0;
        this.fuzzyMat.setProperty(fuzzyTime, this.elapse);
    }

    protected elapse: number = -1;
    update(dt) {
        if (!this._playing) return;
        this.elapse += dt * this.spd;
        this.fuzzyMat.setProperty(fuzzyTime, this.elapse);
    }
}
