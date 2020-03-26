import { IPoolObject } from "./IPoolObject";

/**
 * 节点对象池，对象池为空时可自动实例化新的对象
 */
export class AutoNodePool {
    private prefab: cc.Prefab;
    private scripteName: string;
    private pool: cc.NodePool;
    /**
     * 节点对象池，对象池为空时可自动实例化新的对象
     * @param prefab 预制
     * @param scriptName 节点挂载的脚本，管理节点进出对象池时的逻辑，必须实现接口IPoolObject
     */
    constructor(prefab: cc.Prefab, scriptName?: string) {
        this.prefab = prefab;
        this.scripteName = scriptName;
        this.pool = new cc.NodePool(scriptName);
    }

    /**
     * 获取实例
     * @param data 给实例赋值的数据
     */
    public get(data?: any): cc.Node {
        let item: cc.Node = this.pool.get(data);
        if (!item) {
            item = cc.instantiate(this.prefab);
            if (!!this.scripteName) {
                let s: IPoolObject = item.getComponent(this.scripteName);
                if (!!s) {
                    s.init(data);
                } else {
                    this.scripteName = null;
                }
            }
        }
        return item;
    }

    /**
     * 回收节点
     * @param item
     */
    public put(item: cc.Node) {
        this.pool.put(item);
    }

    /**
     * 清空对象池，将销毁所有缓存的实例
     */
    public clear() {
        this.pool.clear();
    }
}
