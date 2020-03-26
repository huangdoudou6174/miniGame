import EventManager from "./EventManager";
import { EventType } from "../GameSpecial/GameEventType";
import GameConfig from "../GameSpecial/GameConfig";
import GamePlatform from "../Platform/GamePlatform";
import { GamePlatformType } from "../Platform/GamePlatformType";

//本地/远程资源加载器
export default class Loader {
    /**记录文件夹路径对应的资源数组 */
    protected static dirAsset: { [key: string]: cc.Asset[] };
    /**记录所有加载完成的资源，包括通过文件夹加载的资源 */
    protected static singleAsset: { [key: string]: cc.Asset };
    /**记录从远程服务器下载的资源 */
    protected static serverAsset: { [dir: string]: { [key: string]: cc.Asset } };
    /**远程服务器地址 */
    protected static rootUrl: string;

    public static init() {
        this.dirAsset = {};
        this.singleAsset = {};
        this.serverAsset = {};
        this.subpackageRecords = {};
        this.rootUrl = GameConfig.resourceUrl + GameConfig.serverGameName + "/";
        this.onEvents();
    }
    protected static onEvents() {
    }
    /**显示进度条：发送事件，通知UI节点显示进度 */
    protected static showProgressBar(rate?: number) {
        if (undefined === rate) {
            rate = 0;
        }
        this.showMask();
        EventManager.emit(EventType.LoadAssetEvent.showProgress, rate);
    }
    /**
     * 根据资源加载进度更新进度条
     * @param completedCount    已加载完成的资源数量
     * @param totalCount        要加载的资源总数量
     * @param item              当前加载完成的资源
     */
    protected static updateProgress(completedCount: number, totalCount: number, item: any) {
        let rate = completedCount / totalCount;
        if (rate > 1) rate = 1;
        EventManager.emit(EventType.LoadAssetEvent.updateProgress, rate);
    }
    protected static hideProgressBar(count: number = 1) {
        EventManager.emit(EventType.LoadAssetEvent.hideProgress);
        this.hideMask(count);
    }
    //显示遮罩，只屏蔽触摸事件，不显示进度条，不变暗屏幕
    protected static showMask(count: number = 1) {
        EventManager.emit(EventType.UIEvent.showTouchMask, count);
    }
    protected static hideMask(count: number = 1) {
        EventManager.emit(EventType.UIEvent.hideTouchMask, count);
    }
    /**
    * 加载单个资源
    * @param url    资源完整的路径名称，不包含后缀
    * @param cb     资源加载完成后的回调
    * @param mask   加载过程中是否阻挡玩家触摸操作，默认阻挡
    */
    public static loadRes(url: string, cb: (asset: any) => void, mask?: boolean) {
        if (!!this.singleAsset[url]) {
            setTimeout(() => {
                cb(this.singleAsset[url]);
            }, 0);
        } else {
            if (undefined === mask) {
                mask = true;
            }
            if (mask) {
                this.showMask();
            }
            cc.loader.loadRes(url, (err, res) => {
                if (mask) {
                    this.hideMask();
                }
                if (err) {
                    cc.error(err.message || err);
                    cb(null);
                    return;
                }
                this.singleAsset[url] = res;
                cb(res);
            });
        }
    }
    /**
     * 加载整个文件夹内的资源
     * @param dir   文件夹路径
     * @param cb    加载完成回调
     * @param type  资源类型
     * @param mask  加载过程中是否显示加载进度并阻挡玩家触摸操作，默认为true
     */
    public static loadResDir(dir: string, cb: (assets: any[]) => void, type?: typeof cc.Asset | boolean, mask?: boolean) {
        if (!!this.dirAsset[dir]) {
            setTimeout(() => {
                cb(this.dirAsset[dir]);
            }, 0);
            return;
        }
        let assetType = null;
        if (undefined === type) {
            mask = true;
        } else if (typeof type === "boolean") {
            mask = !!type;
        } else {
            assetType = type;
            if (undefined === mask) {
                mask = true;
            }
        }
        if (mask) {
            this.showProgressBar();
        }
        if (!!assetType) {
            cc.loader.loadResDir(dir, assetType, this.updateProgress.bind(this),
                (err, arr, urls) => {
                    if (mask) {
                        this.hideProgressBar();
                    }
                    if (err) {
                        cc.log(err);
                        cb(null);
                        return;
                    }
                    this.dirAsset[dir] = arr;
                    for (let i = arr.length - 1; i >= 0; --i) {
                        this.singleAsset[urls[i]] = arr[i];
                    }
                    cb(this.dirAsset[dir]);
                }
            );
        } else {
            cc.loader.loadResDir(dir, this.updateProgress.bind(this),
                (err, arr, urls) => {
                    if (mask) {
                        this.hideProgressBar();
                    }
                    if (err) {
                        cc.log(err);
                        cb(null);
                        return;
                    }
                    this.dirAsset[dir] = arr;
                    for (let i = arr.length - 1; i >= 0; --i) {
                        this.singleAsset[urls[i]] = arr[i];
                    }
                    cb(this.dirAsset[dir]);
                }
            );
        }
    }
    /**加载资源数组 */
    public static loadResArray(urls: string[], cb: (assets: any[]) => void, mask?: boolean) {
        let assets = [];
        let arr = [];
        for (let i = urls.length - 1; i >= 0; --i) {
            let res = this.getAsset(urls[i]);
            if (!!res) {
                assets.push(res);
            } else {
                arr.push(urls[i]);
            }
        }
        if (arr.length == 0) {
            setTimeout(() => {
                cb(assets);
            }, 0);
            return;
        }
        if (undefined === mask) {
            mask = true;
        }
        if (mask) {
            this.showProgressBar();
        }
        cc.loader.loadResArray(arr, this.updateProgress.bind(this),
            (err, res) => {
                if (mask) {
                    this.hideProgressBar();
                }
                if (!!err) {
                    console.log(err);
                    cb(null);
                    return;
                }
                for (let i = arr.length - 1; i >= 0; --i) {
                    this.singleAsset[arr[i]] = res[i];
                    assets.push(res[i]);
                }
                cb(assets);
            }
        );
    }

