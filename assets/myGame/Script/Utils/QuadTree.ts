
/**
 * 四叉树
 * 管理的对象需要实现ITreeObj接口
 */
export default class QuadTree {
    protected static root: TreeNode = null;
    /**
     * 
     * @param minX 
     * @param maxX 
     * @param minY 
     * @param maxY 
     * @param depth 四叉树最大深度，根据四叉树最大尺寸与碰撞体最小尺寸来设置
     * @param count 四叉树的节点包含的最大对象数，插入对象数量大于该值时，节点将分裂为4个子节点
     */
    public static init(minX: number, maxX: number, minY: number, maxY: number, depth?: number, count?: number) {
        if (!!depth && depth > 0) TreeNode.maxDepth = depth;
        if (!!count && count > 0) TreeNode.maxCount = count;
        if (!this.root) {
            this.root = Pool.get(minX, maxX, minY, maxY);
        } else {
            this.root.reset();
            this.root.set(minX, maxX, minY, maxY);
        }
    }
    public static reset() {
        if (!!this.root) {
            this.root.reset();
        }
    }
    public static removeObj(obj?: any, node?: TreeNode) {
        if (undefined === node) {
            node = this.root;
        }
        node.removeObj(obj);
    }
    public static insertObj(obj?: any): TreeNode {
        if (!this.root) {
            console.error("插入对象错误：四叉树未初始化！");
            return null;
        }
        let node = this.root.insertObj(obj);
        // cc.log("节点深度：", node.depth);
        return node;
    }
    public static getObjsByObj(obj?: any) {
        if (undefined === obj) {
            return this.root.getObjs();
        } else {
            let node = this.getTreeNode(obj);
            let rect = TreeNode.getObjRect(obj);
            return node.getObjs(rect);
        }
    }
    public static getObjsByNode(node: TreeNode, obj?: any) {
        if (undefined === obj) {
            return node.getObjs();
        } else {
            let rect = TreeNode.getObjRect(obj);
            return node.getObjs(rect);
        }
    }
    /**完全包含对象的树节点 */
    public static getTreeNode(obj?: any): TreeNode {
        if (undefined === obj) {
            return this.root;
        }
        let rect = TreeNode.getObjRect(obj);
        return this.getContainNode(this.root, rect);
    }
    protected static getContainNode(node: TreeNode, rect: Rect) {
        if (!node.leaf1) {
            return node;
        }
        if (TreeNode.contain(node.leaf1, rect)) {
            return this.getContainNode(node.leaf1, rect);
        }
        if (TreeNode.contain(node.leaf2, rect)) {
            return this.getContainNode(node.leaf2, rect);
        }
        if (TreeNode.contain(node.leaf3, rect)) {
            return this.getContainNode(node.leaf3, rect);
        }
        if (TreeNode.contain(node.leaf4, rect)) {
            return this.getContainNode(node.leaf4, rect);
        }
        return node;
    }
}

//节点
export class TreeNode {
    public parent: TreeNode = null;
    public leaf1: TreeNode = null;
    public leaf2: TreeNode = null;
    public leaf3: TreeNode = null;
    public leaf4: TreeNode = null;
    // public objs: any[];
    public objs: { [id: number]: any };
    public minX: number;
    public maxX: number;
    public minY: number;
    public maxY: number;
    public width: number;
    public height: number;
    public centerX: number;
    public centerY: number;
    public depth: number;
    public count: number;//完全包含在节点内的对象数量
    public static maxDepth: number = 7;
    public static maxCount: number = 10;

