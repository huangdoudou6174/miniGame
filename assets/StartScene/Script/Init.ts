import { GamePlatformType } from "../../myGame/Script/Platform/GamePlatformType";
import GamePlatform from "../../myGame/Script/Platform/GamePlatform";
import GamePlatformConfig from "../../myGame/Script/Platform/GamePlatformConfig";
import Loader from "../../myGame/Script/Common/Loader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Init extends cc.Component {
    @property({ type: cc.Enum(GamePlatformType) })
    public type: GamePlatformType = GamePlatformType.PC;

    @property(cc.Node)
    public platformConfig: cc.Node = null;

    @property(cc.ProgressBar)
    Plan: cc.ProgressBar = null;

    onLoad() {
        console.log('>>>当前平台', GamePlatformType[this.type]);
        GamePlatform.instance.init(this.copyConfig(this.platformConfig.children[this.type].getComponent(GamePlatformConfig)));
    }
    start() {
        // Loader.loadSubpackage("Level", null, false);
        // Loader.loadSubpackage("Skin", null, false);
        // setTimeout(this.loadMainScene.bind(this), 100);
        this.loadMainScene();
        // Loader.loadSubpackage("Level", () => {
        //     Loader.loadSubpackage("PlayerHead", null, false);
        //     Loader.loadSubpackage("Skin", this.loadMainScene.bind(this), false)
        // }, false);
    }
    loadMainScene() {
        let loader_ = (completedCount, totalCount, item) => {
            let jindu = completedCount / totalCount;
            this.Plan.progress = jindu;
        }
        cc.director.preloadScene("MainScene", loader_, (errs) => {
            if (errs) {
                cc.log(errs);
                cc.director.loadScene("Init");
                return;
            }
            cc.log("加载游戏主场景完成");
            cc.director.loadScene("MainScene");
        });
    }
    copyConfig(cfg: GamePlatformConfig) {
        let data = new GamePlatformConfig();
        data.type = JSON.parse(JSON.stringify(cfg.type));
        data.appId = JSON.parse(JSON.stringify(cfg.appId));
        data.secret = JSON.parse(JSON.stringify(cfg.secret));
        data.ServiceAdress = JSON.parse(JSON.stringify(cfg.ServiceAdress));
        data.videoAdUnitId = JSON.parse(JSON.stringify(cfg.videoAdUnitId));
        data.BannerAdUnitId = JSON.parse(JSON.stringify(cfg.BannerAdUnitId));
        data.InterstitialAdUnitId = JSON.parse(JSON.stringify(cfg.InterstitialAdUnitId));
        data.share = JSON.parse(JSON.stringify(cfg.share));
        data.video = JSON.parse(JSON.stringify(cfg.video));
        data.banner = JSON.parse(JSON.stringify(cfg.banner));
        data.interstitial = JSON.parse(JSON.stringify(cfg.interstitial));
        data.vibrate = JSON.parse(JSON.stringify(cfg.vibrate));
        return data;
    }
}