    /**
     * 从远程地址加载单个资源
     * @param serverUrl 远程资源所属分类枚举值，与资源所在路径一致
     * @param url 资源名称，需包含文件类型后缀
     * @param cb 资源加载完成后的回调，需自行判定asset类型
     */
    public static load(serverUrl: string, url: string, cb: (asset) => void, mask?: boolean) {
        if (!!this.serverAsset[serverUrl] && !!this.serverAsset[serverUrl][url]) {
            setTimeout(() => {
                cb(this.serverAsset[serverUrl][url]);
            }, 0);
        } else {
            if (!this.serverAsset[serverUrl]) this.serverAsset[serverUrl] = {};
            if (undefined === mask) {
                mask = true;
            }
            if (mask) {
                this.showMask();
            }
            cc.loader.load(this.rootUrl + serverUrl + url, (err, res) => {
                if (mask) {
                    this.hideMask();
                }
                if (!!err) {
                    console.warn("资源下载失败，");
                    console.warn(err);
                    cb(null);
                    return;
                }
                this.serverAsset[serverUrl][url] = res;
                cb(res);
            });
        }
    }
    /**
     * 从远程地址加载多个资源
     * @param serverUrl 远程资源所属分类枚举值，与资源所在路径一致
     * @param urls 资源名称数组，需包含文件类型后缀
     * @param cb 资源加载完成后的回调，需注意：assets数组中资源的顺序与urls的顺序可能不一致
     */
    public static loadArray(serverUrl: string, urls: string[], cb: (assets: any[]) => void, mask?: boolean) {
        let assets = [];
        let arr = [];
        let tempUrls = [];
        let root = this.rootUrl + serverUrl;
        if (!!this.serverAsset[serverUrl]) {
            for (let i = urls.length - 1; i >= 0; --i) {
                let res = this.serverAsset[serverUrl][urls[i]];
                if (!!res) {
                    assets.push(res);
                } else {
                    arr.push(root + urls[i]);
                    tempUrls.push(urls[i]);
                }
            }
        } else {
            for (let i = urls.length - 1; i >= 0; --i) {
                arr.push(root + urls[i]);
            }
            tempUrls = [].concat(urls);
        }
        if (arr.length == 0) {
            setTimeout(() => {
                cb(assets);
            }, 0);
            return;
        }
        if (undefined === mask) {
            mask = true;
        }
        if (mask) {
            this.showProgressBar();
        }
        if (undefined === this.serverAsset[serverUrl]) this.serverAsset[serverUrl] = {};
        cc.loader.load(arr, this.updateProgress.bind(this),
            (err, res) => {
                if (mask) {
                    this.hideProgressBar();
                }
                if (!!err) {
                    console.log(err);
                    cb(null);
                    return;
                }
                for (let i = tempUrls.length - 1; i >= 0; --i) {
                    let asset = res.getContent(tempUrls[i]);
                    this.serverAsset[serverUrl][tempUrls[i]] = asset;
                    assets.push(asset);
                }
                cb(assets);
            }
        );
    }

