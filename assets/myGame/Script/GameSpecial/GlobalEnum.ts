//全局使用的枚举
export module GlobalEnum {
    
    //音效文件
    export enum AudioClip {
        clickBtn = "Common/Audio/clickBtn",
        win = "Common/Audio/win",
        lose = "Common/Audio/lose",
        BGM = "myGame/Audio/BGM1",

    }

    /**UI类型，枚举值与对应UI预制件、脚本名称相同 */
    export enum UI {
        lobby = "GameLobby",                //首页
        playerAssetBar = "PlayerAssetBar",  //玩家资产信息条
        getPower = "GetPowerUI",            //获取体力界面
        tipPower = "TipPowerUI",            //体力不足提示界面
        shop = "ShopUI",                    //商城界面
        levelInfo = "LevelInfoUI",          //关卡信息
        levelTeach = "TeachAnim",           //关卡教学界面
        winUI = "WinUI",                    //胜利界面
        loseUI = "LoseUI",                  //失败界面
    }

    /**场景类型 */
    export enum Scene {
        any = 1,    //任意场景
        lobby,      //首页
        level,      //关卡中
    }

    /**关卡状态 */
    export enum LevelState {
        inited = 1,     //关卡已初始化完成，但还未开始游戏
        showingPlace,   //车位展示过程
        playing,        //关卡进行中
        win,            //玩家已胜利
        lose,           //玩家已失败
    }

    /**触摸控制器状态 */
    export enum CtrlState {
        none = 1,
        touched,    //按住状态
    }

    /**游戏数据类型 */
    export enum GameDataType {
        /**关卡数据 */
        levelData = "LevelData",

    }

    /**资源路径，可为本地路径或远程路径 */
    export enum UrlPath {
        //皮肤资源：
        /**皮肤资源根路径 */
        skinRootUrl = "myGame/Img/Skin/",
        /**皮肤贴图文件夹名 */
        skinTextureDir = "Textures",
        /**皮肤在商城的商品项显示图片的文件夹名 */
        skinItemDir = "Item",
        /**皮肤商品选中时在展示台显示的图片的文件夹名 */
        skinDisplayDir = "Display",
    }

    /**商店中商品项的类型 */
    export enum GoodsType {
        /**主角皮肤 */
        playerSkin = "PlayerSkin",
    }

    //通过全局对象池管理的预制件名称与对应的脚本名称
    export enum LevelPrefab {
        goldIcon = "GoldIcon",
    }

}
