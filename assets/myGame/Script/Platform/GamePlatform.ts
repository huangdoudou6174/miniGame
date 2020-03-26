import GamePlatformConfig from "./GamePlatformConfig";
import { GamePlatformType } from "./GamePlatformType";
import SDK from "./SDK/SDK";
import WXSDK from "./SDK/WXSDK";
import TTSDK from "./SDK/TTSDK";
import OPPOSDK from "./SDK/OPPOSDK";
import VIVOSDK from "./SDK/VIVOSDK";
import QQSDK from "./SDK/QQSDK";
import XiaoMiSDK from "./SDK/XiaoMiSDK";


export default class GamePlatform {
    private static _instance: GamePlatform;
    public static get instance(): GamePlatform {
        if (!GamePlatform._instance) {
            GamePlatform._instance = new GamePlatform();
        }
        return GamePlatform._instance;
    }

    /**
     * 平台设置参数
     */
    public get Config(): GamePlatformConfig {
        return this._config;
    }
    private _config: GamePlatformConfig = null;

    /**
     * SDK
     */
    public static get SDK(): SDK {
        if (!GamePlatform.instance._sdk) {
            GamePlatform.instance.setDefaultSdk();
        }
        return GamePlatform.instance._sdk;
    }
    private _sdk: SDK = null;

    /**
     * 初始化SDK
     */
    public init(param: GamePlatformConfig) {
        console.log(param);
        this._config = param;
        switch (param.type) {
            case GamePlatformType.PC:
                this._sdk = new SDK(); //默认不继承。
                break;
            case GamePlatformType.WX:
                this._sdk = new WXSDK();
                break;
            case GamePlatformType.TT:
                this._sdk = new TTSDK();
                break;
            case GamePlatformType.QQ:
                this._sdk = new QQSDK();
                break;
            case GamePlatformType.OPPO:
                this._sdk = new OPPOSDK();
                break;
            case GamePlatformType.VIVO:
                this._sdk = new VIVOSDK();
                break;
            case GamePlatformType.XiaoMi: {
                this._sdk = new XiaoMiSDK();
                break;
            }
        }

        this._sdk.init();
        this._sdk.onEvents();
    }

    /**
     * 设置默认sdk[PC];
     */
    private setDefaultSdk() {
        var param: GamePlatformConfig = new GamePlatformConfig();
        param.type = GamePlatformType.PC;
        param.appId = "";
        param.secret = "";
        param.share = true;
        param.video = true;
        param.banner = false;
        param.interstitial = false;
        param.vibrate = true;
        param.videoAdUnitId = [""];
        param.BannerAdUnitId = [""];
        param.InterstitialAdUnitId = [""];

        this.init(param);
    }
}
