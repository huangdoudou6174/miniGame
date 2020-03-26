import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import LevelDataTemplate from "../GameSpecial/LevelDataTemplate";

/**游戏JSON数据管理器 */
export default class GameData {
    /**
     * 记录所有游戏数据，
     * key:数据类型枚举值；
     * value:数据
     */
    private static data: { [key: string]: any } = {};
    public static init() {
        this.data = {};
        //一些常见的数据类型，使用默认数据进行初始化
        //关卡：
        this.data[GlobalEnum.GameDataType.levelData] = LevelDataTemplate.getData();

    }

    public static setData(res: any[], urls: string[]) {
        for (let key in GlobalEnum.GameDataType) {
            let index = this.getUrlsIndex(GlobalEnum.GameDataType[key], urls);
            if (index >= 0) {
                this.data[GlobalEnum.GameDataType[key]] = res[index].json;
            } else {
                console.warn("数据类型不存在：", GlobalEnum.GameDataType[key]);
            }
        }
    }
    /**获取数据类型字符串在资源url数组中的索引 */
    private static getUrlsIndex(name: string, urls: string[]): number {
        for (let i = urls.length - 1; i >= 0; --i) {
            if (urls[i].indexOf(name) >= 0) {
                return i;
            }
        }
        return -1;
    }

    /**添加记录数据 */
    public static addData(type: GlobalEnum.GameDataType, data: any) {
        if (!!this.data[type]) {
            console.warn("对应类型的数据已经存在，请检查类型是否重名:", type);
            return;
        }
        this.data[type] = data;
    }

    /**
     * 获取游戏数据
     * @param type  数据类型枚举值
     * @param key   需要的具体数据
     */
    public static getData(type: GlobalEnum.GameDataType, key?: any) {
        if (undefined === this.data[type]) {
            console.warn("不存在对应类型的数据：", type);
            return null;
        }
        if (undefined === key) {
            return this.data[type];
        } else {
            return this.data[type][key];
        }
    }

    //一些常见的数据的快捷获取方法
    /**关卡数据 */
    public static getLevelData(lv: number) {
        let data = this.data[GlobalEnum.GameDataType.levelData];
        if (!data) return null;
        return data[lv];
    }

    /**获取商品(皮肤)数据 */
    public static getGoodsData(type: GlobalEnum.GoodsType, id?: number | string) {
        if (undefined === this.data[type]) {
            console.warn("不存在对应类型的商品数据：", type);
            return null;
        }
        if (undefined === id) {
            return this.data[type];
        } else {
            return this.data[type][id];
        }
    }

}