    public constructor(minX: number, maxX: number, minY: number, maxY: number, parent?: TreeNode) {
        this.set(minX, maxX, minY, maxY, parent);
    }
    public set(minX: number, maxX: number, minY: number, maxY: number, parent?: TreeNode) {
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;
        this.width = this.maxX - this.minX;
        this.height = this.maxY - this.minY;
        this.centerX = (this.minX + this.maxX) * 0.5;
        this.centerY = (this.minY + this.maxY) * 0.5;
        this.objs = {};
        this.count = 0;
        this.parent = parent;
        if (!!parent) {
            this.depth = parent.depth + 1;
        } else {
            this.depth = 0;
        }
    }
    public split() {
        let x = this.centerX;
        let y = this.centerY;
        this.leaf1 = Pool.get(x, this.maxX, y, this.maxY, this);
        this.leaf2 = Pool.get(this.minX, x, y, this.maxY, this);
        this.leaf3 = Pool.get(this.minX, x, this.minY, y, this);
        this.leaf4 = Pool.get(x, this.maxX, this.minY, y, this);

        // for (let i = this.objs.length - 1; i >= 0; --i) {
        //     this.insertIntoChildLeaf(this.objs[i]);
        // }
        let objs = this.objs;
        this.objs = {};
        this.count = 0;
        for (let key in objs) {
            this.insertObj(objs[key]);
        }
    }
    public removeObj(obj?: any) {
        let rect = TreeNode.getObjRect(obj);
        if (!TreeNode.cross(rect, this)) {
            return;
        }
        if (!!this.objs[obj.Id]) {
            this.count -= 1;
            delete this.objs[obj.Id];
        }
        // let index = this.objs.indexOf(obj);
        // if (index >= 0) {
        //     this.objs.splice(index, 1);
        // } else 
        if (!!this.leaf1) {
            if (TreeNode.cross(rect, this.leaf1)) {
                this.leaf1.removeObj(obj);
            }
            if (TreeNode.cross(rect, this.leaf2)) {
                this.leaf2.removeObj(obj);
            }
            if (TreeNode.cross(rect, this.leaf3)) {
                this.leaf3.removeObj(obj);
            }
            if (TreeNode.cross(rect, this.leaf4)) {
                this.leaf4.removeObj(obj);
            }
        }
    }
    public insertObj(obj?: any): TreeNode {
        let rect = TreeNode.getObjRect(obj);
        if (!TreeNode.cross(this, rect)) {
            // if (!!this.parent) {
            //     return this.parent.insertObj(obj);
            // } else {
            //     return null;
            // }
            cc.log("对象与节点没有相交:");
            cc.log(this.minX, this.minY, this.width, this.height);
            cc.log(rect);
        } else {
            if (!!this.leaf1) {
                return this.insertIntoChildLeaf(obj, rect);
            } else if (this.depth < TreeNode.maxDepth && this.count >= TreeNode.maxCount) {
                this.split();
                return this.insertObj(obj);
            } else {
                return this.insertIntoSelf(obj);
            }
        }
    }
    protected insertIntoChildLeaf(obj?: any, rect?: Rect) {
        if (undefined === rect) {
            rect = TreeNode.getObjRect(obj);
        }
        if (rect.minX >= this.centerX) {
            if (rect.minY >= this.centerY) {
                return this.leaf1.insertObj(obj);
            } else if (rect.maxY < this.centerY) {
                return this.leaf4.insertObj(obj);
            } else {
                this.leaf1.insertObj(obj);
                this.leaf4.insertObj(obj);
                return this.insertIntoSelf(obj);
            }
        } else if (rect.maxX <= this.centerX) {
            if (rect.minY >= this.centerY) {
                return this.leaf2.insertObj(obj);
            } else if (rect.maxY < this.centerY) {
                return this.leaf3.insertObj(obj);
            } else {
                this.leaf2.insertObj(obj);
                this.leaf3.insertObj(obj);
                return this.insertIntoSelf(obj);
            }
        } else if (rect.minY >= this.centerY) {
            this.leaf1.insertObj(obj);
            this.leaf2.insertObj(obj);
            return this.insertIntoSelf(obj);
        } else if (rect.maxY <= this.centerY) {
            this.leaf3.insertObj(obj);
            this.leaf4.insertObj(obj);
            return this.insertIntoSelf(obj);
        } else {
            this.leaf1.insertObj(obj);
            this.leaf2.insertObj(obj);
            this.leaf3.insertObj(obj);
            this.leaf4.insertObj(obj);
            return this.insertIntoSelf(obj);
        }
    }
    protected insertIntoSelf(obj?: any): TreeNode {
        // this.objs.push(obj);
        this.objs[obj.Id] = obj;
        this.count++;
        return this;
    }
    /**矩形1是否完全包含矩形2 */
    public static contain(rect1: Rect, rect2: Rect): boolean {
        return rect1.minX <= rect1.minX
            && rect1.maxX >= rect2.maxX
            && rect1.minY <= rect2.minY
            && rect1.maxY >= rect2.maxY;
    }
    /**获取对象的矩形范围 */
    public static getObjRect(obj?: any): Rect {
        return obj.getRect();
    }
    /**
     * 获取节点内包含的对象
     * @param rect 不传参数时，默认获取节点下的全部对象，传入参数时，会先检测对象与节点及子节点是否相交，只返回相交的节点中的对象
     */
    public getObjs(rect?: Rect): { [id: number]: any } {
        if (undefined === rect) {
            return this.getAllObjs();
        } else if (TreeNode.cross(rect, this)) {
            return this.getCrossObjs(rect);
        } else {
            return {};
        }
    }
    public getAllObjs(): { [id: number]: any } {
        if (!this.leaf1) {
            return this.objs;
        }
        // let objs = [].concat(this.objs);
        // objs = objs.concat(this.leaf1.getObjs());
        // objs = objs.concat(this.leaf2.getObjs());
        // objs = objs.concat(this.leaf3.getObjs());
        // objs = objs.concat(this.leaf4.getObjs());
        let objs = {};
        TreeNode.copyObjs(objs, this.objs);
        let o1 = this.leaf1.getAllObjs();
        TreeNode.copyObjs(objs, o1);
        let o2 = this.leaf2.getAllObjs();
        TreeNode.copyObjs(objs, o2);
        let o3 = this.leaf3.getAllObjs();
        TreeNode.copyObjs(objs, o3);
        let o4 = this.leaf4.getAllObjs();
        TreeNode.copyObjs(objs, o4);
        return objs;
    }
    public static copyObjs(target: any, res: any) {
        for (let key in res) {
            target[key] = res[key];
        }
    }
    public getCrossObjs(rect: Rect): { [id: number]: any } {
        let objs = {};
        TreeNode.copyObjs(objs, this.objs);
        if (!this.leaf1) {
            return objs;
        }
        // let objs = [].concat(this.objs);
        // if (TreeNode.cross(rect, this.leaf1)) {
        //     objs = objs.concat(this.leaf1.getCrossObjs(rect));
        // }
        // if (TreeNode.cross(rect, this.leaf2)) {
        //     objs = objs.concat(this.leaf2.getCrossObjs(rect));
        // }
        // if (TreeNode.cross(rect, this.leaf3)) {
        //     objs = objs.concat(this.leaf3.getCrossObjs(rect));
        // }
        // if (TreeNode.cross(rect, this.leaf4)) {
        //     objs = objs.concat(this.leaf4.getCrossObjs(rect));
        // }
        // return objs;

        if (TreeNode.cross(rect, this.leaf1)) {
            let o1 = this.leaf1.getCrossObjs(rect);
            TreeNode.copyObjs(objs, o1);
        }
        if (TreeNode.cross(rect, this.leaf2)) {
            let o2 = this.leaf2.getCrossObjs(rect);
            TreeNode.copyObjs(objs, o2);
        }
        if (TreeNode.cross(rect, this.leaf3)) {
            let o3 = this.leaf3.getCrossObjs(rect);
            TreeNode.copyObjs(objs, o3);
        }
        if (TreeNode.cross(rect, this.leaf4)) {
            let o4 = this.leaf4.getCrossObjs(rect);
            TreeNode.copyObjs(objs, o4);
        }
        return objs;
    }
    public static cross(rect1: Rect, rect2: Rect): boolean {
        return rect1.minX <= rect2.maxX
            && rect1.maxX >= rect2.minX
            && rect1.minY <= rect2.maxY
            && rect1.maxY >= rect2.minY;
    }

    public reset() {
        this.parent = null;
        this.objs = {};
        this.count = 0;
        this.depth = 0;
        if (!!this.leaf1) {
            Pool.put(this.leaf1);
            Pool.put(this.leaf2);
            Pool.put(this.leaf3);
            Pool.put(this.leaf4);
            this.leaf1 = null;
            this.leaf2 = null;
            this.leaf3 = null;
            this.leaf4 = null;
        }
    }
}
type Rect = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
};
//节点对象池
class Pool {
    protected static nodes: TreeNode[] = [];
    public static get(minX: number, maxX: number, minY: number, maxY: number, parent?: TreeNode) {
        if (this.nodes.length > 0) {
            let node = this.nodes.pop();
            node.set(minX, maxX, minY, maxY, parent);
            return node;
        } else {
            return new TreeNode(minX, maxX, minY, maxY, parent);
        }
    }
    public static put(node: TreeNode) {
        node.reset();
        this.nodes.push(node);
    }
}
