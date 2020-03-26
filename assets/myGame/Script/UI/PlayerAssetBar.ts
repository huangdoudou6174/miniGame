import yyComponent from "../Common/yyComponent";
import { IUI } from "./IUI";
import PlayerData from "../Common/PlayerData";
import { EventType } from "../GameSpecial/GameEventType";

//玩家的金币体力等资产信息条
const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerAssetBar extends yyComponent implements IUI {
    @property(cc.Label)
    protected goldLabel: cc.Label = null;

    protected static _goldPos: cc.Vec2 = cc.v2(0, 0);
    public static get goldPos(): cc.Vec2 { return this._goldPos; }

    public init() {
        let pos = this.goldLabel.node.convertToWorldSpaceAR(cc.v2(0, 0));
        pos = this.node.convertToNodeSpaceAR(pos);
        PlayerAssetBar._goldPos.set(pos);
        this.onEvents();
    }
    protected onEvents() {
        this.on(EventType.PlayerDataEvent.playerDataChanged, this.onPlayerDataChanged, this);
    }
    public reset() {

    }

    public show() {
        this.node.active = true;
        this.setData();
        this.onEvents();
    }
    public hide() {
        this.offEvents();
        this.node.active = false;
    }

    protected setData() {
        let data = PlayerData.getData("gameData.asset");
        this.setGold(data.gold);
    }
    protected setGold(gold: number) {
        this.goldLabel.string = this.convertToString(gold);
    }
    protected convertToString(v: number) {
        if (v < 1100) return v.toString();
        if (v < 1000000) return (v * 0.001).toFixed(1) + "K";
        return (v * 0.000001).toFixed(1) + "M";
    }

    protected onPlayerDataChanged(data) {
        switch (data.attribute) {
            case "gameData.asset.gold": {
                this.setGold(data.value);
                break;
            }
        }
    }
}
