import { GamePlatformType } from "./GamePlatformType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePlatformConfig extends cc.Component {
    //平台。
    @property({ type: cc.Enum(GamePlatformType) })
    public type: GamePlatformType = GamePlatformType.PC;

    @property({
        displayName: "项目appId",
    })
    public appId: string = "";

    @property({
        displayName: "项目secret",
    })
    public secret: string = "";

    @property({
        displayName: "项目远程服务器地址",
    })
    public ServiceAdress: string = "";

    @property({
        displayName: "视频广告Id",
        type: [cc.String],
    })
    public videoAdUnitId: string[] = [""];

    @property({
        displayName: "BannerId",
        type: [cc.String],
    })
    public BannerAdUnitId: string[] = [""];

    @property({
        displayName: "插屏Id",
        type: [cc.String],
    })
    public InterstitialAdUnitId: string[] = [""];

    @property({
        displayName: "开启激励分享",
        tooltip: "是否关闭激励分享，图标也会隐藏"
    })
    public share: boolean = true;

    @property({
        displayName: "开启视频广告",
        tooltip: "是否关闭视频广告，图标也会隐藏"
    })
    public video: boolean = true;

    @property({
        displayName: "开启Banner",
        tooltip: "是否关闭Banner"
    })
    public banner: boolean = true;

    @property({
        displayName: "开启插屏",
        tooltip: "是否关闭插屏"
    })
    public interstitial: boolean = true;

    @property({
        displayName: "开启震动",
        tooltip: "是否开启震动"
    })
    public vibrate: boolean = true;
}
