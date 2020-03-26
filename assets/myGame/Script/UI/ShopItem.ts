import Loader from "../Common/Loader";
import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";

const { ccclass, property } = cc._decorator;
/**
 * 单个商品
 */
@ccclass
export default class ShopItem extends yyComponent {
    @property(cc.Sprite)
    protected itemSprite: cc.Sprite = null;

    @property(cc.Node)
    protected LockMask: cc.Node = null;
    protected _unclock: boolean = false;
    /**商品项是否已解锁 */
    public get unlock() { return this._unclock; }
    public set unlock(v) {
        this._unclock = !!v;
        this.LockMask.active = !this._unclock;
    }

    @property(cc.Node)
    protected chooseMask: cc.Node = null;
    protected _isChecked: boolean = false;
    /**商品项是否被选中 */
    public get isChecked() { return this._isChecked; }
    public set isChecked(v) {
        this._isChecked = !!v;
        this.chooseMask.active = this._isChecked;
    }

    @property(cc.Label)
    protected itemName: cc.Label = null;
    @property(cc.Label)
    protected price: cc.Label = null;

    public data: any;

    public init(data?: any) {
        this.isChecked = false;
        this.onEvents();
        if (!!data) this.setData(data);
    }

    protected onEvents() {
        this.node.on("touchend", this.onTouchEnd, this);
    }

    public reset() {
        this.data = null;
        this.isChecked = false;
    }

    public reuse(data: any) {
        this.reset();
        this.setData(data);
    }

    public unuse() {
        this.reset();
    }


    protected setData(data: { id: number, itemUrl: string, name: string, price: number, unlock: boolean }) {
        //数据
        this.data = data;
        //图片
        this.itemSprite.spriteFrame = Loader.getSpriteFrame(data.itemUrl);
        //名称
        this.itemName.string = data.name;
        //价格
        this.price.string = data.price.toString();
        //状态
        this.unlock = data.unlock;
    }

    protected onTouchEnd() {
        if (this.isChecked) return;
        this.isChecked = true;
        this.emit(EventType.ShopEvent.chooseItem, this);
    }
}

