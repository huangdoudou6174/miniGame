import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";

const { ccclass, property } = cc._decorator;
/**加载进度条UI */
@ccclass
export default class LoadingUI extends yyComponent {

    @property(cc.Node)
    protected progressNode: cc.Node = null;
    protected progress: cc.ProgressBar;
    @property(cc.Label)
    protected rate: cc.Label = null;
    @property(cc.Node)
    protected mask: cc.Node = null;

    onLoad() {
        this.init();
    }

    public init() {
        this.progress = this.progressNode.getComponent(cc.ProgressBar);
        this.onHideProgress();
        this.onEvents();
    }

    protected onEvents() {
        this.on(EventType.LoadAssetEvent.showProgress, this.onShowProgress, this);
        this.on(EventType.LoadAssetEvent.updateProgress, this.onUpdateProgress, this);
        this.on(EventType.LoadAssetEvent.hideProgress, this.onHideProgress, this);
    }

    protected onShowProgress(rate: number) {
        this.mask.active = true;
        this.progressNode.active = true;
        this.progress.progress = rate;
        this.rate.string = (rate * 100).toFixed(2) + "%";
    }

    protected onUpdateProgress(rate: number) {
        this.progress.progress = rate;
        this.rate.string = (rate * 100).toFixed(2) + "%";
    }

    protected onHideProgress() {
        this.mask.active = false;
        this.progressNode.active = false;
    }

}
