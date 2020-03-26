import yyComponent from "./yyComponent";
import { EventType } from "../GameSpecial/GameEventType";

//信息提示节点
const { ccclass, property } = cc._decorator;

@ccclass
export default class TipMessage extends yyComponent {

    @property(cc.Label)
    private msg: cc.Label = null;
    @property(cc.Node)
    private bg: cc.Node = null;
    @property(cc.Node)
    private tipNode: cc.Node = null;

    private action: cc.Action = null;

    onLoad() {
        this.init();
    }
    public init() {
        this.action = cc.sequence(cc.delayTime(1), cc.fadeOut(0.5), cc.callFunc(this.onFadeOut, this));
        this.setMsg("");
        this.onEvents();
        this.hide();
    }
    protected onEvents() {
        this.on(EventType.UIEvent.showTip, this.show, this);
    }
    public reset() {
        this.tipNode.active = true;
        this.tipNode.stopAllActions();
        this.tipNode.opacity = 0;
    }
    public show(msg: string) {
        this.reset();
        this.node.active = true;
        this.setMsg(msg);
        this.scheduleOnce(this.play.bind(this), 0);
    }
    public hide() {
        this.node.active = false;
    }

    private setMsg(msg: string) {
        this.msg.string = msg;
    }
    private play() {
        this.tipNode.opacity = 255;
        this.tipNode.runAction(this.action);
    }
    private onFadeOut() {
        this.hide();
    }
}
