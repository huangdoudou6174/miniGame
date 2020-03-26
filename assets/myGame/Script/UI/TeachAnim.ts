import yyComponent from "../Common/yyComponent";
import GameConfig from "../GameSpecial/GameConfig";
import { EventType } from "../GameSpecial/GameEventType";

//教学动画
const { ccclass, property } = cc._decorator;

@ccclass
export default class TeachAnim extends yyComponent {

    @property(cc.Node)
    protected tip: cc.Node = null;

    public onLoad() {
        this.onEvents();
        this.play();
    }
    protected onEvents() {
        this.on(EventType.DirectorEvent.playerWin, this.hide, this);
        this.on(EventType.DirectorEvent.playerLose, this.hide, this);
        this.on(EventType.CtrlEvent.ctrlStart, this.show, this);
        
    }
    public hide() {
        cc.sys.localStorage.setItem(GameConfig.gameName + "teached", JSON.stringify(true));
        this.stop();
        this.node.active = false;
    }
    public show() {
        this.node.active = true;
        this.play();
    }
    protected onTouchEnd() {
        this.teachFinish();
    }
    protected teachFinish() {
        cc.sys.localStorage.setItem(GameConfig.gameName + "teached", JSON.stringify(true));
        this.hide();
    }
    protected play() {
        // this.tip.stopAllActions();
        // this.tip.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(1), cc.fadeOut(1))));
    }
    protected stop() {
        // this.tip.stopAllActions();
    }
}
