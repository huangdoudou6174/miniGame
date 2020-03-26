import SDK from "./SDK";
import GamePlatform from "../GamePlatform";

export default class QQSDK extends SDK {
    private apiName: string = 'qq';

    public init() {
        this.api = window[this.apiName];

        this.systemInfo = this.api.getSystemInfoSync();
        console.log(
            "\n手机型号", this.systemInfo.model,
            "\n系统", this.systemInfo.system,
            "\n微信版本", this.systemInfo.version,
            "\n语言", this.systemInfo.language,
            "\n手机品牌", this.systemInfo.brand,
            "\n客户端平台", this.systemInfo.platform,
            "\n客户端基础库版本", this.systemInfo.SDKVersion
        );
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

        var rewardedVideoAd = this.api.createRewardedVideoAd({ adUnitId: GamePlatform.instance.Config.videoAdUnitId[0] }) //不支持在开发工具运行，只能在真机运行 返回值是个单例
        rewardedVideoAd.onLoad(() => {
            console.log('激励视频 广告加载成功');
        });
        rewardedVideoAd.onError(err => {
            console.log('激励视频 广告拉取失败', err);
            fail && fail();
        });
        rewardedVideoAd.onClose(res => {
            rewardedVideoAd.offLoad();
            rewardedVideoAd.offError();
            rewardedVideoAd.offClose();
            rewardedVideoAd = null;
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                //视频正常播放结束
                success();
            } else {
                //视频播放中途退出
                quit && quit();
            }
        });

        //开始加载视频广告
        rewardedVideoAd.load().then(() => {
            rewardedVideoAd.show().catch(
                err => {
                    console.log('视频广告播放失败', err);
                    rewardedVideoAd.offLoad();
                    rewardedVideoAd.offError();
                    rewardedVideoAd.offClose();
                    rewardedVideoAd = null;
                    fail && fail();
                }
            );
        });
    }

    //当前广告。
    private _bannerAd: any;
    /**
     * 打开banner
     */
    public showBanner() {
        if (!GamePlatform.instance.Config.banner || GamePlatform.instance.Config.BannerAdUnitId[0] == '') {
            console.log("Banner广告开关未打开或参数未填写");
            return;
        }
        this.removeBanner();

        //banner默认隐藏，调用show方法显示
        this._bannerAd = this.api.createBannerAd({
            adUnitId: GamePlatform.instance.Config.BannerAdUnitId[0],
            style: {
                left: 0,
                top: this.systemInfo.screenHeight - 130,
                width: this.systemInfo.screenWidth + 50,
            }
        });

        this._bannerAd.onLoad(() => {
            console.log("广告拉取成功");
        });
        this._bannerAd.onError(err => {
            console.log("广告拉取失败", err);
        });

        this._bannerAd.show().then(() => { console.log("显示广告") });
        this._bannerAd.onResize(res => {
            this._bannerAd.style.top = this.systemInfo.screenHeight - res.height;
            this._bannerAd.style.width = this.systemInfo.screenWidth + 50;
        });

        return this._bannerAd;
    }

    /**
     * 关闭广告
     */
    public removeBanner() {
        if (this._bannerAd) {
            this._bannerAd.offLoad();
            this._bannerAd.offError();
            this._bannerAd.offResize();
            this._bannerAd.destroy(); //要先把旧的广告给销毁，不然会导致其监听的时间无法释放，影响性能
            this._bannerAd = null;
        }
    }

    /**
     * 插屏广告
     */
    public showInterstitialAd() {
        if (!GamePlatform.instance.Config.interstitial || GamePlatform.instance.Config.InterstitialAdUnitId[0] == '') {
            console.log("插屏广告开关未打开或参数未填写");
            return;
        }

        const version = this.systemInfo.SDKVersion;
        if (this.compareVersion(version, '2.6.0') >= 0) {
            let interad = this.api.createInterstitialAd({
                adUnitId: GamePlatform.instance.Config.InterstitialAdUnitId[0]
            })
            interad.onLoad(() => {
                console.log('插屏广告加载成功')
            })
            interad.show().then((res) => {
                console.log('显示插屏广告', res)
            })
            interad.onClose(() => {
                console.log('监听插屏广告关闭事件')
            })
            interad.onError((res) => {
                console.log('监听插屏错误事件', res)
            })
        } else {
            console.log('基础库版本过低')
            //   // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            //   wx.showModal({
            //     title: '提示',
            //     content: '当前微信版本过低，无法使用插屏广告，请升级到最新微信版本后重试。'
            //   })
        }
    }

    /**
     * 判断基础库版本号
     */
    private compareVersion(v1, v2) {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)
        while (v1.length < len) { v1.push('0') }
        while (v2.length < len) { v2.push('0') }
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])
            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }
        return 0
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
    shareAppMessage(query: string = "") {
        let index: number = Math.floor((Math.random() * this.shareTitleArr.length));
        let indeximg: number = Math.floor((Math.random() * this.shareImgArr.length));
        this.api.shareAppMessage({
            title: `${this.shareTitleArr[index]}`,
            imageUrl: `${this.shareImgArr[indeximg]}`,
            query: `${query}`,
        });
    }

    /**
     * 激励分享&&带参分享
     */
    shareToAnyOne(success: Function, fail?: Function, query: string = '') {
        if (!GamePlatform.instance.Config.share) {
            success();
            return;
        }
        this.shareAppMessage(query);
        success();
    }

    /**
     * 消息提示
     */
    public showMessage(msg: string, icon: string = 'none') {
        this.api.showToast({
            title: msg,
            duration: 2000,
            icon: icon,
            success: (res) => { }
        });
    }
}
