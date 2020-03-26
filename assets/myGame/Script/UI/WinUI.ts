import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";
import { IUI } from "./IUI";
import PlayerData from "../Common/PlayerData";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import GamePlatform from "../Platform/GamePlatform";
import { GamePlatformType } from "../Platform/GamePlatformType";
import BtnGetAwardByVideo from "./BtnGetAwardByVideo";
import UIManager from "../Common/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinUI extends yyComponent implements IUI {

    /**场景/UI类型 */
    public get uiType() { return this._uiType; }
    protected _uiType: GlobalEnum.UI = GlobalEnum.UI.winUI;

    /**金币 */
    @property(cc.Label)
    protected baseGoldLabel: cc.Label = null;
    protected baseGold: number;

    @property(cc.Label)
    protected speGoldLabel: cc.Label = null;
    protected speGold: number;

    @property(cc.Label)
    protected totalGoldLabel: cc.Label = null;

    //一个按钮根据是否勾选选择视频领取的方案：
    /**领取按钮 */
    @property(cc.Node)
    protected btnGetAwardNode: cc.Node = null;
    protected btnGetAward: BtnGetAwardByVideo;

    //视频与普通领取分开的方案：
    /**单倍领取 */
    @property(cc.Node)
    protected btnGetAwardSingle: cc.Node = null;
    /**视频领取 */
    @property(cc.Node)
    protected btnVideo: cc.Node = null;

    /**下一关按钮 */
    @property(cc.Node)
    protected btnNextLevel: cc.Node = null;
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
        if (!!this.btnGetAwardNode) {
            this.btnGetAward = this.btnGetAwardNode.getComponent(BtnGetAwardByVideo);
            this.btnGetAward.init({
                cb: this.onBtnGetAward,
                target: this
            });
        }
        let wg = this.btnNextLevel.getComponent(cc.Widget);
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
    public show(data?: any) {
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
        this.btnNextLevel.active = false;
        this.btnComeBackLobby.active = false;
        let toBig = cc.scaleTo(0.5, 1, 1);
        toBig.easing(cc.easeInOut(2));
        let toSmall = cc.scaleTo(0.5, 0.9, 0.9);
        toSmall.easing(cc.easeInOut(2));
        //头条平台打开分享录屏按钮
        if (!!this.btnShareVideo) {
            if (GamePlatform.instance.Config.type == GamePlatformType.TT) {
                this.btnShareVideo.active = true;
                this.btnShareVideo.setScale(1, 1);
                this.btnShareVideo.runAction(cc.repeatForever(cc.sequence(toBig.clone(), toSmall.clone())));
            } else {
                this.btnShareVideo.active = false;
            }
        }
        //领取按钮:
        this.showBtnGetAward();

        this.setData(data);
        this.emit(EventType.UIEvent.entered, this.uiType);
    }
    protected showBtnGetAward() {
        if (!!this.btnGetAward) {
            this.btnGetAward.show();
        } else {
            this.btnGetAwardSingle.active = true;
            this.btnVideo.active = true;
        }
    }
    protected hideBtnGetAward() {
        if (!!this.btnGetAward) {
            this.btnGetAward.hide();
        } else {
            this.btnGetAwardSingle.active = false;
            this.btnVideo.active = false;
        }
    }

    public hide() {
        if (!!this.btnShareVideo) {
            this.btnShareVideo.stopAllActions();
        }
        this.node.active = false;
        this.emit(EventType.UIEvent.exited, this.uiType);
    }

    protected setData(data: any) {
        this.data = data;
        this.baseGold = data.baseGold;
        this.baseGoldLabel.string = this.baseGold.toString();

        this.speGold = data.speGold;
        this.speGoldLabel.string = this.speGold.toString();

        this.totalGoldLabel.string = this.getTotalGold().toString();
    }

    protected getTotalGold(): number {
        return this.baseGold + this.speGold;
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
        this.addGold(this.getTotalGold() * 5, this.onGetGoldFinish.bind(this));
    }
    //普通领取
    protected onBtnGetGold() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.addGold(this.getTotalGold(), this.onGetGoldFinish.bind(this));
    }

    //下一关
    protected onBtnNextLevel() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.emit(EventType.DirectorEvent.playNextLevel);
    }

    //金币领取完成后显示下一关和返回首页按钮
    protected onGetGoldFinish() {
        // this.btnGetAwardNode.active = false;
        this.hideBtnGetAward();
        this.btnNextLevel.active = true;
        this.btnComeBackLobby.active = true;
        this.setBtnsPosNormal();
        this.showBannerOrInsertAd();
    }
    /**显示banner或插屏广告 */
    protected showBannerOrInsertAd() {
        this.emit(EventType.SDKEvent.showBanner);
    }

    /**设置按钮坐标为常规状态 */
    protected setBtnsPosNormal() {
        this.btnNextLevel.y = 310 + this.btnNextLevel.height * this.btnNextLevel.anchorY - this.node.height * this.node.anchorY;
    }

    /**播放金币动画获得金币 */
    protected addGold(gold: number, cb: Function) {
        if (this.acceptedGold) {
            !!cb && cb();
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
                !!cb && cb();
            }
        })
    }

    //返回首页
    protected onBtnReturnLobby() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.addGold(this.getTotalGold(), () => {
            this.emit(EventType.DirectorEvent.enterLobby, this);
        });
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
