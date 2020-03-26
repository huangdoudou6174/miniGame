
type Vec3 = {
    x: number,
    y: number,
    z: number
}

/**3D动画管理器 */
export default class Action3dManager {

    private static allActions: Action3d[] = [];

    public static update(dt: number) {
        for (let i = this.allActions.length - 1; i >= 0; --i) {
            this.allActions[i].update(dt);
            if (this.allActions[i].finished) {
                this.allActions.splice(i, 1);
            }
        }
    }
    public static runAction(node: cc.Node, action: Action3d) {
        this.stopAllActions(node);
        if (action.binded) {
            // let a = action.clone();
            console.warn("3D动作对象已绑定其他节点，当前节点无法运行该动作");
        } else {
            action.setTarget(node);
            this.allActions.push(action);
        }
    }
    public static stopAllActions(node?: cc.Node) {
        if (!!node) {
            for (let i = this.allActions.length - 1; i >= 0; --i) {
                if (this.allActions[i].node == node) {
                    this.allActions.splice(i, 1);
                }
            }
        } else {
            this.allActions = [];
        }
    }

    public static moveTo(duration: number, x: number | Vec3, y?: number, z?: number): Action3d {
        return new MoveTo3d(duration, x, y, z);
    }
    public static moveBy(duration: number, x: number | Vec3, y?: number, z?: number): Action3d {
        return new MoveBy3d(duration, x, y, z);
    }
    public static scaleTo(duration: number, x: number | Vec3, y?: number, z?: number): Action3d {
        return new ScaleTo3d(duration, x, y, z);
    }
    public static rotateTo(duration: number, x: number | Vec3, y?: number, z?: number): Action3d {
        return new RotateTo3d(duration, x, y, z);
    }
    public static rotateBy(duration: number, x: number | Vec3, y?: number, z?: number): Action3d {
        return new RotateBy3d(duration, x, y, z);
    }

    public static callFun(cb: Function, target?: any, data?: any): Action3d {
        return new CallFun3d(cb, target, data);
    }

    public static sequence(...actions): Action3d {
        return new Sequence3d(actions);
    }

    public static spawn(...actions): Action3d {
        return new Spawn3d(actions);
    }


    //缓动动作
    public static easeIn(rate: number): Ease {
        return new EaseIn(rate);
    }
    public static easeOut(rate: number): Ease {
        return new EaseOut(rate);
    }
    public static easeInOut(rate: number): Ease {
        return new EaseInOut(rate);
    }
    public static easeOutIn(rate: number): Ease {
        return new EaseOutIn(rate);
    }

    public static easeExponentialIn(): Ease {
        return new EaseExponentialIn();
    }
    public static easeExponentialOut(): Ease {
        return new EaseExponentialOut();
    }
    public static easeExponentialInOut(): Ease {
        return new EaseExponentialInOut();
    }



}

//动作基类
export class Action3d {
    public node: cc.Node;
    public get binded(): boolean { return !!this.node; }
    public setTarget(node: cc.Node) {
        this.node = node;
    }
    /**缓动动画的比率转换函数 */
    protected _easeList: Ease[];
    public easing(...args: Ease[]) {
        this._easeList = [];
        for (let i = 0, c = args.length; i < c; ++i) {
            this._easeList.push(args[i]);
        }
        return this;
    }
    /**缓动动作时间缩放 */
    protected computeEaseTime(dt: number) {
        let locList = this._easeList;
        if ((!locList) || (locList.length === 0)) {
            return dt;
        }
        for (var i = 0, n = locList.length; i < n; i++) {
            dt = locList[i].easing(dt);
        }
        return dt;
    }
    public get finished(): boolean { return false; }

    public update(dt: number) { }
}

//有限时长的动作
export class FiniteTimeAction3d extends Action3d {
    /**动作持续的总时间 */
    protected duration: number;
    /**动作累计已运行的时间 */
    protected elapse: number;

    public get finished(): boolean { return this.elapse >= this.duration; }
    protected _paused: boolean = false;
    public get paused(): boolean { return this._paused; }

    public constructor(duration: number) {
        super();
        this.duration = duration;
        this.elapse = 0;
    }
    public update(dt: number) {
        let rate = this.addElapseTime(dt);
        this.step(rate);
    }
    protected addElapseTime(dt: number): number {
        this.elapse += dt;
        let rate = 1;
        if (this.duration > 0) {
            rate = this.elapse / this.duration;
            if (rate > 1) rate = 1;
        }
        rate = this.computeEaseTime(rate);
        return rate;
    }
    protected step(rate: number) {

    }

