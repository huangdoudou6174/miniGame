import EventManager from "./EventManager";
import PlayerDataTemplate from "../GameSpecial/PlayerDataTemplate";
import GameConfig from "../GameSpecial/GameConfig";
import { EventType } from "../GameSpecial/GameEventType";

//玩家数据管理器
export default class PlayerData {
    private static Data: any = {};
    public static init() {
        this.Data = PlayerDataTemplate.getData();
        cc.sys.localStorage.removeItem(GameConfig.gameName + "PlayerData");
        let v = cc.sys.localStorage.getItem(GameConfig.gameName + "PlayerData");
        if (!!v) {
            v = JSON.parse(v);
            this.copyObject(this.Data, v);
        }
        this.onEvents();
    }
    private static copyObject(target: any, src: any) {
        for (let key in src) {
            switch (typeof src[key]) {
                case "number":
                case "boolean":
                case "string": {
                    target[key] = src[key];
                    break;
                }
                case "object": {
                    if (Array.isArray(src[key])) {
                        target[key] = [].concat(src[key]);
                    } else {
                        if (undefined == target[key]) target[key] = {};
                        this.copyObject(target[key], src[key]);
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
    private static onEvents() {
        EventManager.on(EventType.PlayerDataEvent.updatePlayerData, this.onUpdatePlayerData, this);
    }
    /**
     * 更新玩家数据
     * @param data 
     * @param {string} [data.type] 数据类型
     * @param {string} [data.attribute] 要修改的数据的字段名称，用“.”号分割多级子属性，例如“gameData.curLevel”
     * @param {number|string} [data.value] 属性改变的量
     * @param {string} [data.mode] 数据修改方式
     */
    static onUpdatePlayerData(data: { type: string, attribute: string, value: number | string, mode: string }) {
        if (data.attribute.indexOf(".") < 0) {
            this.updateData(this.Data, data.attribute, data.value, data.mode);
        } else {
            let str = data.attribute.split(".");
            let playerData = this.Data;
            for (let i = 0; i < str.length - 1; ++i) {
                if (undefined != playerData[str[i]]) {
                    playerData = playerData[str[i]];
                } else {
                    cc.log("修改玩家数据失败，玩家数据未定义对应属性：" + str[i]);
                    cc.log(data);
                    return;
                }
            }
            this.updateData(playerData, str[str.length - 1], data.value, data.mode);
        }
        this.saveData();
        //数据更新后发送事件，UI组件自动处理
        EventManager.emit(EventType.PlayerDataEvent.playerDataChanged, {
            type: data.type,                        //数据类型
            attribute: data.attribute,              //数据名称
            value: this.getData(data.attribute),    //变更后的数据值
        });
    }
    /**
     * 更新对象的字段值
     * @param data      字段所属对象
     * @param attribute 字段名称
     * @param value     要改变的值
     * @param mode      改变方式
     */
    private static updateData(data: any, attribute: string, value: any, mode: string) {
        switch (mode) {
            case "+": {
                data[attribute] += parseFloat(value);
                break;
            }
            case "-": {
                data[attribute] -= parseFloat(value);
                break;
            }
            case "*": {
                data[attribute] *= parseFloat(value);
                break;
            }
            case "=": {
                data[attribute] = parseFloat(value);
                break;
            }
            case "push": {
                data[attribute].push(value);
                break;
            }
            default: {
                cc.log("数据修改失败，未定义的数据修改方式：" + mode);
                break;
            }
        }
    }
    /**
     * 获取玩家数据
     * @param attribute 字段名称，用“.”号分割多级子属性，例如“gameData.curLevel”
     */
    static getData(attribute: string) {
        if (!attribute) {
            return this.Data;
        }
        if (attribute.indexOf(".") < 0) {
            return this.Data[attribute];
        }
        let str = attribute.split(".");
        let playerData = this.Data;
        for (let i = 0; i < str.length; ++i) {
            if (undefined != playerData[str[i]]) {
                playerData = playerData[str[i]];
            } else {
                return playerData;
            }
        }
        return playerData;
    }
    //存储数据，将在本地存储，并发送给服务端
    private static saveData() {
        cc.sys.localStorage.setItem(GameConfig.gameName + "PlayerData", JSON.stringify(this.Data));
        //todo: 发送给服务端
    }
}
