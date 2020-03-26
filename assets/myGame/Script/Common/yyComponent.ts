import EventManager, { Handler } from "./EventManager";
import { IPoolObject } from "./IPoolObject";

//抽象类，自定义脚本基类，包含通用功能
const { ccclass, property } = cc._decorator;

@ccclass
export default class yyComponent extends cc.Component implements IPoolObject {
    //自动id
    private static _autoId: number = 1;
    private _customId: number = null;
    public get Id() {
        if (null === this._customId) {
            this._customId = yyComponent._autoId++;
        }
        return this._customId;
    }
    /**从数组中移除元素，只限于yyComponent的子类，返回结果是否移除成功 */
    public removeElementInArray(ele: yyComponent, arr: yyComponent[]): boolean {
        let id = ele.Id;
        for (let i = 0, count = arr.length; i < count; ++i) {
            if (arr[i].Id == id) {
                arr.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    //适用于自动对象池的接口函数，需在子类重写
    /**初始化数据，取代原有的onLoad方法，子类实现 */
    public init(data?: any) {
        this.initComponents();
        this.registAllCustomUpdate();
        this.onEvents();
        if (!!data) this.setData(data);
    }
    /**初始化脚本以外的其他组件 */
    protected initComponents() {
        if (!!this.node.parent) {
            let wg = this.node.getComponent(cc.Widget);
            if (!!wg) {
                wg.updateAlignment();
            }
            let ly = this.node.getComponent(cc.Layout);
            if (!!ly) {
                ly.updateLayout();
            }
        }
    }
    /**注册通过自定义事件管理器管理的事件，子类实现 */
    protected onEvents() { }
    /**注册所有自定义运行状态与函数，子类实现 */
    protected registAllCustomUpdate() { }
    /**重置状态、数据等，子类实现 */
    public reset() { }
    /**设置状态、数据等，子类实现 */
    protected setData(data?: any) { }
    /**从对象池中取回实例重新使用时将执行的方法，可重置状态、数据，设置新的状态、数据 */
    public reuse(data?: any) {
        this.reset();
        this.onEvents();
        if (!!data) this.setData(data);
    }
    /**放回对象池时将执行的方法，应当注销事件、计时器等 */
    public unuse() {
        this.reset();
        this.offEvents();
    }

    //自定义的运行状态
    protected _customUpdateState: any;
    public get customUpdateState() { return this._customUpdateState; }
    /**运行状态与运行函数的映射表，key：运行状态枚举值，value：运行函数 */
    protected customUpdateMap;
    //当前状态对应的每帧更新函数
    protected customStep: (dt: number) => void;
    protected stepEmpty(dt: number) { }
    /**初始化运行状态 */
    protected initCustomUpdateState() {
        this._customUpdateState = null;
        this.customStep = this.stepEmpty;
        this.customUpdateMap = {};
    }
    /**重置运行状态 */
    protected resetCustomUpdateState() {
        this._customUpdateState = null;
        this.customStep = this.stepEmpty;
    }
    /**注册运行状态与函数，注册后，脚本切换到该状态时，自定义更新函数中将执行该方法 */
    protected registCustomUpdate(state: any, step: Function) {
        if (!this.customUpdateMap) {
            this.customUpdateMap = {};
        }
        this.customUpdateMap[state] = step;
    }
    /**切换到指定的运行状态 */
    protected enterCustomUpdateState(state: any) {
        if (this._customUpdateState != state) {
            this._customUpdateState = state;
            if (!!this.customUpdateMap[state]) {
                this.customStep = this.customUpdateMap[state];
            } else {
                this.customStep = this.stepEmpty;
            }
        }
    }

    /**自定义的每帧更新函数 */
    public customUpdate(dt: number) {
        if (!!this.customStep) {
            this.customStep(dt);
        }
    }
    /**遍历数组执行其自定义的更新函数 */
    public runCustomUpdate(cps: yyComponent[], dt: number) {
        for (let i = cps.length - 1; i >= 0; --i) {
            cps[i].customUpdate(dt);
        }
    }

    //节点相关属性
    public get x() { return this.node.x; }
    public get y() { return this.node.y; }
    public get z() { return this.node.z; }
    public setPosition(pos: cc.Vec3) {
        this.node.setPosition(pos);
    }
    public getPosition() {
        if (this.node.is3DNode) {
            return cc.v3(this.x, this.y, this.z);
        } else {
            return cc.v3(this.x, this.y);
        }
    }

    public get angleX() { return this.node.eulerAngles.x; }
    public get angleY() { return this.node.eulerAngles.y; }
    public get angleZ() { return this.node.eulerAngles.z; }
    public setEulerAngles(eulerAngles: cc.Vec3) {
        this.node.eulerAngles = eulerAngles;
    }

    public setScale(scale: cc.Vec3) {
        this.node.setScale(scale);
    }

    /**适用于UI节点，显示UI并设置UI内容 */
    public show(data?: any) {
        this.node.active = true;
        if (!!data) this.setData(data);
    }
    /**适用于UI节点，隐藏UI */
    public hide() {
        this.node.active = false;
    }
    /**获取数据 */
    public getData(data?: any) {
        return null;
    }
    //通用的事件功能：
    /**
     * 记录所有事件类型与对应回调函数的字典，销毁脚本时，根据此字典注销其事件
     * key:事件类型枚举值
     * value:事件类型对应的回调函数数组
     */
    private events: { [type: number]: Handler[] } = {};
    /**
     * 记录所有只触发一次的事件类型与对应回调函数的字典
     * key:事件类型枚举值
     * value:事件类型对应的回调函数数组
     */
    private onceEvents: { [type: number]: Handler[] } = {};
    /**
     * 注册事件
     * @param {number} type 事件类型枚举值
     * @param {Function} cb 回调函数
     * @param {Object} target 函数所属对象
     */
    public on(type: number, cb: Function, target: Object) {
        let h: Handler = EventManager.on(type, cb, target);
        if (!!h) {
            if (!this.events.hasOwnProperty(type)) {
                this.events[type] = [];
            }
            this.events[type].push(h);
        }
    }
    /**
     * 注册只触发一次的事件
     * @param {number} type 事件类型枚举值
     * @param {Function} cb 回调函数
     * @param {Object} target 函数所属对象
     */
    public once(type: number, cb: Function, target: Object) {
        let h: Handler = EventManager.once(type, cb, target);
        if (!!h) {
            if (!this.onceEvents.hasOwnProperty(type)) {
                this.onceEvents[type] = [];
            }
            this.onceEvents[type].push(h);
        }
    }
    public off(type: number, cb: Function, target: Object) {
        let events = this.events[type];
        if (!!events) {
            for (let i = events.length - 1; i >= 0; --i) {
                if (events[i].cb === cb && events[i].target === target) {
                    EventManager.off(type, events[i]);
                    events.splice(i, 1);
                }
            }
        }
        events = this.onceEvents[type];
        if (!!events) {
            for (let i = events.length - 1; i >= 0; --i) {
                if (events[i].cb === cb && events[i].target === target) {
                    EventManager.off(type, events[i]);
                    events.splice(i, 1);
                }
            }
        }
    }
    /**
     * 发送事件
     * @param {number} type 事件类型枚举值
     * @param {any} data 传给回调函数的参数
     */
    public emit(type: number, d1?: any, d2?: any, d3?: any, d4?: any, d5?: any) {
        if (undefined === d1) {
            EventManager.emit(type);
        } else if (undefined === d2) {
            EventManager.emit(type, d1);
        } else if (undefined === d3) {
            EventManager.emit(type, d1, d2);
        } else if (undefined === d4) {
            EventManager.emit(type, d1, d2, d3);
        } else if (undefined === d5) {
            EventManager.emit(type, d1, d2, d3, d4);
        } else {
            EventManager.emit(type, d1, d2, d3, d4, d5);
        }
        if (this.onceEvents.hasOwnProperty(type)) delete this.onceEvents[type];
    }
    /**
     * 注销脚本中注册的所有事件
     */
    public offEvents() {
        for (let key in this.events) {
            EventManager.offGroup(key, this.events[key]);
        }
        this.events = {};
        for (let key in this.onceEvents) {
            EventManager.offGroup(key, this.onceEvents[key]);
        }
        this.onceEvents = {};
    }

    onDestroy() {
        this.offEvents();
    }
}