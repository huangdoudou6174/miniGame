/**
 * 全局使用的游戏配置，只包含静态数据
 */
export default class GameConfig {
    private constructor() { }

    /**远程资源服务器地址 */
    public static resourceUrl: string = "";
    /**远程资源服务器上本游戏使用的文件夹名称 */
    public static serverGameName: string = "myGame";

    /**游戏名称字符串 */
    public static gameName: string = "myGame";
    /**
     * 游戏规则
     */
    public static GameRule = {

    };
    //触摸操作参数
    public static ctrlConfig = {

    };

}