    protected interpolation(min: number, max: number, rate: number) {
        return min + (max - min) * rate;
    }
}
//移动
export class MoveTo3d extends FiniteTimeAction3d {
    /**初始值 */
    private original: Vec3;
    /**目标值 */
    private target: Vec3;
    public constructor(duration: number, x: number | Vec3, y?: number, z?: number) {
        super(duration);
        if (typeof x === "number") {
            this.target = {
                x: x,
                y: y,
                z: z
            };
        } else {
            this.target = x;
        }
    }

    public setTarget(node: cc.Node) {
        this.node = node;
        this.original = {
            x: node.x,
            y: node.y,
            z: node.z
        };
    }

    public step(rate: number) {
        this.node.x = this.interpolation(this.original.x, this.target.x, rate);
        this.node.y = this.interpolation(this.original.y, this.target.y, rate);
        this.node.z = this.interpolation(this.original.z, this.target.z, rate);
    }
}
export class MoveBy3d extends FiniteTimeAction3d {
    /**初始值 */
    private original: Vec3;
    /**目标值 */
    private target: Vec3;
    public constructor(duration: number, x: number | Vec3, y?: number, z?: number) {
        super(duration);
        if (typeof x === "number") {
            this.target = {
                x: x,
                y: y,
                z: z
            };
        } else {
            this.target = x;
        }
    }

    public setTarget(node: cc.Node) {
        this.node = node;
        this.original = {
            x: node.x,
            y: node.y,
            z: node.z
        };
    }

    public step(rate: number) {
        this.node.x = this.original.x + this.target.x * rate;
        this.node.y = this.original.y + this.target.y * rate;
        this.node.z = this.original.z + this.target.z * rate;
    }
}
//缩放
export class ScaleTo3d extends FiniteTimeAction3d {
    /**初始值 */
    private original: Vec3;
    /**目标值 */
    private target: Vec3;
    public constructor(duration: number, x: number | Vec3, y?: number, z?: number) {
        super(duration);
        if (typeof x === "number") {
            this.target = {
                x: x,
                y: y,
                z: z
            };
        } else {
            this.target = x;
        }
    }

    public setTarget(node: cc.Node) {
        this.node = node;
        this.original = {
            x: node.scaleX,
            y: node.scaleY,
            z: node.scaleZ
        };
    }

    public step(rate: number) {
        let x = this.interpolation(this.original.x, this.target.x, rate);
        let y = this.interpolation(this.original.y, this.target.y, rate);
        let z = this.interpolation(this.original.z, this.target.z, rate);
        this.node.setScale(x, y, z);
    }
}
//旋转
export class RotateTo3d extends FiniteTimeAction3d {
    /**初始值 */
    private original: Vec3;
    /**目标值 */
    private target: Vec3;
    public constructor(duration: number, x: number | Vec3, y?: number, z?: number) {
        super(duration);
        if (typeof x === "number") {
            this.target = {
                x: x,
                y: y,
                z: z
            };
        } else {
            this.target = x;
        }
    }
    public setTarget(node: cc.Node) {
        this.node = node;
        this.original = {
            x: node.eulerAngles.x,
            y: node.eulerAngles.y,
            z: node.eulerAngles.z
        };
    }

    public step(rate: number) {
        let x = this.interpolation(this.original.x, this.target.x, rate);
        let y = this.interpolation(this.original.y, this.target.y, rate);
        let z = this.interpolation(this.original.z, this.target.z, rate);
        this.node.eulerAngles = cc.v3(x, y, z);
    }
}
export class RotateBy3d extends FiniteTimeAction3d {
    /**初始值 */
    private original: Vec3;
    /**目标值 */
    private target: Vec3;
    public constructor(duration: number, x: number | Vec3, y?: number, z?: number) {
        super(duration);
        if (typeof x === "number") {
            this.target = {
                x: x,
                y: y,
                z: z
            };
        } else {
            this.target = x;
        }
    }

    public setTarget(node: cc.Node) {
        this.node = node;
        this.original = {
            x: node.eulerAngles.x,
            y: node.eulerAngles.y,
            z: node.eulerAngles.z
        };
    }

