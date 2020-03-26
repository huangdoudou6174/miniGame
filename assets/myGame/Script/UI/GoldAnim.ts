import yyComponent from "../Common/yyComponent";
import GlobalPool from "../Common/GlobalPool";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import { EventType } from "../GameSpecial/GameEventType";
import PlayerAssetBar from "./PlayerAssetBar";

//金币动画层
const { ccclass, property } = cc._decorator;

@ccclass
export default class GoldAnim extends yyComponent {

    @property(cc.Node)
    protected goldLayer: cc.Node = null;
    @property(cc.Node)
    protected touchMask: cc.Node = null;
    @property(cc.Prefab)
    protected goldIconPrefab: cc.Prefab = null;

    protected targetPos: cc.Vec2;
    protected cb: Function;

    public start() {
        this.init();
    }

    public init() {
        this.targetPos = cc.v2(0, 0);
        this.cb = null;
        this.touchMask.active = false;
        GlobalPool.createPool(GlobalEnum.LevelPrefab.goldIcon, this.goldIconPrefab);
        this.onEvents();
    }
    protected onEvents() {
        this.on(EventType.UIEvent.playGoldAmin, this.play, this);
    }
    public reset() {
        this.cb = null;
        this.touchMask.active = false;
        for (let i = this.goldLayer.childrenCount - 1; i >= 0; --i) {
            this.goldLayer.children[i].stopAllActions();
            GlobalPool.put(this.goldLayer.children[i], GlobalEnum.LevelPrefab.goldIcon);
        }
    }

    protected play(data: { targetPos: cc.Vec2, cb: Function }) {
        this.reset();
        this.touchMask.active = true;
        if (!!data.targetPos) {
            this.targetPos.set(data.targetPos);
        } else {
            this.targetPos.set(PlayerAssetBar.goldPos);
        }
        this.cb = data.cb;
        let x = 0;
        let y = 0;
        let duration = 0.2;
        let count = Math.round(Math.random() * 10) + 20;
        for (let i = 0; i < count; i++) {
            let item = GlobalPool.get(GlobalEnum.LevelPrefab.goldIcon);
            this.goldLayer.addChild(item);
            item.setPosition(0, 0);
            item.setScale(1, 1);
            let action = cc.moveTo(duration, x + (Math.random() - 0.5) * 250, y + (Math.random() - 0.5) * 250);
            action.easing(cc.easeOut(2));
            item.runAction(action);
        }
        this.scheduleOnce(this.toTarget, duration);
    }
    protected toTarget() {
        let duration = 0.8;
        let action = cc.spawn(cc.scaleTo(duration, 0.5, 0.5), cc.moveTo(duration, this.targetPos)) as cc.ActionInterval;
        action.easing(cc.easeIn(2));
        let delay = 0.005;
        let totalDelay = this.goldLayer.childrenCount * delay;
        for (let i = this.goldLayer.childrenCount - 1; i >= 0; --i) {
            this.goldLayer.children[i].runAction(cc.sequence(cc.delayTime(totalDelay - i * delay), action.clone()));
        }
        this.scheduleOnce(this.playFinish, duration + totalDelay);
    }
    protected playFinish() {
        if (!!this.cb) {
            this.cb();
        } else {
            this.emit(EventType.UIEvent.goldAnimPlayFinish);
        }
        this.reset();
    }
}
