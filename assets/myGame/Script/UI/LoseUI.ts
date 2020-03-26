import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";
import { IUI } from "./IUI";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import GamePlatform from "../Platform/GamePlatform";
import { GamePlatformType } from "../Platform/GamePlatformType";
import BtnGetAwardByVideo from "./BtnGetAwardByVideo";
import UIManager from "../Common/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoseUI extends yyComponent implements IUI {

    /**场景/UI类型 */
    public get uiType() { return this._uiType; }
    protected _uiType: GlobalEnum.UI = GlobalEnum.UI.loseUI;

    @property(cc.Label)
    protected baseGoldLabel: cc.Label = null;
    protected baseGold: number;

    /**领取按钮 */
    @property(cc.Node)
    protected btnGetAwardNode: cc.Node = null;
    protected btnGetAward: BtnGetAwardByVideo;
    @property(cc.Node)
    protected btnReplay: cc.Node = null;
    @property(cc.Node)
    protected btnComeBackLobby: cc.Node = null;
    @property(cc.Node)
    protected btnShareVideo: cc.Node = null;
    @property(cc.Label)
    protected shareGold: cc.Label = null;

    protected acceptedGold: boolean = false;

    protected data: any;

    public init() {
        this.acceptedGold = false;
        this.btnGetAward = this.btnGetAwardNode.getComponent(BtnGetAwardByVideo);
        this.btnGetAward.init({
            cb: this.onBtnGetAward,
            target: this
        });
        let wg = this.btnReplay.getComponent(cc.Widget);
        if (!!wg) {
            wg.isAlignBottom = false;
            wg.isAlignVerticalCenter = false;
        }
    }
    public reset() {
        this.acceptedGold = false;
    }
    /**
     * 显示UI
     * @param data 关卡成绩
     */
    public show(data: any) {
        this.reset();
        if (!data) {
            let ui = UIManager.getUI(GlobalEnum.UI.levelInfo);
            if (!ui) {
                console.error("获取关卡信息UI脚本失败，无法显示胜利界面！");
            } else {
                data = ui.getData();
            }
        }
        this.node.active = true;
        // this.btnGetGold.active = true;
        this.btnReplay.active = false;
        this.btnComeBackLobby.active = false;
        let toBig = cc.scaleTo(0.5, 1, 1);
        toBig.easing(cc.easeInOut(2));
        let toSmall = cc.scaleTo(0.5, 0.9, 0.9);
        toSmall.easing(cc.easeInOut(2));
        //头条平台打开分享录屏按钮
        if (GamePlatform.instance.Config.type == GamePlatformType.TT) {
            this.btnShareVideo.active = true;
            this.btnShareVideo.setScale(1, 1);
            this.btnShareVideo.runAction(cc.repeatForever(cc.sequence(toBig.clone(), toSmall.clone())));
        } else {
            this.btnShareVideo.active = false;
        }
        this.btnGetAward.show();
        this.setData(data);
        this.emit(EventType.UIEvent.entered, this.uiType);
    }
    public hide() {
        if (this.btnShareVideo.active) {
            this.btnShareVideo.stopAllActions();
        }
        this.node.active = false;
        this.emit(EventType.UIEvent.exited, this.uiType);
    }


    protected setData(data: any) {
        this.data = data;

        this.baseGold = data.gold;
        this.baseGoldLabel.string = this.baseGold.toString();

    }

    protected getTotalGold(): number {
        return this.baseGold;
    }

    //返回首页
    protected onBtnLobby() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.addGold(this.getTotalGold(), () => {
            this.emit(EventType.DirectorEvent.enterLobby, this);
        });
    }
    //重玩
    protected onBtnReplay() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.emit(EventType.DirectorEvent.replayCurLevel);
    }

    /**显示banner或插屏广告 */
    protected showBannerOrInsertAd() {
        this.emit(EventType.SDKEvent.showBanner);
    }

    /**设置按钮坐标为常规状态 */
    protected setBtnsPosNormal() {
        this.btnReplay.y = 310 + this.btnReplay.height * this.btnReplay.anchorY - this.node.height * this.node.anchorY;
    }

    /**
     * 领取按钮点击回调
     * @param showVideo 是否观看视频领取三倍奖励
     */
    protected onBtnGetAward(showVideo: boolean) {
        if (!!showVideo) {
            if (GamePlatform.instance.Config.video) {
                this.onBtnVideo();
            } else {
                this.emit(EventType.UIEvent.showTip, "暂时没有视频哦~");
                this.onBtnGetGold();
            }
        } else {
            this.onBtnGetGold();
        }
    }

    //视频三倍
    protected onBtnVideo() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.emit(EventType.SDKEvent.showVideo, this.onVideoFinish.bind(this));
    }
    protected onVideoFinish() {
        this.addGold(this.getTotalGold() * 3, this.onGetGoldFinish.bind(this));
    }
    protected onGetGoldFinish() {
        //隐藏领取按钮，显示返回和重玩按钮
        this.btnGetAwardNode.active = false;
        this.btnReplay.active = true;
        this.btnComeBackLobby.active = true;
        this.setBtnsPosNormal();
        this.showBannerOrInsertAd();
    }
    //普通领取
    protected onBtnGetGold() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.addGold(this.getTotalGold(), this.onGetGoldFinish.bind(this));
    }

    protected addGold(gold: number, cb: Function) {
        if (this.acceptedGold) {
            cb();
            return;
        }
        this.acceptedGold = true;
        this.emit(EventType.UIEvent.playGoldAmin, {
            cb: () => {
                this.emit(EventType.PlayerDataEvent.updatePlayerData, {
                    type: "gameData",
                    attribute: "gameData.asset.gold",
                    value: gold,
                    mode: "+"
                });
                cb();
            }
        })
    }

    //头条平台录屏分享
    protected onBtnShareVideo() {
        this.emit(EventType.SDKEvent.shareRecord, this.onShareVideoFinish.bind(this));
    }
    protected onShareVideoFinish() {
        this.btnShareVideo.stopAllActions();
        this.btnShareVideo.active = false;
    }
}
