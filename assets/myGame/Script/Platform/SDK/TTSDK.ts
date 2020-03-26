import SDK from "./SDK";
import GamePlatform from "../GamePlatform";

export default class TTSDK extends SDK {
    private apiName: string = 'tt';

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

        this.api.showShareMenu({ withShareTicket: false });
        this.needShowBanner = false;
        this.bannerTimer = -1;

    }

    /**
     * 视频广告
     */
    public showVideo(success: Function, quit?: Function, fail?: Function) {
        if (!GamePlatform.instance.Config.video || this.systemInfo.appName == 'devtools') {
            console.log("广告开关未打开或参数未填写");
            success();
            return;
        }

        var rewardedVideoAd = this.api.createRewardedVideoAd({ adUnitId: "29dqycn3yo5fghg3im" }) //不支持在开发工具运行，只能在真机运行 返回值是个单例
        let load = (() => {
            console.log('激励视频 广告加载成功');
        })
        rewardedVideoAd.onLoad(load);
        let error = ((err) => {
            console.log('激励视频 广告拉取失败', err);
            fail && fail();
        })
        rewardedVideoAd.onError(error);
        let closefun = ((res) => {
            rewardedVideoAd.offLoad(load);
            rewardedVideoAd.offError(error);
            rewardedVideoAd.offClose(closefun);
            rewardedVideoAd = null;
            if (res && res.isEnded || res === undefined) {
                //视频正常播放结束
                console.log('视频正常播放结束');
                success();
            } else {
                //视频播放中途退出
                quit && quit();
                this.showMessage('请观看完视频');
            }
        })
        rewardedVideoAd.onClose(closefun);
        //开始加载视频广告
        rewardedVideoAd.load().then(() => {
            rewardedVideoAd.show().catch(
                err => {
                    console.log('视频已播放完')
                    rewardedVideoAd.offLoad(load);
                    rewardedVideoAd.offError(error);
                    rewardedVideoAd.offClose(closefun);
                    rewardedVideoAd = null;
                    fail && fail();
                });
        });
    }

    //当前广告
    private _bannerAd: any;
    private needShowBanner: boolean;
    /**创建banner计时器 */
    private bannerTimer: number;
    /**
     * 打开banner广告
     */
    public showBanner() {
        if (!GamePlatform.instance.Config.banner) {
            console.log("Banner广告开关未打开或参数未填写");
            return;
        }
        if (this.systemInfo.appName == 'devtools') {
            console.log("头条开发者工具上无法显示banner");
            return;
        }
        if (!!this._bannerAd) return;
        this.needShowBanner = true;
        if (this.bannerTimer >= 0) return;
        this.bannerTimer = setTimeout(this.createBanner.bind(this), 500);
    }

    /**创建banner */
    private createBanner() {
        this.bannerTimer = -1;
        if (!this.needShowBanner) return;
        let targetBannerAdWidth = 200;
        this._bannerAd = this.api.createBannerAd({
            adUnitId: "b8d277k19acf8ib8f3",
            style: {
                width: targetBannerAdWidth,
                top: this.systemInfo.windowHeight - (targetBannerAdWidth / 16 * 9), // 根据系统约定尺寸计算出广告高度
            },
        });

        // this._bannerAd.style.left = (this.systemInfo.windowWidth - targetBannerAdWidth) / 2;
        // 尺寸调整时会触发回调，通过回调拿到的广告真实宽高再进行定位适配处理
        // 注意：如果在回调里再次调整尺寸，要确保不要触发死循环！！！
        this._bannerAd.onResize(size => {
            // good
            console.log(size.width, size.height);
            this._bannerAd.style.top = this.systemInfo.windowHeight - size.height;
            this._bannerAd.style.left = (this.systemInfo.windowWidth - size.width) / 2;
            // bad，会触发死循环
            // bannerAd.style.width++;
        });
        this._bannerAd.onLoad(() => {
            console.log("广告拉取成功");
            this._bannerAd.show().then(() => {
                console.log('广告显示成功');
            }).catch((err) => {
                console.log('广告组件出现问题', err);
            });
        });
        this._bannerAd.onError(err => {
            console.log("广告拉取失败", err);
        });

        this.needShowBanner = false;
        return this._bannerAd;
    }

    /**
     * 关闭banner广告
     */
    public removeBanner() {
        this.needShowBanner = false;
        this.destroyBanner();
    }
    /**销毁banner */
    private destroyBanner() {
        if (this._bannerAd) {
            this._bannerAd.destroy(); //要先把旧的广告给销毁，不然会导致其监听的时间无法释放，影响性能
            this._bannerAd = null;
        }
    }

    /**
     * 插屏广告
     */
    public showInterstitialAd() {

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
        let index: number = Math.floor((Math.random() * this.shareTitleArr.length));
        let indeximg: number = Math.floor((Math.random() * this.shareImgArr.length));
        let self = this
        this.api.shareAppMessage({
            title: `${this.shareTitleArr[index]}`,
            imageUrl: `${this.shareImgArr[indeximg]}`,
            query: query,
            success: function (res) {
                self.showMessage('分享成功');
            },
            fail: function (res) {
                self.showMessage('分享失败');
            },
        });
    }

    /**
     * 激励分享&&带参分享
     */
    public shareToAnyOne(success: Function, fail?: Function, query: string = '') {
        let index: number = Math.floor((Math.random() * this.shareTitleArr.length));
        let indeximg: number = Math.floor((Math.random() * this.shareImgArr.length));
        let self = this
        this.api.shareAppMessage({
            title: `${this.shareTitleArr[index]}`,
            imageUrl: `${this.shareImgArr[indeximg]}`,
            query: query,
            success: function (res) {
                self.showMessage('分享成功');
                success();
            },
            fail: function (res) {
                self.showMessage('分享失败');
                fail && fail();
            },
        });
    }


    //录屏分享次数
    public static IsOnce = true;
    //录屏错误。
    private IsRecordError: boolean = false;
    //视频地址
    private videoPath: string = '';
    /**
     * 录屏
     */
    public recordVideo(type: string = 'start') {
        this.IsRecordError = false;
        TTSDK.IsOnce = true;
        let self = this;
        const recorder = this.api.getGameRecorderManager();
        if (type == 'start') {
            recorder.start({
                duration: 120,
            })
        } else if (type == 'stop') {
            recorder.stop();
        }

        recorder.onStart(res => {
            console.log('录屏开始');
        })
        recorder.onStop(res => {
            console.log('监听录屏结束', res);
            self.videoPath = res.videoPath;
            // if (this.brand == 'Apple') {
            //     return
            // }
            // recorder.clipVideo({
            //     path: res.videoPath,
            //     timeRange: [120, 0], // 表示裁剪录屏中的最后120s
            //     success: (res) => {
            //         console.log('剪辑录屏成功', res.videoPath);
            //         self.videoPath = res.videoPath
            //     },
            //     fail: (e) => { }
            // })
        })
        recorder.onError((errMsg) => {
            console.log('监听录屏错误信息', errMsg);
            self.IsRecordError = true;
        })
    }


    /**
     * 分享录屏
     */
    public shareRecordVideo(success: Function, fail?: Function) {
        console.log('视频地址', this.videoPath, this.IsRecordError)
        let self = this;
        if (this.videoPath && this.IsRecordError == false) {
            let index: number = Math.floor((Math.random() * this.shareTitleArr.length));
            let indeximg: number = Math.floor((Math.random() * this.shareImgArr.length));

            this.api.shareAppMessage({
                channel: 'video',
                title: `${this.shareTitleArr[index]}`,
                imageUrl: `${this.shareImgArr[indeximg]}`,
                extra: {
                    videoPath: this.videoPath,
                    // videoTopics:''
                },
                success: function (res) {
                    console.log('拉起分享 成功', res);
                    self.showMessage("发布成功");
                    if (TTSDK.IsOnce) {
                        success();
                        TTSDK.IsOnce = false;
                    }
                },
                fail: function (res) {
                    console.log('拉起分享 失败', res);
                    if (self.systemInfo.appName == 'Toutiao') { //头条版
                        if (self.systemInfo.platform == "ios") { //苹果手机 安卓手机为 android
                            if (res.errMsg == 'shareAppMessage:fail video duration is too short') {
                                self.showMessage('录屏时间短于3s不能分享哦~~')
                            } else {
                                self.showMessage('发布取消')
                            }
                        } else {
                            let msg = res.errMsg.split(',')[0]
                            console.log('msg', msg)
                            if (msg == 'shareAppMessage:fail video file is too short') {
                                self.showMessage('录屏时间短于3s不能分享哦~~')
                            } else {
                                self.showMessage('发布取消')
                            }
                        }
                    } else if (self.systemInfo.appName == 'news_article_lite') { //头条极速版
                        if (self.systemInfo.platform == "ios") { //苹果手机 安卓手机为 android
                            if (res.errMsg == 'shareAppMessage:fail video duration is too short') {
                                self.showMessage('录屏时间短于3s不能分享哦~~')
                            } else {
                                self.showMessage('发布取消')
                            }
                        } else {
                            let msg = res.errMsg.split(',')[0]
                            console.log('msg', msg)
                            if (msg == 'shareAppMessage:fail video file is too short') {
                                self.showMessage('录屏时间短于3s不能分享哦~~')
                            } else {
                                self.showMessage('发布取消')
                            }
                        }
                        // if (self.systemInfo.platform == "ios") { //苹果手机 安卓手机为 android
                        //     self.showMessage('录屏时间短于3s不能分享哦~~')
                        // } else {
                        //     self.showMessage('录屏时间短于3s不能分享哦~~')
                        // }
                    } else if (self.systemInfo.appName == 'Douyin') {
                        if (self.systemInfo.platform == "ios") { //苹果手机 安卓手机为 android
                            if (res.errMsg == 'shareAppMessage:fail video duration is too short') {
                                self.showMessage('录屏时间短于3s不能分享哦~~')
                            } else {
                                self.showMessage('发布取消')
                            }
                        } else {
                            let msg = res.errMsg.split(',')[0]
                            console.log('msg', msg)
                            if (msg == 'shareAppMessageDirectly:fail') {
                                self.showMessage('录屏时间短于3s不能分享哦~~')
                            } else {
                                self.showMessage('发布取消')
                            }
                        }
                    } else {
                        self.showMessage('发布取消')
                    }
                }
            });
        } else {
            fail && fail()
            self.showMessage('录屏错误!!!')
        }
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

    public navigateToMiniProgram(data: any) {
        this.api.navigateToMiniProgram({
            appId: data.gameId,
        });
    }
}
