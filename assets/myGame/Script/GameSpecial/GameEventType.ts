//游戏中全部使用自定义事件管理器注册的事件类型

//跟游戏玩法相关的关卡中的事件
export module EventType {
    //游戏流程相关的事件,从 1000 开始
    export enum DirectorEvent {
        startIndex = 1000,
        enterLobby,             //进入游戏大厅(首页)
        hideGameLobby,          //隐藏首页
        startGame,              //开始游戏（点击首页按钮“开始游戏”）
        startLevel,             //开始关卡
        exitLevel,              //退出关卡
        playNextLevel,          //继续下一关
        replayCurLevel,         //重玩当前关
        playerWin,              //关卡胜利
        playerLose,             //关卡失败
        pauseLevel,             //暂停游戏
        resumeLevel,            //恢复游戏
        matchPlayerFinish,      //玩家匹配完成
    }
    //资源加载相关事件，从 2000 开始
    export enum LoadAssetEvent {
        startIndex = 2000,
        showProgress,           //显示资源加载进度
        hideProgress,           //隐藏资源加载进度
        updateProgress,         //更新资源加载进度
    }
    //游戏数据相关事件，从 3000 开始
    export enum PlayerDataEvent {
        startIndex = 3000,
        updatePlayerData,       //修改玩家数据
        playerDataChanged,      //玩家数据有变动

    }

    //SDK相关事件
    export enum SDKEvent {
        startIndex = 4000,
        showMsg,
        showVideo,          //激励视频
        showBanner,
        hideBanner,
        showInsertAd,       //插屏广告
        startRecord,        //头条：开始录屏
        stopRecord,         //头条：结束录屏
        shareRecord,        //头条：分享录屏
        bannerResize,       //底部广告栏尺寸更新，传递参数：广告栏顶部与屏幕底部的距离
        navigateToMiniProgram,//跳转到其他小游戏
        vibrateShort,       //短震动
        vibrateLong,        //长震动
    }

    //UI相关事件
    export enum UIEvent {
        startIndex = 5000,
        playGoldAmin,           //得到金币动画
        goldAnimPlayFinish,     //金币动画播放完毕
        showTip,                //显示提示信息
        showTouchMask,          //显示触摸遮罩，屏蔽玩家触摸操作
        hideTouchMask,          //隐藏触摸遮罩

        enter,                  //请求进入UI，传递参数UI类型
        entered,                //已进入UI
        exit,                   //请求退出UI
        exited,                 //已退出UI
    }

    //音效事件
    export enum AudioEvent {
        startIndex = 6000,
        playBGM,
        playEffect,
        playClickBtn,
        stopBGM,
    }

    //阿拉丁数据统计事件
    export enum ALDEvent {
        startIndex = 7000,
        levelStart,         //关卡开始
        levelWin,           //关卡成功
        levelLose,          //关卡失败
    }

    //玩家资产事件
    export enum AssetEvent {
        startIndex = 9000,
        powerChanged,       //体力值变化
        powerUnEnough,      //体力不足提示
        consumePower,       //请求消耗体力执行某事
        getPower,           //得到体力奖励
    }

    /**触摸控制器事件，适用于只有一个节点接收触摸操作的场景，从11000开始 */
    export enum CtrlEvent {
        startIndex = 11000,
        ctrlStart,       //关卡开始，开始关卡操作
        ctrlEnd,         //关卡结束，停止关卡操作

        touchStart,         //按下
        touchMove,          //移动
        touchEnd,           //松开
        touchStay,          //持续按住
    }

    /**商城相关时间，从12000开始 */
    export enum ShopEvent {
        startIndex = 12000,

        chooseItem,         //选中了商品项

    }

    //关卡事件，与游戏玩法相关，从 100000 开始
    export enum LevelEvent {
        startIndex = 100000,

    }

}