import EventManager from "../../Common/EventManager";
import { EventType } from "../../GameSpecial/GameEventType";
import GamePlatform from "../GamePlatform";



const { ccclass, property } = cc._decorator;

@ccclass
export default class SDK extends cc.Component {
    /**
     * 分享游戏时的描述
     */
    protected shareTitleArr = [
        '',
        ''
    ]
    /**
     * 分享游戏时的图片
     */
    protected shareImgArr = [
        '',
        ''
    ]

    /**
     * 手机信息
     */
    protected systemInfo: any;

    /**
     * 当前平台api
     */
    protected api: any;

    /**
     * 初始化
     */
    public init() { }

    public onEvents() {
        EventManager.on(EventType.SDKEvent.showBanner, this.showBanner, this);
        EventManager.on(EventType.SDKEvent.hideBanner, this.removeBanner, this);
        EventManager.on(EventType.SDKEvent.showVideo, this.showVideo, this);
        EventManager.on(EventType.SDKEvent.startRecord, this.startRecord, this);
        EventManager.on(EventType.SDKEvent.stopRecord, this.stopRecord, this);
        EventManager.on(EventType.SDKEvent.shareRecord, this.shareRecord, this);
        EventManager.on(EventType.SDKEvent.showMsg, this.showMessage, this);
        EventManager.on(EventType.SDKEvent.showInsertAd, this.showInterstitialAd, this);
        EventManager.on(EventType.SDKEvent.navigateToMiniProgram, this.navigateToMiniProgram, this);
        EventManager.on(EventType.SDKEvent.vibrateLong, this.vibrateLong, this);
        EventManager.on(EventType.SDKEvent.vibrateShort, this.vibrateShort, this);
    }

    private startRecord() {
        this.recordVideo("start");
    }

    private stopRecord() {
        this.recordVideo("stop");
    }

    private shareRecord(success: Function, fail: Function = null) {
        this.shareRecordVideo(success, fail);
    }

    protected videoAd: any;
    /**
     * 视频广告
     * @param success   广告观看完毕的回调
     * @param quit      中途退出广告观看的回调
     * @param fail      广告加载失败的回调
     */
    public showVideo(success: Function, quit?: Function, fail?: Function) { success() }
    /**获取视频广告id */
    protected getVideoAdUnitId(): string {
        if (!GamePlatform.instance.Config.video) {
            console.log("广告开关未打开");
            return null;
        }
        if (!GamePlatform.instance.Config.videoAdUnitId || !GamePlatform.instance.Config.videoAdUnitId[0]) {
            console.log("广告参数未填写");
            return null;
        }
        return GamePlatform.instance.Config.videoAdUnitId[0];
    }
    /**视频广告观看完毕回调 */
    protected videoSuccess: Function;
    /**视频广告加载失败回调 */
    protected videoFail: Function;
    /**视频广告中途退出回调 */
    protected videoQuit: Function;
    protected onVideoSuccess() {
        let cb = this.videoSuccess;
        this.resetVideoCb();
        if (!!cb) {
            cb();
        }
    }
    protected onVideoFail(err) {
        console.log("视频广告加载出错：", err);
        let cb = this.videoFail;
        this.resetVideoCb();
        if (!!cb) {
            cb();
        }
    }
    protected onVideoQuit() {
        let cb = this.videoQuit;
        this.resetVideoCb();
        if (!!cb) {
            cb();
        }
    }
    protected resetVideoCb() {
        this.videoSuccess = null;
        this.videoQuit = null;
        this.videoFail = null;
    }

    /**
     * 打开banner广告
     */
    public showBanner() { }

    /**
     * 关闭banner广告
     */
    public removeBanner() { }
    protected getBannerId() {
        if (!GamePlatform.instance.Config.banner) {
            console.log("banner开关未打开");
            return null;
        }
        if (!GamePlatform.instance.Config.BannerAdUnitId || !GamePlatform.instance.Config.BannerAdUnitId[0]) {
            console.log("banner ID 未填写");
            return null;
        }
        return GamePlatform.instance.Config.BannerAdUnitId[0];
    }
    
    /**
     * 插屏广告
     */
    public showInterstitialAd() { }
    /**获取插屏广告id */
    protected getInsertAdUnitId(): string {
        if (!GamePlatform.instance.Config.interstitial) {
            console.log("插屏广告开关未打开");
            return null;
        }
        if (!GamePlatform.instance.Config.InterstitialAdUnitId || !GamePlatform.instance.Config.InterstitialAdUnitId[0]) {
            console.log("插屏广告参数未填写");
            return null;
        }
        return GamePlatform.instance.Config.InterstitialAdUnitId[0];
    }
    /**
     * 短震动
     */
    public vibrateShort() { }

    /**
     * 长震动
     */
    public vibrateLong() { }

    /**
     * 无激励分享&&带参分享
     */
    public shareAppMessage(query: string = '') { }

    /**
     * 激励分享&&带参分享
     */
    public shareToAnyOne(success: Function, fail?: Function, query: string = '') { success() }

    /**
     * 弹出消息
     */
    public showMessage(msg: string, icon: string = 'none') { }

    /**
     * 录屏功能。[抖音]
     */
    public recordVideo(type: string = 'start') { }

    /**
     * 录屏分享[抖音]
     */
    public shareRecordVideo(success: Function, fail?: Function) { }

    /**
     * 游戏自定义打点。
     */
    public aldSdkSendEvent(eventName, data) { }

    /**
     * 游戏开始打点
     */
    public aldSdkOnStart(data) { }

    /**
     * 游戏进行中打点
     */
    public aldSdkOnRunning(data) { }

    /**
     * 游戏结束打点
     */
    public aldSdkOnEnd(data) { }

    /**跳转到其他小游戏 */
    public navigateToMiniProgram(data: any) {
        console.log("跳转小游戏，子类实现，data:", data);
    }
}