    /**
     * 获取已加载的资源
     * @param url 资源路径
     * @param serverUrl 资源为从远程服务端加载时，需指定远程资源分类
     */
    public static getAsset(url: string, serverUrl?: string): cc.Asset {
        if (undefined === serverUrl) {
            if (!this.singleAsset[url]) {
                console.warn("尚未加载资源：", url);
                return null;
            }
            return this.singleAsset[url];
        } else {
            if (!this.serverAsset[serverUrl] || !this.serverAsset[serverUrl][url]) {
                console.warn("尚未加载资源：", serverUrl + " " + url);
                return null;
            }
            return this.serverAsset[serverUrl][url];
        }
    }

    /**
     * 获取已加载的文件夹下的全部资源
     * @param url 文件夹路径
     * @param serverUrl 若资源是从远程服务端下载的，需指定远程服务端的文件夹名称
     */
    public static getAssets(url: string, serverUrl?: string): any[] {
        let assets: cc.Asset[] = [];
        if (undefined === serverUrl) {
            //从本地获取的资源
            for (let key in this.singleAsset) {
                let index = key.indexOf(url);
                if (index >= 0) {
                    assets.push(this.singleAsset[key]);
                }
            }
            return assets;
        } else {
            //从服务器获取的资源
            if (this.serverAsset[serverUrl]) {
                for (let key in this.serverAsset[serverUrl]) {
                    if (key.indexOf(url) >= 0) {
                        assets.push(this.serverAsset[serverUrl][key]);
                    }
                }
            }
            return assets;
        }
    }

    /**
     * 获取SpriteFrame资源
     * @param url 本地资源：完整的资源路径和资源文件名，不需要后缀；远程资源：资源名称，带后缀
     * @param serverUrl 若资源是从远程服务端下载的，需指定远程服务端的文件夹名称
     */
    public static getSpriteFrame(url: string, serverUrl?: string): cc.SpriteFrame {
        let res = this.getAsset(url, serverUrl);
        if (!res) {
            return;
        }
        if (res instanceof cc.Texture2D) {
            return new cc.SpriteFrame(res);
        } else if (res instanceof cc.SpriteFrame) {
            return res;
        } else {
            console.log("指定的资源不是图片类型");
            return null;
        }
    }

    /**
       * 获取整个文件夹下的全部spriteFrame
       * @param url 本地资源：完整的资源路径和资源文件名，不需要后缀；远程资源：资源名称，带后缀
       * @param serverUrl 若资源是从远程服务端下载的，需指定远程服务端的文件夹名称
       */
    public static getSpriteFrameList(url: string, serverUrl?: string): { [key: string]: cc.SpriteFrame } {
        let data = {};
        if (undefined === serverUrl) {
            //从本地获取的资源
            for (let key in this.singleAsset) {
                let index = key.indexOf(url);
                if (index >= 0) {
                    let res = this.singleAsset[key];
                    if (res instanceof cc.Texture2D) {
                        data[key] = new cc.SpriteFrame(res);
                    } else if (res instanceof cc.SpriteFrame) {
                        data[key] = res;
                    }
                }
            }
        } else {
            //从服务器获取的资源
            if (this.serverAsset[serverUrl]) {
                for (let key in this.serverAsset[serverUrl]) {
                    let index = key.indexOf(url);
                    if (index >= 0) {
                        let res = this.serverAsset[serverUrl][key];
                        if (res instanceof cc.Texture2D) {
                            data[key] = new cc.SpriteFrame(res);
                        } else if (res instanceof cc.SpriteFrame) {
                            data[key] = res;
                        }
                    }
                }
            }
        }
        return data;
    }

