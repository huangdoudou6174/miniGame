/**
 * 链表
 * 默认为双向链表，接口与数组基本一致
 */
export default class List<T>{
    private _firstNode: ListNode<T> = null;
    private _lastNode: ListNode<T> = null;
    private count: number = 0;
    /**链表长度 */
    public get length(): number { return this.count; }
    /**清空链表 */
    public clear() {
        this.reset();
    }
    public reset() {
        let node = this.first;
        while (!!node) {
            node.prev = null;
            node = node.next;
        }
        node = this.last;
        while (!!node) {
            node.next = null;
            node = node.prev;
        }
        this._firstNode = null;
        this._lastNode = null;
        this.count = 0;
    }
    /**添加链表第一个节点 */
    private addFirstNode(v: T) {
        if (this.count > 0) {
            console.error("list.addFirstNode error: list._firstNode is not null.");
            return;
        }
        let node = new ListNode<T>(v);
        this._firstNode = node;
        this._lastNode = node;
        this.count = 1;
    }
    /**链表第一个节点 */
    public get first(): ListNode<T> {
        return this._firstNode;
    }
    /**在尾部添加一个节点 */
    public push(v: T) {
        if (this.count <= 0) {
            this.addFirstNode(v);
        } else {
            let node = new ListNode(v);
            node.prev = this._lastNode;
            this._lastNode.next = node;
            this._lastNode = node;
            this.count++;
        }
    }
    /**链表最后一个节点 */
    public get last(): ListNode<T> {
        return this._lastNode;
    }
    /**移除并返回最后一个节点 */
    public pop(): ListNode<T> {
        if (this.count == 0) return null;
        if (this.count == 1) {
            let node = this._firstNode;
            this.clear();
            return node;
        } else {
            let node = this._lastNode;
            this._lastNode = this._lastNode.prev;
            this._lastNode.next = null;
            this.count--;
            node.prev = null;
            return node;
        }
    }
    /**移除并返回链表第一个节点 */
    public shift(): ListNode<T> {
        if (this.count <= 0) return null;
        let node = this._firstNode;
        if (this.count == 1) {
            this.clear();
            return node;
        }
        this._firstNode = this._firstNode.next;
        this._firstNode.prev = null;
        this.count--;
        node.next = null;
        return node;
    }
    /**在头部添加一个节点 */
    public unshift(v: T) {
        if (this.count <= 0) {
            this.addFirstNode(v);
        } else {
            let node = new ListNode<T>(v);
            node.next = this._firstNode;
            this._firstNode.prev = node;
            this._firstNode = node;
            this.count++;
        }
    }
    /**获取指定索引位置的节点 */
    public at(index: number): ListNode<T> {
        if (index < 0 || index >= this.count) return null;
        let node = this._firstNode;
        while (--index >= 0) {
            node = node.next;
        }
        return node;
    }
    /**获取指定索引位置的节点的值 */
    public get(index: number): T {
        let node = this.at(index);
        return !!node ? node.value : null;
    }
    /**在指定索引位置插入值 */
    public insert(index: number, v: T) {
        if (index >= this.count) {
            this.push(v);
            return;
        }
        if (index <= 0) {
            this.unshift(v);
            return;
        }
        let node = this._firstNode;
        while (--index >= 0) {
            node = node.next;
        }
        let n = new ListNode<T>(v);
        n.prev = node;
        n.next = node.next;
        node.next.prev = n;
        node.next = n;
    }
    /**移除指定节点 */
    public remove(index: number | ListNode<T>): ListNode<T> {
        if (typeof index === "number") {
            return this.removeByIndex(index);
        } else if (index instanceof ListNode && this.indexOf(index) >= 0) {
            let node = index;
            if (!node.prev) {
                node.prev.next = node.next;
            }
            if (!node.next) {
                node.next.prev = node.prev;
            }
            this.count--;
            node.prev = null;
            node.next = null;
            return node;
        }
    }
    /**
     * 移除指定节点，调用者需确保该节点属于本链表，否则将造成本链表数据丢失
     * @param node 
     */
    public removeNode(node: ListNode<T>) {
        if (!!node.prev) {
            node.prev.next = node.next;
        }
        if (!!node.next) {
            node.next.prev = node.prev;
        }
        node.prev = null;
        node.next = null;
        this.count--;
    }
    /**查找指定节点或值在链表中的索引位置 */
    public indexOf(node: ListNode<T> | T) {
        if (node instanceof ListNode) {
            let index = 0;
            let n = this._firstNode;
            while (!!n && n != node) {
                n = n.next;
                index++;
            }
            return n == node ? index : -1;
        } else {
            let index = 0;
            let n = this._firstNode;
            while (!!n && n.value != node) {
                n = n.next;
                index++;
            }
            return n.value == node ? index : -1;
        }
    }
    private removeByIndex(index: number): ListNode<T> {
        if (index < 0 || index >= this.count) return null;
        let node = this._firstNode;
        while (--index >= 0) {
            node = node.next;
        }
        if (!node.prev) {
            node.prev.next = node.next;
        }
        if (!node.next) {
            node.next.prev = node.prev;
        }
        this.count--;
        node.prev = null;
        node.next = null;
        return node;
    }
    /**从指定索引位置开始移除一定数量的节点 */
    public splice(index: number, count: number = 1) {
        if (index < 0 || index >= this.count) return;
        if (count == 1) {
            this.removeByIndex(index);
            return;
        }
        let startNode = this._firstNode;
        while (--index >= 0) {
            startNode = startNode.next;
        }
        let lastNode = startNode.next;
        while (--count > 0 && !!lastNode) {
            lastNode = lastNode.next;
        }
        if (!!startNode.prev) {
            startNode.prev.next = lastNode;
        }
        if (!!lastNode) {
            lastNode.prev = startNode.prev;
        }
        while (!!startNode) {
            startNode.prev = null;
            let n = startNode.next;
            startNode.next = null;
            startNode = n;
        }
        this.count -= count;
    }
}
/**链表节点 */
export class ListNode<T>{
    /**节点中存储的值 */
    public value: T = null;
    /**前一个节点 */
    public prev: ListNode<T> = null;
    /**后一个节点 */
    public next: ListNode<T> = null;
    public constructor(v: T) {
        this.value = v;
    }
}
