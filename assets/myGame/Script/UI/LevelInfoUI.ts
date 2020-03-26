import yyComponent from "../Common/yyComponent";
import { IUI } from "../UI/IUI";
import GlobalPool from "../Common/GlobalPool";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import { EventType } from "../GameSpecial/GameEventType";
import PlayerData from "../Common/PlayerData";

//关卡进度分数等信息UI
const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelInfoUI extends yyComponent implements IUI {

    public get uiType() { return GlobalEnum.UI.levelInfo; }

    //关卡
    @property(cc.Label)
    protected curLevelLabel: cc.Label = null;
    @property(cc.Label)
    protected nextLevelLabel: cc.Label = null;
    //关卡进度
    @property(cc.ProgressBar)
    protected levelProgressBar: cc.ProgressBar = null;
    protected targetProgress: number = 0;

    //金币
    @property(cc.Label)
    protected curGoldLabel: cc.Label = null;
    protected curGold: number = 0;


    public init() {
        // this.levelProgressBar.progress = 0;
        // this.curGoldLabel.string = "0";
        this.onEvents();
    }
    protected onEvents() {
    }
    public reset() {
        this.resetGold();
        this.resetProgress();
    }
    protected resetGold() {
        this.curGold = 0;
        this.updateGoldLabel();
    }
    protected resetProgress() {
        this.targetProgress = 0;
        // this.levelProgressBar.progress = 0;
    }
    public show(levelData?: any) {
        this.node.active = true;
        this.reset();
        this.setData(levelData);
    }
    public hide() {
        this.node.active = false;
    }

    /**
     * 获取关卡信息数据
     */
    public getData() {
        return {
            baseGold: 0,
            speGold: 0,
            gold: 0
        };
    }

    protected setData(data?: any) {
        // let lv = PlayerData.getData("gameData.curLevel");
        // this.curLevelLabel.string = lv.toString();
        // this.nextLevelLabel.string = (lv + 1).toString();

    }

    protected updateProgress() {

        if (this.targetProgress > 1) {
            this.targetProgress = 1;
        }
    }

    //增加金币
    protected addGold(gold: number) {
        this.curGold += gold;
        this.updateGoldLabel();

    }
    protected updateGoldLabel() {
        // this.curGoldLabel.string = this.convertToString(this.curGold);
    }
    protected convertToString(v: number): string {
        if (v < 1100) return v.toString();
        if (v < 1100000) return (v * 0.001).toFixed(1) + "K";
        return (v * 0.000001).toFixed(1) + "M";
    }

    // public update(dt: number) {
    //     let offset = this.targetProgress - this.levelProgressBar.progress;
    //     if (offset < 0) {
    //         this.levelProgressBar.progress = this.targetProgress;
    //         return;
    //     }
    //     if (offset == 0) return;
    //     offset *= 0.1;
    //     if (offset < 0.001) {
    //         offset = this.targetProgress - this.levelProgressBar.progress;
    //     }
    //     this.levelProgressBar.progress += offset;
    // }


    //测试用：重置关卡
    protected onBtnReplay() {
        this.emit(EventType.DirectorEvent.replayCurLevel);
    }

    protected paused: boolean = false;
    protected onBtnPause() {
        if (this.paused) {
            this.paused = false;
            this.emit(EventType.DirectorEvent.resumeLevel);
        } else {
            this.paused = true;
            this.emit(EventType.DirectorEvent.pauseLevel);
        }
    }

    protected onBtnLobby() {
        this.emit(EventType.DirectorEvent.enterLobby);
    }
}
