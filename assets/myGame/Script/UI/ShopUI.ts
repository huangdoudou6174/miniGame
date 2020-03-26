import yyComponent from "../Common/yyComponent";
import { IUI } from "./IUI";
import { EventType } from "../GameSpecial/GameEventType";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import Loader from "../Common/Loader";
import PlayerData from "../Common/PlayerData";
import GameData from "../Common/GameData";
import ShopItem from "./ShopItem";
import GlobalPool from "../Common/GlobalPool";

const { ccclass, property } = cc._decorator;
/**皮肤商城UI*/
@ccclass
export default class ShopUI extends yyComponent implements IUI {

    /**场景/UI类型 */
    protected _uiType: GlobalEnum.UI = GlobalEnum.UI.shop;
    public get uiType() { return this._uiType; }

    /**展示商品详情的图片精灵 */
    @property(cc.Sprite)
    protected displaySprite: cc.Sprite = null;

    @property(cc.ToggleContainer)
    protected goodsTypeToggles: cc.ToggleContainer = null;

    /**页面滚动视图 */
    @property(cc.PageView)
    protected pageView: cc.PageView = null;
    protected initPage() {
        GlobalPool.createPool(this.shopItemPerfab.name, this.shopItemPerfab, this.shopItemPerfab.name);
        GlobalPool.createPool(this.storePage.name, this.storePage);
    }
    protected resetPage() {
        let pages = this.pageView.getPages();
        for (let i = pages.length - 1; i >= 0; --i) {
            GlobalPool.putAllChildren(pages[i]);
        }
        this.pageView.removeAllPages();
    }
    /**单个商品页面的预制件 */
    @property(cc.Prefab)
    storePage: cc.Prefab = null; //商城页面
    /**当前商品的价格 */
    @property(cc.Label)
    price: cc.Label = null;
    /**商品项 */
    @property(cc.Prefab)
    shopItemPerfab: cc.Prefab = null;
    /**使用中提示文本 */
    @property(cc.Node)
    protected tipCurSkin: cc.Node = null;
    @property(cc.Node)
    protected goldTip: cc.Node = null;
    protected initGoldTip() {
        this.goldTip.active = false;
    }
    protected resetGoldTip() {
        this.goldTip.stopAllActions();
        this.goldTip.opacity = 255;
        this.goldTip.active = false;
    }

    //3D展示方式：
    /**商品展示台 */
    @property(cc.Node)
    protected displayStage: cc.Node = null;
    /**展示3D模型节点的父节点 */
    @property(cc.Node)
    protected modelStage: cc.Node = null;
    /**商品展示台相机 */
    @property(cc.Camera)
    protected camera: cc.Camera = null;
    /**当前用来展示的3D模型节点 */
    protected curItemModel: cc.Node = null;
    /**3D模型动作 */
    protected modelTween: cc.Tween = null;
    protected initDisplayStage() {
        let wg = this.displayStage.getComponent(cc.Widget);
        if (!!wg) {
            wg.updateAlignment();
        }
        let y = this.displayStage.y;
        let rate = y / cc.find("Canvas").height;
        this.camera.rect = cc.rect(0, rate, 1, 1);
    }
    protected resetDisplayStage() {
        if (!!this.modelTween) {
            this.modelTween.stop();
            this.modelTween = null;
        }
        if (!!this.curItemModel) {
            GlobalPool.put(this.curItemModel);
            this.curItemModel = null;
        }
    }


    public init() {
        this.curItem = null;
        this.curType = null;
        this.initComponents();
        this.initDisplayStage();
        this.initGoldTip();
        this.initPage();
        this.onEvents();
    }
    protected onEvents() {
        this.on(EventType.ShopEvent.chooseItem, this.onChooseItem, this);
    }
    public reset() {
        this.curItem = null;
        this.curType = null;
        this.resetDisplayStage();
        this.resetGoldTip();
        this.resetPage();
    }

