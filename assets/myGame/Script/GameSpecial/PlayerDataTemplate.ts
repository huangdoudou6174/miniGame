
//玩家数据示例
export default class PlayerDataTemplate {
    private constructor() { }
    public static getData(): any {
        return {
            gameData: {
                curLevel: 1,
                //玩家资源
                asset: {
                    gold: 0,        //金币
                    power: 10,      //体力
                },
                //主角皮肤
                PlayerSkin: {
                    cur: 1,         //当前使用的皮肤
                    owned: [1],     //已拥有的皮肤
                },
            },
        };
    }
}