    public step(rate: number) {
        let x = this.original.x + this.target.x * rate;
        let y = this.original.y + this.target.y * rate;
        let z = this.original.z + this.target.z * rate;
        this.node.eulerAngles = cc.v3(x, y, z);
    }
}
//回调函数
export class CallFun3d extends Action3d {
    private target: any;
    private cb: Function;
    private data: any;
    protected _finished: boolean = false;
    public get finished(): boolean { return this._finished; }

    public constructor(cb: Function, target?: any, data?: any) {
        super();
        this.cb = cb;
        this.target = target;
        this.data = data;
    }
    public update(dt: number) {
        if (this.finished) return;
        if (!!this.target) {
            this.cb.call(this.target, this.data || null);
        } else {
            this.cb(this.data || null);
        }
        this._finished = true;
    }
}

//队列动作
export class Sequence3d extends Action3d {
    /**动作列表 */
    protected actions: Action3d[];
    /**当前执行的动作索引 */
    protected curActionPtr: number;
    public get finished(): boolean { return this.curActionPtr >= this.actions.length; }
    public constructor(actions: Action3d[]) {
        super();
        this.curActionPtr = 0;
        this.actions = [].concat(actions);
    }
    public setTarget(node: cc.Node) {
        this.node = node;
        for (let i = this.actions.length - 1; i >= 0; --i) {
            this.actions[i].setTarget(node);
        }
    }
    public update(dt: number) {
        if (this.finished) return;
        let action = this.actions[this.curActionPtr];
        action.update(dt);
        if (action.finished) {
            this.curActionPtr++;
        }
    }
}
//同步动作
export class Spawn3d extends Action3d {
    /**动作列表 */
    protected actions: Action3d[];
    /**剩余未完成的动作 */
    private remainCount: number;
    public get finished(): boolean {
        return this.remainCount <= 0;
    }
    public constructor(actions: Action3d[]) {
        super();
        this.actions = [].concat(actions);
        this.remainCount = this.actions.length;
    }
    public setTarget(node: cc.Node) {
        this.node = node;
        for (let i = this.actions.length - 1; i >= 0; --i) {
            this.actions[i].setTarget(node);
        }
    }
    public update(dt: number) {
        if (this.finished) return;
        for (let i = this.actions.length - 1; i >= 0; --i) {
            if (!this.actions[i].finished) {
                this.actions[i].update(dt);
                if (this.actions[i].finished) {
                    this.remainCount--;
                }
            }
        }
    }
}

//缓动曲线
class Ease {
    public easing(dt: number): number {
        return dt;
    }
}
class EaseIn extends Ease {
    protected _rate: number;
    public constructor(rate: number) {
        super();
        this._rate = rate;
    }
    public easing(dt: number): number {
        return Math.pow(dt, this._rate);
    }
}
class EaseOut extends Ease {
    protected _rate: number;
    public constructor(rate: number) {
        super();
        this._rate = rate;
    }
    public easing(dt: number): number {
        return Math.pow(dt, 1 / this._rate);
    }
}
class EaseInOut extends Ease {
    protected _rate: number;
    public constructor(rate: number) {
        super();
        this._rate = rate;
    }
    public easing(dt: number): number {
        dt *= 2;
        if (dt < 1)
            return 0.5 * Math.pow(dt, this._rate);
        else
            return 1.0 - 0.5 * Math.pow(2 - dt, this._rate);
    }
}

class EaseOutIn extends Ease {
    protected _rate: number;
    public constructor(rate: number) {
        super();
        this._rate = rate;
    }
    public easing(dt: number): number {
        dt *= 2;
        if (dt < 1)
            return 1.0 - 0.5 * Math.pow(2 - dt, this._rate);
        else
            return 0.5 * Math.pow(dt, this._rate);
    }
}
/**指数函数缓动进入 */
class EaseExponentialIn extends Ease {
    public easing(dt: number): number {
        return dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1));
    }
}
/**指数函数缓动退出 */
class EaseExponentialOut extends Ease {
    public easing(dt: number): number {
        return dt === 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1);
    }
}
/**指数函数缓动进入——退出 */
class EaseExponentialInOut extends Ease {
    public easing(dt: number): number {
        if (dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                return 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        return dt;
    }
}