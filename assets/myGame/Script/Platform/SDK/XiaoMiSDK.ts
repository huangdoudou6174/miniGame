import SDK from "./SDK";

export default class XiaoMiSDK extends SDK {
    private apiName: string = 'qg';

    public init() {
        this.api = window[this.apiName];
        this.systemInfo = this.api.getSystemInfoSync();
        console.log("系统信息：", this.systemInfo);
        // this.api.showShareMenu();
        // this.api.onShareAppMessage(() => ({}));
    }

    //视频广告
    public showVideo(success: Function, quit?: Function, fail?: Function) {
        let id = this.getVideoAdUnitId();
        if (!id) {
            this.resetVideoCb();
            success();
            return;
        }
        this.videoSuccess = success;
        this.videoQuit = quit;
        this.videoFail = fail;
        if (!this.videoAd) {
            this.videoAd = this.api.createRewardedVideoAd({
                adUnitId: id
            });
            this.videoAd.onError(this.onVideoFail.bind(this));
            this.videoAd.onClose(this.onCloseVideo.bind(this));
            this.videoAd.onLoad(() => {
                console.log("视频广告加载成功");
            })
        }
        this.videoAd.show();
    }
    /**视频广告关闭回调 */
    protected onCloseVideo(data) {
        if (!!data && !!data.isEnded) {
            this.onVideoSuccess();
        } else {
            this.onVideoQuit();
        }
    }

    //插屏广告
    public showInterstitialAd() {
        //todo:小米快游戏暂时未提供插屏广告功能
        return;
        if (this.systemInfo.platformVersion < '1051') {
            console.log('平台版本过低，无法显示插屏广告');
            return;
        }
        let id = this.getInsertAdUnitId();
        if (!id) return;
        let ad = this.api.createInterstitialAd({
            adUnitId: id
        });
        if (!ad) {
            console.log("插屏广告实例创建失败");
            return;
        }
        ad.onLoad(() => {
            console.log("插屏广告加载成功");
        });
        ad.onError((err) => {
            console.log("插屏广告加载错误：", err);
        });
        ad.onClose(() => {
            console.log("插屏广告被关闭");
        });
        ad.show();
    }

}