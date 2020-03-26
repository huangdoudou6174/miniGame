import { EventType } from "../GameSpecial/GameEventType";
import EventManager from "./EventManager";
import GameConfig from "../GameSpecial/GameConfig";

//体力管理器
export default class PowerManager {

    private static data: PowerData = null;

    public static init() {
        this.data = this.loadOldData();
        this.startAutoRecoverPower();
        this.onEvents();
    }
    private static loadOldData(): PowerData {
        let data = new PowerData();
        let oldData = cc.sys.localStorage.getItem(GameConfig.gameName + "PowerData");
        if (!!oldData) {
            oldData = JSON.parse(oldData);
            data.curPower = oldData.curPower;
            data.lastSaveTime = oldData.lastSaveTime;
        }
        return data;
    }
    private static startAutoRecoverPower() {
        let lastTime = this.data.lastSaveTime;
        let now = Date.now();
        let d1 = new Date(lastTime).getDate();
        let d2 = new Date(now).getDate();
        if (d2 > d1) {
            //隔天恢复满体力
            this.data.lastSaveTime = now;
            this.addPower(this.data.maxPower);
            setInterval(this.recoverPower.bind(this), this.data.recoverPowerInterval, this.data.recoverPowerValue);
        } else {
            //补充离线时间恢复的体力
            let passTime = now - lastTime;
            let power = Math.floor(passTime / this.data.recoverPowerInterval) * this.data.recoverPowerValue;
            let delay = passTime % this.data.recoverPowerInterval;
            if (power > 0) {
                this.data.lastSaveTime = now - delay;
                this.addPower(power);
            }
            setTimeout(() => {
                setInterval(this.recoverPower.bind(this), this.data.recoverPowerInterval, this.data.recoverPowerValue);
            }, delay);
        }
    }
    private static recoverPower() {
        this.data.addPower(this.data.recoverPowerValue);
        this.data.updateLastSaveTime();
        this.saveData();
        this.emit(EventType.AssetEvent.powerChanged, this.data.curPower);
    }
    private static onEvents() {
        EventManager.on(EventType.AssetEvent.consumePower, this.onConsumePower, this);
        EventManager.on(EventType.AssetEvent.getPower, this.addPower, this);
    }

    /**
     * 获取体力数据
     */
    public static getData(): { maxPower: number, curPower: number, totalTime: number, curTime: number } {
        return {
            //能够拥有的最大体力值
            maxPower: this.data.maxPower,
            //当前体力值
            curPower: this.data.curPower,
            //恢复体力需要的总时间，单位：秒
            totalTime: Math.floor(this.data.recoverPowerInterval * 0.001),
            //当前已经过的时间，单位：秒
            curTime: Math.floor((Date.now() - this.data.lastSaveTime) * 0.001),
        }
    }
    private static saveData() {
        cc.sys.localStorage.setItem(GameConfig.gameName + "powerData", JSON.stringify(this.data));
    }

    private static addPower(v: number = 1) {
        this.data.addPower(v);
        this.saveData();
        this.emit(EventType.AssetEvent.powerChanged, this.data.curPower);
    }
    private static subPower(v: number) {
        if (this.data.subPower(v)) {
            this.saveData();
            this.emit(EventType.AssetEvent.powerChanged, this.data.curPower);
        }
    }
    /**
     * 扣除体力，执行回调
     * @param data 
     * @param [data.cb]     回调函数
     * @param [data.power]  需要扣除的体力，默认为1
     */
    private static onConsumePower(data: { cb: Function, power?: number }) {
        let power = data.power;
        if (undefined == data.power) {
            power = 1;
        }
        if (this.data.subPower(power)) {
            !!data.cb && data.cb();
        } else {
            this.tipPowerUnEnough();
        }
    }
    private static tipPowerUnEnough() {
        this.emit(EventType.AssetEvent.powerUnEnough, this.data.curPower);
    }

    private static emit(eventType: any, data?: any) {
        EventManager.emit(eventType, data);
    }
}

class PowerData {
    /**最大体力值 */
    public maxPower: number = 10;
    /**体力自动恢复的时间间隔，单位：毫秒 */
    public recoverPowerInterval: number = 300000;
    /**体力自动恢复的量 */
    public recoverPowerValue: number = 1;
    /**当前体力值 */
    public curPower: number = 10;
    /**最后一次恢复体力的时间 */
    public lastSaveTime: number = 0;

    public constructor() {
        this.curPower = 10;
        this.lastSaveTime = Date.now();
    }

    public addPower(v: number = 1) {
        this.curPower += v;
        if (this.curPower > this.maxPower) {
            this.curPower = this.maxPower;
        }
    }
    public subPower(v: number): boolean {
        if (this.curPower < v) return false;
        this.curPower -= v;
        return true;
    }
    public updateLastSaveTime() {
        this.lastSaveTime = Date.now();
    }
}