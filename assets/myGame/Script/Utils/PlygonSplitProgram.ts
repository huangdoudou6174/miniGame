import List, { ListNode } from "./List";
type Vec2 = {
    x: number,
    y: number
}
export default class PlygonSplitProgram {
    private static pList: List<PointStatus> = null;
    /**
     * 分割多边形
     * @param points 多边形顶点的坐标数组，按逆时针排列
     * @returns 分割后的三角形的顶点在points数组中的索引，每三个连续的顶点表示一个三角形，按逆时针排列
     */
    public static process(points: Vec2[]): number[] {
        if (points.length < 3) return [];
        this.pList = new List<PointStatus>();
        for (let i = 0, c = points.length; i < c; ++i) {
            this.pList.push(new PointStatus(i, points[i]));
        }
        let node = this.pList.first;
        let concaveCount = 0;
        while (!!node) {
            this.updatePointStatus(node);
            if (!node.value.isConvex) {
                concaveCount++;
            }
            node = node.next;
        }
        if (concaveCount == 0) {
            let tri = this.processConvexPlygon(points);
            this.reset();
            return tri;
        }
        if (concaveCount == 1) {
            let index = 0;
            let node = this.pList.first;
            while (node.value.isConvex) {
                index++;
                node = node.next;
            }
            let tri = this.processSingleConcavePlygon(points, index);
            this.reset();
            return tri;
        }
        let tri: number[] = [];
        node = this.pList.first;
        while (this.pList.length >= 3) {
            while (!!node && !node.value.isSeparable) {
                node = node.next;
            }
            if (!node) {
                node = this.pList.first;
                while (!!node && !node.value.isSeparable) {
                    node = node.next;
                }
                if (!node) {
                    console.warn("多边形分割尚未未完成，但找不到可分割顶点:", this.pList);
                    break;
                }
            }
            let prev = node.prev ? node.prev : this.pList.last;
            let next = node.next ? node.next : this.pList.first;
            tri.push(prev.value.pIndex, node.value.pIndex, next.value.pIndex);
            this.pList.removeNode(node);
            this.updatePointStatus(prev);
            this.updatePointStatus(next);
            node = next;
        }
        this.reset();
        return tri;
    }
    private static updatePointStatus(node: ListNode<PointStatus>) {
        let prev = node.prev ? node.prev : this.pList.last;
        let next = node.next ? node.next : this.pList.first;
        if (!node.value.isConvex) {
            if (this.isConvex(node.value.point, node.prev.value.point, node.next.value.point)) {
                node.value.isConvex = true;
            } else {
                node.value.isSeparable = false;
                return;
            }
        }
        let tri = [prev.value.point, node.value.point, next.value.point];
        let p = this.pList.first;
        while (!!p) {
            if (!p.value.isConvex && p != node && p != prev && p != next) {
                if (this.inTriangle(p.value.point, tri)) {
                    node.value.isSeparable = false;
                    return;
                }
            }
            p = p.next;
        }
        node.value.isSeparable = true;
    }
    private static processConvexPlygon(points: Vec2[]): number[] {
        let tri: number[] = [];
        for (let i = 1, c = points.length - 1; i < c; ++i) {
            tri.push(0, i, i + 1);
        }
        return tri;
    }
    private static processSingleConcavePlygon(points: Vec2[], concavePointIndex: number): number[] {
        if (concavePointIndex == 0) {
            return this.processConvexPlygon(points);
        }
        let tri: number[] = [];
        let index = concavePointIndex;
        let lastIndex = points.length - 1;
        for (let i = concavePointIndex + 1; i < lastIndex; ++i) {
            tri.push(index, i, i + 1);
        }
        if (index !== lastIndex) {
            tri.push(index, lastIndex, 0);
        }
        let preIndex = index - 1;
        for (let i = 0; i < preIndex; ++i) {
            tri.push(index, i, i + 1);
        }
        return tri;
    }
    private static isConvex(p: Vec2, p1: Vec2, p2: Vec2): boolean {
        return this.cross(this.sub(p, p1), this.sub(p2, p)) >= 0;
    }
    private static inTriangle(p: Vec2, tri: Vec2[]): boolean {
        let ab = this.sub(tri[1], tri[0]);
        let ac = this.sub(tri[2], tri[0]);
        let bc = this.sub(tri[2], tri[1]);
        let ad = this.sub(p, tri[0]);
        let bd = this.sub(p, tri[1]);
        // let ac = tri[2].sub(tri[0]);
        // let bc = tri[2].sub(tri[1]);
        // let ad = p.sub(tri[0]);
        // let bd = p.sub(tri[1]);
        let b = this.cross(ab, ac) >= 0;
        return (b !== (this.cross(ab, ad) < 0)) &&
            (b !== this.cross(ac, ad) >= 0) &&
            (this.cross(bc, ab) > 0) !== (this.cross(bc, bd) >= 0);
    }
    private static reset() {
        if (!!this.pList) {
            this.pList.reset();
            this.pList = null;
        }
    }
    private static cross(p1: Vec2, p2: Vec2): number {
        return p1.x * p2.y - p1.y * p2.x;
    }
    private static sub(p1: Vec2, p2: Vec2): Vec2 {
        return {
            x: p1.x - p2.x,
            y: p1.y - p2.y
        };
    }
}

class PointStatus {
    public pIndex: number;
    public point: Vec2 = null;
    public isConvex: boolean = false;
    public isSeparable: boolean = false;
    public constructor(index: number, v: Vec2) {
        this.pIndex = index;
        this.point = v;
    }
}