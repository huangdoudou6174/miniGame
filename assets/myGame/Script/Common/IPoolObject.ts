//可放入对象池的对象的接口
export interface IPoolObject {
    /**
     * 对象池中创建新的实例时，将调用此函数初始化实例
     */
    init: (data?: any) => void;
    /**
     * 对象池中已经存在的实例重新取出使用时，将调用此函数
     */
    reuse: (data?: any) => void;
    /**
     * 节点放回对象池时将调用的函数
     */
    unuse: () => void;
}