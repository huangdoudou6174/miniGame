import { AutoNodePool } from "./AutoPool";

//全局节点对象池
export default class GlobalPool {
    private static allPools: { [nodeName: string]: AutoNodePool } = {};
    /**
     * 创建新的对象池
     * @param nodeName 节点名称
     * @param prefab 节点预制资源
     * @param scriptName 节点上挂载的脚本名称，必须实现接口IPoolObject，用于处理节点进出对象池时的逻辑
     */
    public static createPool(nodeName: string, prefab: cc.Prefab, scriptName?: string): void {
        if (this.allPools.hasOwnProperty(nodeName)) {
            console.warn("已存在该名称的对象池，请确认是否名字冲突：", nodeName);
            return;
        }
        this.allPools[nodeName] = new AutoNodePool(prefab, scriptName);
    }
    /**
     * 获取实例
     * @param nodeName 要获取的节点名称
     * @param data 节点需要的数据
     * @returns {cc.Node} 按传入的数据进行设置的节点实例
     */
    public static get(nodeName: string, data?: any): cc.Node {
        if (!this.allPools[nodeName]) {
            console.error("未创建对应名称的对象池，获取实例失败：", nodeName);
            return null;
        }
        return this.allPools[nodeName].get(data);
    }
    /**
     * 回收节点
     * @param nodeName 节点名称，与节点要放回的对象池名称对应
     * @param node 回收的节点
     */
    public static put(node: cc.Node, nodeName?: string) {
        if (!nodeName) nodeName = node.name;
        if (!this.allPools[nodeName]) {
            console.warn("未创建对应名称的对象池，将销毁节点：", nodeName);
            let js = node.getComponent(nodeName);
            if (!!js && !!js.unuse) {
                js.unuse();
            }
            node.destroy();
            return;
        }
        this.allPools[nodeName].put(node);
    }
    /**
     * 回收节点的所有子节点
     * @param node 
     */
    public static putAllChildren(node: cc.Node) {
        for (let i = node.childrenCount - 1; i >= 0; --i) {
            let child = node.children[i];
            this.put(child);
        }
    }
    /**
     * 清空对象池缓存，未指定名称时将清空所有的对象池
     * @param nodeName 对象池名称
     */
    public static clear(nodeName?: string) {
        if (!!nodeName) {
            if (this.allPools.hasOwnProperty(nodeName)) {
                this.allPools[nodeName].clear();
                delete this.allPools[nodeName];
            }
        } else {
            for (let key in this.allPools) {
                this.allPools[key].clear();
            }
            this.allPools = {};
        }
    }
}
