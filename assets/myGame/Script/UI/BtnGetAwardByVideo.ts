import yyComponent from "../Common/yyComponent";
import GamePlatform from "../Platform/GamePlatform";

//观看视频领取奖励按钮
const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnGetAwardByVideo extends yyComponent {
    /**观看视频领取多倍奖励的复选框 */
    @property(cc.Toggle)
    protected video: cc.Toggle = null;
    /**按钮的精灵组件 */
    @property(cc.Sprite)
    protected btnSprite: cc.Sprite = null;
    /**显示视频icon的按钮图片 */
    @property(cc.SpriteFrame)
    protected showVideoIconBtn: cc.SpriteFrame = null;

    protected handler: { cb: Function, target: any };
    public init(handler: { cb: (video: boolean) => void, target: any }) {
        this.handler = handler;
        this.onEvents();
    }
    protected onEvents() {

    }
    /**按钮点击回调 */
    protected onClick() {
        if (!!this.handler) {
            this.handler.cb.call(this.handler.target, this.video.isChecked);
        }
    }

    public show() {
        this.node.active = true;
        this.setData();
    }
    protected setData() {
        let video = false;
        let str = cc.sys.localStorage.getItem("getAwardByVideo");
        if (!!str && !!JSON.parse(str)) {
            video = true;
        }
        if (!GamePlatform.instance.Config.video) {
            video = false;
        }
        this.setVideoToggle(video);
    }

    /**设置视频复选框的状态 */
    public setVideoToggle(checked: boolean) {
        this.video.isChecked = checked;
    }

    protected onVideoToggle() {
        cc.sys.localStorage.setItem("getAwardByVideo", this.video.isChecked);
    }
}