    /**子包加载状态记录 */
    protected static subpackageRecords: { [name: string]: SubpackageRecord } = {};
    /**
     * 加载子包资源
     * @param name 子包名称
     * @param cb 回调函数，只需后台预加载资源时，传入null即可
     * @param mask 加载过程中是否需要显示进度条并阻断玩家触摸操作，当需要加载完成后立刻使用子包中的资源时，请传入true
     */
    public static loadSubpackage(name: string, cb: Function, mask?: boolean) {
        switch (GamePlatform.instance.Config.type) {
            case GamePlatformType.WX: {
                break;
            }
            default: {
                setTimeout(() => {
                    if (!!cb) cb();
                }, 0);
                return;
            }
        }
        if (undefined === mask) {
            mask = false;
        }
        let record = this.subpackageRecords[name];
        if (!record) {
            record = new SubpackageRecord(name, cb);
            this.subpackageRecords[name] = record;
        }
        //加载中，添加回调
        if (record.loading) {
            if (mask) this.showSubpackageProgress();
            record.pushCb(cb, mask);
            return;
        }
        //加载完成，执行回调
        if (record.finished) {
            setTimeout(() => {
                cb();
            }, 0);
            return;
        }
        //尚未加载，开始加载
        if (record.inited) {
            if (mask) this.showSubpackageProgress();
            record.loadStart();
            cc.loader.downloader.loadSubpackage(name, (err) => {
                if (err) {
                    cc.error(err);
                    return;
                }
                console.log("子包加载完成：", name);
                this.hideSubpackageProgress();
                // let count = record.maskCount;
                // if (count > 0) this.hideProgressBar(count);
                record.loadFinish();
            });
            return;
        }
    }
    protected static subpackageProgressTimer: number = null;
    /**显示子包加载进度条 */
    protected static showSubpackageProgress() {
        if (null === this.subpackageProgressTimer) {
            this.showProgressBar();
            this.subpackageProgress = 0;
            this.subpackageProgressTimer = setInterval(this.updateSubpackageProgress.bind(this), 100);
        }
    }
    protected static subpackageProgress: number = 0;
    protected static updateSubpackageProgress() {
        this.subpackageProgress += 0.03;
        if (this.subpackageProgress >= 1) {
            this.subpackageProgress = 0;
        }
        EventManager.emit(EventType.LoadAssetEvent.updateProgress, this.subpackageProgress);
    }
    protected static hideSubpackageProgress() {
        if (null !== this.subpackageProgressTimer) {
            clearInterval(this.subpackageProgressTimer);
            this.subpackageProgressTimer = null;
            this.subpackageProgress = 0;
            this.hideProgressBar();
        }
    }

}

class SubpackageRecord {
    /**子包名称 */
    public name: string;
    /**加载状态 */
    public state: LoadState;
    /**回调数组 */
    public cbs: Function[];
    public maskCount: number;

    public constructor(name: string, cb: Function) {
        this.name = name;
        this.state = LoadState.inited;
        this.cbs = [];
        this.pushCb(cb);
        this.maskCount = 0;
    }

    public pushCb(cb: Function, mask?: boolean) {
        this.cbs.push(cb);
        if (!!mask) this.maskCount++;
    }
    public loadStart() {
        this.state = LoadState.loading;
    }
    public loadFinish() {
        while (this.cbs.length > 0) {
            let cb = this.cbs.shift();
            if (!!cb) cb();
        }
        this.state = LoadState.finished;
        this.maskCount = 0;
    }

    public get inited() {
        return this.state === LoadState.inited;
    }
    public get loading() {
        return this.state === LoadState.loading;
    }
    public get finished() {
        return this.state === LoadState.finished;
    }
}
/**资源加载状态 */
enum LoadState {
    /**已准备好加载 */
    inited = 1,
    /**正在加载中 */
    loading,
    /**已加载完成 */
    finished,
}
