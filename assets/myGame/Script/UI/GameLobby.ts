import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";
import PlayerData from "../Common/PlayerData";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLobby extends yyComponent {

    /**场景/UI类型 */
    public get uiType() { return this._uiType; }
    protected _uiType: GlobalEnum.UI = GlobalEnum.UI.lobby;

    @property(cc.Label)
    protected curLevel: cc.Label = null;

    public init() {
        this.updateCurLevel();
        this.onEvents();
    }
    protected onEvents() {
        this.on(EventType.PlayerDataEvent.playerDataChanged, this.updateCurLevel, this);
    }
    public reset() {
    }

    public show() {
        console.log("显示lobby");
        this.node.active = true;
        this.emit(EventType.AudioEvent.playBGM, GlobalEnum.AudioClip.BGM, true);
        this.emit(EventType.SDKEvent.showBanner);
        this.emit(EventType.UIEvent.entered, this.uiType);
    }
    public hide() {
        this.node.active = false;
        this.emit(EventType.UIEvent.exited, this.uiType);
    }

    protected updateCurLevel() {
        let lv = PlayerData.getData("gameData.curLevel");
        this.curLevel.string = lv.toString();
    }

    protected onBtnStartGame() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.emit(EventType.DirectorEvent.startGame);
    }

    protected onBtnShop() {
        this.emit(EventType.AudioEvent.playClickBtn);
        this.emit(EventType.UIEvent.enter, GlobalEnum.UI.shop);
    }

}
