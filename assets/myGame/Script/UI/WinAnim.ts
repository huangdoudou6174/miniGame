
const { ccclass, property } = cc._decorator;

@ccclass
export default class WinAnim extends cc.Component {
    @property([cc.Prefab])
    protected prefabs: cc.Prefab[] = [];

    @property(cc.Integer)
    protected minScale: number = 0.5;
    @property(cc.Integer)
    protected maxScale: number = 2;
    @property(cc.Integer)
    protected minAngle: number = 0;
    @property(cc.Integer)
    protected maxAngle: number = 180;
    @property(cc.Integer)
    protected minSkew: number = 0;
    @property(cc.Integer)
    protected maxSkew: number = 5;
    @property(cc.Integer)
    protected duration: number = 1;
    @property(cc.Integer)
    protected minSpd: number = 1500;
    @property(cc.Integer)
    protected maxSpd: number = 2500;
    @property(cc.Integer)
    protected gravity: number = -3000;
    @property(cc.Integer)
    protected count: number = 100;

    protected particles: Particle[] = [];
    protected index = 0;
    protected addItem() {
        this.index++;
        if (this.index >= this.prefabs.length) {
            this.index = 0;
        }
        let node = cc.instantiate(this.prefabs[this.index]);
        let scale = this.randomScope(this.minScale, this.maxScale);
        let angle = this.randomScope(this.minAngle, this.maxAngle);
        let skew = this.randomScope(this.minSkew, this.maxSkew);
        node.setScale(scale);
        node.angle = angle;
        node.skewX = skew;
        node.skewY = this.randomScope(this.minSkew, this.maxSkew);

        let duration = this.duration;
        node.runAction(cc.spawn(
            cc.scaleTo(duration, this.randomScope(this.minScale, this.maxScale), this.randomScope(this.minScale, this.maxScale)),
            cc.rotateTo(duration, this.randomScope(this.minAngle, this.maxAngle)),
            cc.skewTo(duration, this.randomScope(this.minSkew, this.maxSkew), this.randomScope(this.minSkew, this.maxSkew))
        ));

        let v = cc.v2();
        let spd = this.minSpd + Math.random() * (this.maxSpd - this.minSpd);
        let radian = (Math.random() * 0.5 + 0.25) * 3.14;
        v.x = spd * Math.cos(radian);
        v.y = spd * Math.sin(radian);
        this.particles.push(new Particle(node, v, this.gravity));

        node.setPosition(0, 0);
        this.node.addChild(node);

    }
    protected randomScope(min: number, max: number) {
        return min + Math.random() * (max - min);
    }

    public play() {
        for (let i = 0; i < this.count; ++i) {
            this.addItem();
        }
        this.schedule(this.step.bind(this), 0.016);
    }
    protected step(dt: number = 0.016) {
        for (let i = this.particles.length - 1; i >= 0; --i) {
            this.particles[i].update(dt);
            if (this.particles[i].finished) {
                this.particles[i].node.destroy();
                this.particles.splice(i, 1);
            }
        }
        if (this.particles.length == 0) {
            this.onFinish();
        }
    }
    protected onFinish() {
        this.unscheduleAllCallbacks();
    }

}
class Particle {
    public node: cc.Node;
    public spd: cc.Vec2;
    public gravity: number;
    constructor(node: cc.Node, spd: cc.Vec2, g: number) {
        this.node = node;
        this.spd = spd;
        this.gravity = g;
    }
    public update(dt: number) {
        this.spd.y += this.gravity * dt;
        this.node.setPosition(this.node.x + this.spd.x * dt, this.node.y + this.spd.y * dt);
    }
    public get finished() {
        return this.node.y < -667;
    }
}