    public show() {
        this.node.active = true;
        this.reset();
        let dir = this.getRootUrl() + GlobalEnum.UrlPath.skinItemDir;
        Loader.loadResDir(dir, this.setData.bind(this), cc.SpriteFrame, true);
    }

    protected setData() {
        let toggles = this.goodsTypeToggles.toggleItems;
        if (toggles.length > 0) {
            toggles[0].isChecked = true;
            let handler = toggles[0].checkEvents[0];
            if (!handler) {
                console.warn("商品类型分页标签未绑定回调函数");
                return;
            }
            let type: GlobalEnum.GoodsType = handler.customEventData as GlobalEnum.GoodsType;
            this.showGoods(type);
        }
    }
    public hide() {
        this.reset();
        this.node.active = false;
    }

    protected getRootUrl() {
        return GlobalEnum.UrlPath.skinRootUrl + this.curType + "/";
    }
    /**当前选中的商品分页的类型 */
    protected curType: GlobalEnum.GoodsType;
    protected onChooseType(e, data) {
        if (this.curType == data) return;
        this.showGoods(data);
    }
    /**
     * 显示商品
     * 应当新建一个展示台的类，负责根据实际游戏展示对应的商品模型或图片
     */
    protected showGoods(type: GlobalEnum.GoodsType) {
        this.resetPage();
        this.curType = type;
        let goodsData = GameData.getGoodsData(type);
        let maxCount = 6;
        let unlockSkins = PlayerData.getData("gameData." + type + ".owned");
        let curSkin = PlayerData.getData("gameData." + type + ".cur");
        if (typeof curSkin === "number") {
            curSkin = curSkin.toString();
        }
        let page: cc.Node = cc.instantiate(this.storePage);
        this.pageView.addPage(page);
        let rootPath = this.getRootUrl();
        let displayPath = rootPath + GlobalEnum.UrlPath.skinDisplayDir + "/";
        let itemPath = rootPath + GlobalEnum.UrlPath.skinItemDir + "/";
        let pageIndex = 0;
        for (let key in goodsData) {
            if (page.childrenCount >= maxCount) {
                page = cc.instantiate(this.storePage);
                this.pageView.addPage(page);
            }
            let data = JSON.parse(JSON.stringify(goodsData[key]));
            data.itemUrl = itemPath + data.itemUrl;
            data.displayUrl = displayPath + data.displayUrl;
            data.unlock = unlockSkins.indexOf(parseInt(key)) >= 0;
            let node = GlobalPool.get(this.shopItemPerfab.name, data);
            if (key == curSkin) {
                let item = node.getComponent(ShopItem);
                item.isChecked = true;
                this.curItem = item;
                pageIndex = this.pageView.getPages().length - 1;
            }
            page.addChild(node);
        }
        this.pageView.scrollToPage(pageIndex, 0);
        if (!!this.curItem) {
            this.showItemData(this.curItem.data);
        }
    }

