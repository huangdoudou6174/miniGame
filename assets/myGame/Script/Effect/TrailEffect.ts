
// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TrailEffect extends cc.Component {

    @property(cc.MeshRenderer)
    protected meshRenderer: cc.MeshRenderer = null;
    protected mesh: cc.Mesh = null;
    /**Z轴方向的曲面细分等级 */
    @property(cc.Integer)
    protected level: number = 5;
    @property(cc.Integer)
    /**拖尾的柔软度，值越大尾巴越柔软 */
    protected soft: number = 5;
    /**是否跟随目标节点的角度 */
    @property(cc.Boolean)
    protected followAngle: boolean = false;

    /**拖尾头部的坐标 */
    protected startPosition: cc.Vec3 = cc.v3();
    /**拖尾尾部的坐标 */
    protected endPosition: cc.Vec3 = cc.v3();
    protected initPosition() {
        this.startPosition = cc.v3();
        this.endPosition = cc.v3();
    }

    /**网格顶点数据 */
    protected verts: cc.Vec3[] = [];
    /**拖尾横截面的顶点坐标x、y，按逆时针排列 */
    protected polygon: cc.Vec2[];
    protected initPolygon() {
        this.polygon = [];
    }
    protected resetPolygon() {
        this.polygon = [];
    }
    /**设置横截面 */
    public setShape(polygon: cc.Vec2[]) {
        this.polygon = [].concat(polygon);
        this.createVerts();
        this.createMesh();
    }
    /**根据截面形状和拖尾位置创建网格顶点 */
    protected createVerts() {
        //顶点的Z轴偏移为0
        this.verts = [];
        for (let i = 0; i <= this.level; ++i) {
            for (let j = 0, c = this.polygon.length; j < c; ++j) {
                this.verts.push(cc.v3(this.polygon[j].x, this.polygon[j].y, 0).addSelf(this.startPosition));
            }
        }
    }

    /**创建网格数据 */
    protected createMesh() {
        // let gfx = cc.renderer.renderEngine.gfx;
        let gfx = cc.gfx;
        // 定义顶点数据格式，只需要指明所需的属性，避免造成存储空间的浪费
        var vfmtPosColor = new gfx.VertexFormat([
            // 用户需要创建一个三维的盒子，所以需要三个值来保存位置信息
            { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 3 },
            { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
            { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
        ]);
        this.mesh = new cc.Mesh();
        let mesh = this.mesh;

        // 初始化网格信息
        mesh.init(vfmtPosColor, this.verts.length, true);
        // 修改 position 顶点数据
        mesh.setVertices(gfx.ATTR_POSITION, this.verts);
        // 修改 color 顶点数据
        let colors = [];
        for (let i = 0, c = this.verts.length; i < c; ++i) {
            colors.push(cc.Color.WHITE);
        }
        mesh.setVertices(gfx.ATTR_COLOR, colors);
        // 修改 uv 顶点数据
        //todo:需要修改
        let uv: cc.Vec2[] = [];
        let nPolygon = this.polygon.length;
        for (let i = 0; i <= this.level; ++i) {
            for (let j = 0; j < nPolygon; ++j) {
                uv.push(cc.v2(1 - i / this.level, j / nPolygon));
            }
        }
        mesh.setVertices(gfx.ATTR_UV0, uv);

        // 修改索引数据
        let frag: number[] = [];
        for (let i = 0; i < this.level; ++i) {
            let maxJ = nPolygon - 1;
            for (let j = 0; j < maxJ; ++j) {
                let index = i * nPolygon;
                frag.push(index, index + 1, index + nPolygon);
                frag.push(index + 1, index + nPolygon + 1, index + nPolygon);
            }
            if (nPolygon > 2) {
                let index = i * nPolygon + maxJ;
                frag.push(index, index - maxJ, index + 1);
                frag.push(index + 1, index + maxJ + 1, index);
            }
        }
        mesh.setIndices(frag);
        this.meshRenderer.mesh = mesh;
    }
    protected resetMesh() {
        let nPolygon = this.polygon.length;
        for (let i = 0; i <= this.level; ++i) {
            for (let j = 0; j < nPolygon; ++j) {
                this.verts[i * nPolygon + j].set(cc.v3(this.polygon[j].x, this.polygon[j].y, 0).addSelf(this.startPosition));
            }
        }
        this.endPosition.set(this.startPosition);
        // let gfx = cc.renderer.renderEngine.gfx;
        let gfx = cc.gfx;
        this.mesh.setVertices(gfx.ATTR_POSITION, this.verts);
    }
    /**更新网格形状 */
    protected updateMesh() {
        let rate = this.soft == 0 ? 0.2 : (1 / this.soft);
        let nPolygon = this.polygon.length;
        for (let i = 1; i <= this.level; ++i) {
            let index = i * nPolygon;
            for (let j = 0; j < nPolygon; ++j) {
                let previousVert = this.verts[index - nPolygon + j];
                let nextVert = this.verts[index + j];
                this.interpolationPos(nextVert, previousVert, rate);
            }
        }

        // let gfx = cc.renderer.renderEngine.gfx;
        let gfx = cc.gfx;
        this.mesh.setVertices(gfx.ATTR_POSITION, this.verts);
    }
    protected getInterpplation(a: number, b: number, r: number) {
        return (b - a) * r;
    }
    protected interpolationPos(p1: cc.Vec3, p2: cc.Vec3, rate: number) {
        p1.x += this.getInterpplation(p1.x, p2.x, rate);
        p1.y += this.getInterpplation(p1.y, p2.y, rate);
        p1.z += this.getInterpplation(p1.z, p2.z, rate);
    }

    public init() {
        this.initPosition();
        this.initPolygon();
    }

    public reset() {
        this.resetMesh();
        this._playing = false;
    }


    protected _playing: boolean = false;
    public get playing() { return this._playing; }
    public play(startPosition: cc.Vec3, angle?: cc.Vec3) {
        if (this.polygon.length == 0) {
            cc.warn("拖尾特效未设置横截面形状！");
            return;
        }
        if (!this.target) {
            cc.warn("拖尾未设置跟随的目标节点！");
            return;
        }
        this._playing = true;
        this.startPosition.set(startPosition);
        this.resetMesh();
    }
    public stop() {
        this._playing = false;
    }

    /**设置拖尾的中心点的位置 */
    public moveTo(pos: cc.Vec3, angle?: cc.Vec3) {
        this.startPosition = pos;
        if (undefined === angle) {
            // let len = pos.z - this.endPosition.z;
            for (let i = this.polygon.length - 1; i >= 0; --i) {
                this.verts[i].x = this.startPosition.x + this.polygon[i].x;
                this.verts[i].y = this.startPosition.y + this.polygon[i].y;
                this.verts[i].z = this.startPosition.z;
            }
        } else {
            for (let i = this.polygon.length - 1; i >= 0; --i) {
                let offset = cc.v3(this.polygon[i].x, this.polygon[i].y, 0);
                offset = this.rotatePos(offset, angle);
                this.verts[i].x = this.startPosition.x + offset.x;
                this.verts[i].y = this.startPosition.y + offset.y;
                this.verts[i].z = this.startPosition.z + offset.z;
            }
        }
        this.updateMesh();
    }
    protected rotatePos(p: cc.Vec3, angle: cc.Vec3): cc.Vec3 {
        return p;
    }

    /**跟随的目标节点 */
    protected target: cc.Node;
    protected offset: cc.Vec3;
    /**
     * 设置拖尾跟随的目标节点
     * @param target 目标节点，需要与本节点在同一父节点下，或者其所有父节点的坐标、角度为（0,0,0），缩放为（1,1,1）
     * @param offset 拖尾的中心点相对目标节点的坐标的偏移量
     */
    public setTarget(target: cc.Node, offset: cc.Vec3) {
        this.target = target;
        this.offset = offset.clone();
    }

    // //通用方法：
    // public update(dt: number) {
    //     if (!this.playing || !this.target) return;
    //     let pos = cc.v3();
    //     this.target.getPosition(pos);
    //     pos.addSelf(this.offset);
    //     if (!this.followAngle) {
    //         this.moveTo(pos);
    //     } else {
    //         this.moveTo(pos, this.target.eulerAngles);
    //     }
    // }

    //优化方法：
    public customUpdate(dt: number) {
        if (!this._playing) {
            this.moveTo(this.startPosition);
        } else {
            this.moveTo(cc.v3(0, this.target.y + 0.5, this.target.z));
        }
    }
}
