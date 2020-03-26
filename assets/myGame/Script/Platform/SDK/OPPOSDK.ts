import SDK from "./SDK";
import GamePlatform from "../GamePlatform";
import EventManager from "../../Common/EventManager";
import { EventType } from "../../GameSpecial/GameEventType";

export default class OPPOSDK extends SDK {
    private apiName: string = 'qg';

    /**
     * 初始化
     */
    public init() {
        this.api = window[this.apiName];
        this.systemInfo = this.api.getSystemInfoSync();

        //初始化信息
        let self = this;
        // this.api.setLoadingProgress({
        //     progress: 0
        // });
        this.api.setEnableDebug({
            enableDebug: false, // true 为打开，false 为关闭
            // enableDebug: true, // true 为打开，false 为关闭
            success: function () {
                console.log('oppo信息', JSON.stringify(self.systemInfo))
            },
            complete: function () {
            },
            fail: function () {
            }
        });
        // 初始化广告。
        // if (GamePlatform.instance.Config.video || GamePlatform.instance.Config.videoAdUnitId[0] != '') {
        //     this.api.initAdService({
        //         appId: GamePlatform.instance.Config.videoAdUnitId[0],
        //         isDebug: true,
        //         success: function (res) {
        //             console.log("初始化广告success");
        //         },
        //         fail: function (res) {
        //             console.log("初始化广告fail:" + res.code + res.msg);
        //         },
        //         complete: function (res) {
        //             console.log("complete");
        //         }
        //     })
        // }
    }

    /**
     * 视频广告
     */
    public showVideo(success: Function, quit?: Function, fail?: Function) {
        if (!GamePlatform.instance.Config.video || GamePlatform.instance.Config.videoAdUnitId[0] == '') {
            console.log("广告开关未打开或参数未填写");
            success();
            return;
        }
        if (this.systemInfo.platformVersion < 1040) {
            console.log('平台版本过低');
            success();
            return
        }

        let self = this;
        if (this.videoAd) {
            this.videoAd.destroy()
        }
        this.videoAd = this.api.createRewardedVideoAd({
            posId: GamePlatform.instance.Config.videoAdUnitId[0]
        })
        this.videoAd.load()
        this.videoAd.onLoad(() => {
            console.log("激励视频加载成功");
            this.videoAd.show();
        })
        this.videoAd.onVideoStart(function () {
            console.log("激励视频 开始播放");
        })
        this.videoAd.onClose((res) => {
            if (res.isEnded) {
                console.log('激励视频广告完成，发放奖励')
                success();
            } else {
                console.log('激励视频广告取消关闭，不发放奖励')
                quit && quit();
            }
        })
        this.videoAd.onError(function (err) {
            console.log('视频加载回调错误信息', JSON.stringify(err));
            if (err.code == '10003') {
                self.showMessage('请使用v2.6.0版本调试器测试~');
                fail && fail();
            } else {
                self.showMessage('视频资源请求中,请稍后再试~');
                fail && fail();
            }
        })
    }

    //当前banner
    private _bannerAd: any;
    /**
     * 打开banner广告
     */
    public showBanner() {
        if (!GamePlatform.instance.Config.banner || GamePlatform.instance.Config.BannerAdUnitId[0] == '') {
            console.log("Banner广告开关未打开或参数未填写");
            return;
        }
        if (this.systemInfo.platformVersion < '1031') {
            console.log('平台版本过低');
            return;
        }

        this.removeBanner();

        this._bannerAd = this.api.createBannerAd({
            posId: GamePlatform.instance.Config.BannerAdUnitId[0]
        });
        this._bannerAd.show()
        this._bannerAd.onShow(function () {
            console.log("banner 广告显示成功");
        })
        this._bannerAd.onError(function (err) {
            console.log('广告显示失败回调', JSON.stringify(err));
        })
        this._bannerAd.onHide(function () {
            console.log("banner 广告隐藏");
        })

        return this._bannerAd;
    }

    /**
     * 关闭banner广告
     */
    public removeBanner() {
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    }

    //插屏广告
    public showInterstitialAd() {
        if (!GamePlatform.instance.Config.interstitial || GamePlatform.instance.Config.InterstitialAdUnitId[0] == '') {
            console.log("插屏广告开关未打开或参数未填写");
            return;
        }

        if (this.systemInfo.platformVersion < 1031) {
            console.log('平台版本过低');
            return;
        }
        console.log('显示插屏广告')
        var insertAd = this.api.createInsertAd({
            posId: GamePlatform.instance.Config.InterstitialAdUnitId[0]
        })
        insertAd.load()
        insertAd.onLoad(() => {
            console.log("插屏广告加载");
            insertAd.show()
        })
        insertAd.onShow(function () {
            console.log("插屏广告展示");
        })
        insertAd.onError(function (err) {
            console.log('插屏广告错误', JSON.stringify(err));
        })
    }

    /**
     * 短震动
     */
    public vibrateShort() {
        if (GamePlatform.instance.Config.vibrate) {
            this.api.vibrateShort({});
        }
    }

    /**
     * 长震动
     */
    public vibrateLong() {
        if (GamePlatform.instance.Config.vibrate) {
            this.api.vibrateLong({});
        }
    }

    /**
     * 无激励分享&&带参分享
     */
    public shareAppMessage(query: string = '') {

    }

    /**
     * 激励分享&&带参分享
     */
    public shareToAnyOne(success: Function, fail?: Function, query: string = '') {

    }

    /**
     * 消息提示
     */
    public showMessage(msg: string, icon: string = 'none') {
        // this.api.showToast({
        //     title: msg,
        //     duration: 2000,
        //     icon: icon,
        //     success: (res) => { }
        // });
        EventManager.emit(EventType.UIEvent.showTip, msg);
    }

    public navigateToMiniProgram(data: any) {
        if (this.systemInfo.platformVersion < '1050') {
            console.log('平台版本过低');
            return;
        }
        this.api.navigateToMiniGame({
            pkgName: data.gameId,
        })
    }
}