    /**当前选中的商品项 */
    protected curItem: ShopItem = null;
    protected onChooseItem(item: ShopItem) {
        if (!!this.curItem) {
            if (this.curItem.Id === item.Id) return;
            this.curItem.isChecked = false;
        }
        this.curItem = item;
        if (this.curItem.data.unlock) {
            this.setCurSkin(this.curType, this.curItem.data.id);
        }
        this.showItemData(item.data);
    }
    /**展示商品详情 */
    protected showItemData(data) {
        //图片展示方式：
        // this.showGoodsImg(data.displayUrl);
        //3D模型展示方式：
        this.showGoodsModel(data.model, data.skin);

        if (data.unlock) {
            this.showUsing();
        } else {
            this.showPrice(data.price);
        }
    }
    /**2D图片展示 */
    protected showGoodsImg(img: string) {
        Loader.loadRes(img, (res) => {
            if (this.displaySprite.isValid) {
                this.displaySprite.spriteFrame = Loader.getSpriteFrame(img);
            }
        }, false);
    }
    /**3D模型展示 */
    protected showGoodsModel(model: string, skin: string) {
        let angle = cc.v3();
        if (!!this.modelTween) {
            this.modelTween.stop();
            this.modelTween = null;
        }
        if (!!this.curItemModel) {
            angle.set(this.curItemModel.eulerAngles);
            GlobalPool.put(this.curItemModel);
            this.curItemModel = null;
        }
        this.curItemModel = GlobalPool.get(model);

        let url = this.getRootUrl() + GlobalEnum.UrlPath.skinTextureDir + "/" + skin;
        Loader.loadRes(url, (res) => {
            if (!this.node.active || !this.node.isValid) return;
            let mesh = this.curItemModel.getComponentInChildren(cc.MeshRenderer);
            let sf;
            if (res instanceof cc.SpriteFrame) {
                sf = res;
            } else if (res instanceof cc.Texture2D) {
                sf = new cc.SpriteFrame(res);
            }
            mesh.getMaterial(0).setProperty("diffuseTexture", sf);
        }, false);

        this.modelStage.addChild(this.curItemModel);
        this.curItemModel.setPosition(cc.v3(0, 0, 0));
        this.curItemModel.eulerAngles = angle;
        this.modelTween = cc.tween(this.curItemModel).repeatForever(cc.tween(this.curItemModel).by(4, { eulerAngles: cc.v3(0, 180, 0) })).union().start();
    }

    protected showPrice(price: number) {
        this.price.string = price.toString();
    }
    protected showUsing() {
        this.price.string = "使用中";
    }

    /**退出商城 */
    protected onBtnExit() {
        this.emit(EventType.UIEvent.exit, this.uiType);
    }
    /**购买 */
    protected onBtnBuy() {
        if (!this.curItem) return;
        if (this.curItem.data.unlock) return;
        let price = this.curItem.data.price;
        let gold = PlayerData.getData("gameData.asset.gold");
        if (gold < price) {
            this.tipGoldUnenough();
        } else {
            this.subGold(price);
            this.unlockSkin(this.curType, this.curItem.data.id);
            this.setCurSkin(this.curType, this.curItem.data.id);
            this.curItem.data.unlock = true;
            this.curItem.unlock = true;
            this.showUsing();
        }
    }
    protected subGold(gold: number) {
        this.emit(EventType.PlayerDataEvent.updatePlayerData, {
            type: "gameData",
            attribute: "gameData.asset.gold",
            value: gold,
            mode: "-",
        });
    }
    /**
     * 解锁皮肤
     * @param type 皮肤类型
     * @param id 皮肤id
     */
    protected unlockSkin(type, id) {
        this.emit(EventType.PlayerDataEvent.updatePlayerData, {
            type: "gameData",
            attribute: "gameData." + type + ".owned",
            value: parseInt(id),
            mode: "push"
        });
    }
    /**
     * 设置当前使用的皮肤
     * @param type 皮肤类型
     * @param id 皮肤id
     */
    protected setCurSkin(type, id) {
        this.emit(EventType.PlayerDataEvent.updatePlayerData, {
            type: "gameData",
            attribute: "gameData." + type + ".cur",
            value: parseInt(id),
            mode: "="
        });
    }
    /** 提示金币不足 */
    protected tipGoldUnenough() {
        this.goldTip.stopAllActions();
        this.goldTip.active = true;
        this.goldTip.opacity = 255;
        this.goldTip.runAction(cc.sequence(cc.delayTime(2), cc.fadeOut(1)));
    }
    /**观看视频 */
    clickVideoBt() {
        this.emit(EventType.SDKEvent.showVideo, () => {
            this.emit(EventType.UIEvent.playGoldAmin, {
                cb: () => {
                    this.emit(EventType.PlayerDataEvent.updatePlayerData, {
                        type: "gameData",
                        attribute: "gameData.asset.gold",
                        value: 200,
                        mode: "+"
                    });
                }
            })
        });
    }

}
