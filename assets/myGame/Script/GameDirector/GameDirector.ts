import yyComponent from "../Common/yyComponent";
import LevelManager from "../Level/LevelManager";
import { EventType } from "../GameSpecial/GameEventType";
import AudioManager from "../Common/AudioManager";
import GameConfig from "../GameSpecial/GameConfig";
import PlayerData from "../Common/PlayerData";
import PowerManager from "../Common/PowerManager";
import GlobalPool from "../Common/GlobalPool";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import Loader from "../Common/Loader";
import GameData from "../Common/GameData";
import UIManager from "../Common/UIManager";
import LevelController from "../Level/LevelController";

//游戏流程管理器
const { ccclass, property } = cc._decorator;

/**
 * 游戏流程总管理器
 * 
 * 游戏流程：
 * 
 * 登录:
 * 登录账号
 * 获取玩家数据
 * 
 * 进入首页：
 * 加载首页资源
 * 显示首页UI
 * 
 * 开始游戏：
 * 加载关卡数据
 * 加载关卡资源
 * 进入关卡
 * 隐藏首页UI
 * 
 * 关卡结束：
 * 加载结算UI资源
 * 显示结算UI
 * 
 * 继续下一关：
 * 退出当前关卡
 * 回收当前关卡资源
 * 加载关卡数据
 * 加载关卡资源
 * 进入关卡
 * 
 * 重玩当前关：
 * 重置关卡状态
 * 进入关卡
 * 
 * 返回首页：
 * 退出关卡
 * 回收关卡资源
 * 显示首页UI
 */
@ccclass
export default class GameDirector extends yyComponent {
    @property(cc.Node)
    protected uiLayer: cc.Node = null;
    @property(cc.Node)
    protected bg: cc.Node = null;
    /**出没遮罩层，阻挡玩家触摸操作 */
    @property(cc.Node)
    protected touchMask: cc.Node = null;
    /**记录需要显示遮罩的次数，次数为0时隐藏遮罩层 */
    protected touchMaskCount: number;

    //UI:
    //只能在首页中时才显示的UI
    protected lobbyUIs: GlobalEnum.UI[] = [];
    //只能在关卡中时才显示的UI
    protected levelUIs: GlobalEnum.UI[] = [];
    //可在任意情况下显示的UI
    protected persistUIs: GlobalEnum.UI[] = [];
    //关卡数据
    protected levelMng: LevelManager = null;
    protected levelData: any = null;

    //脚本自身需要使用的数据：
    protected levelCount: number = 0;//记录玩家玩的关卡次数，用于判定结算界面是显示banner还是插屏广告

    start() {
        this.init();
        this.loadGameData();
    }

    public init() {
        this.levelCount = 0;

        this.initUIConfig();
        this.initTouchMask();
        this.initModels();

        this.onEvents();
    }
    protected onEvents() {
        this.on(EventType.DirectorEvent.startGame, this.onStartGame, this);
        this.on(EventType.DirectorEvent.enterLobby, this.enterGameLobby, this);
        this.on(EventType.DirectorEvent.playNextLevel, this.onPlayNextLevel, this);
        this.on(EventType.DirectorEvent.replayCurLevel, this.onReplayCurLevel, this);
        this.on(EventType.DirectorEvent.playerWin, this.onLevelWin, this);
        this.on(EventType.DirectorEvent.playerLose, this.onLevelLose, this);
        this.on(EventType.DirectorEvent.hideGameLobby, this.hideGameLobbyUI, this);

        this.on(EventType.UIEvent.showTouchMask, this.showTouchMask, this);
        this.on(EventType.UIEvent.hideTouchMask, this.hideTouchMask, this);
    }
    protected initUIConfig() {
        this.lobbyUIs = [];
        this.lobbyUIs.push(GlobalEnum.UI.lobby);
        this.lobbyUIs.push(GlobalEnum.UI.shop);

        this.levelUIs = [];
        this.levelUIs.push(GlobalEnum.UI.levelInfo);
        this.levelUIs.push(GlobalEnum.UI.levelTeach);
        this.levelUIs.push(GlobalEnum.UI.winUI);
        this.levelUIs.push(GlobalEnum.UI.loseUI);

        this.persistUIs = [];
        this.persistUIs.push(GlobalEnum.UI.playerAssetBar);
        this.persistUIs.push(GlobalEnum.UI.tipPower);
        this.persistUIs.push(GlobalEnum.UI.getPower);
    }
    protected initModels() {
        //UI
        UIManager.init(this.node.getChildByName("UI"));

        //todo:测试：重置玩家数据，需要再次重置时，将needResetPlayerData字符串最后一位数字加1
        let resetPlayerData = cc.sys.localStorage.getItem(GameConfig.gameName + "needResetPlayerData1");
        if (!resetPlayerData) {
            cc.sys.localStorage.setItem(GameConfig.gameName + "needResetPlayerData1", JSON.stringify(true));
        }
        PlayerData.init();

        AudioManager.init();
        GameData.init();
        Loader.init();
        PowerManager.init();
    }
    protected initTouchMask() {
        this.touchMask.active = false;
        this.touchMaskCount = 0;
    }
    /**加载全部游戏数据（json文件） */
    protected loadGameData() {

        Loader.loadResDir("myGame/GameData", (res) => {
            let urls = [];
            for (let i = 0, c = res.length; i < c; ++i) {
                urls.push(res[i].name);
            }
            this.onLoadGameDataFinish(res, urls);
        }, cc.JsonAsset);
    }
    /**游戏数据加载完毕，分别保存 */
    protected onLoadGameDataFinish(res: any[], urls: string[]) {
        GameData.setData(res, urls);

        this.enterGameLobby();
    }
    protected getUrlsIndex(name: string, urls: string[]): number {
        for (let i = urls.length - 1; i >= 0; --i) {
            if (urls[i].indexOf(name) >= 0) {
                return i;
            }
        }
        return -1;
    }

    /**显示一层遮罩，阻挡玩家操作 */
    protected showTouchMask(count: number = 1) {
        this.touchMaskCount += count;
        this.touchMask.active = true;
    }
    /**移除一层遮罩，遮罩层数为0时玩家才能进行操作 */
    protected hideTouchMask(count: number = 1) {
        this.touchMaskCount -= count;
        if (this.touchMaskCount <= 0) {
            this.touchMaskCount = 0;
            this.touchMask.active = false;
        }
    }

    /**暂停关卡 */
    protected pauseLevel() {
        this.emit(EventType.DirectorEvent.pauseLevel);
    }
    /**恢复关卡 */
    protected resumeLevel() {
        this.emit(EventType.DirectorEvent.resumeLevel);
    }

    public reset() {
        this.exitLevel();
        this.resetTouchMask();
    }
    protected resetTouchMask() {
        this.touchMask.active = false;
        this.touchMaskCount = 0;
    }

    protected showUI(ui: GlobalEnum.UI, data?: any) {
        this.emit(EventType.UIEvent.enter, ui, data);
    }
    protected showUIs(uis: GlobalEnum.UI[]) {
        for (let i = uis.length - 1; i >= 0; --i) {
            this.emit(EventType.UIEvent.enter, uis[i]);
        }
    }
    protected hideUI(ui: GlobalEnum.UI) {
        this.emit(EventType.UIEvent.exit, ui);
    }
    protected hideUIs(uis: GlobalEnum.UI[]) {
        for (let i = uis.length - 1; i >= 0; --i) {
            this.emit(EventType.UIEvent.exit, uis[i]);
        }
    }

    //进入首页
    protected enterGameLobby() {
        if (!!this.levelMng) {
            this.levelMng.exit();
        }
        this.showGameLobbyUI();
    }
    //显示首页UI
    protected showGameLobbyUI() {
        this.hideUIs(this.levelUIs);
        this.hideUIs(this.persistUIs);
        this.showUI(GlobalEnum.UI.lobby);
        this.showUI(GlobalEnum.UI.playerAssetBar);
    }
    //隐藏首页UI 
    protected hideGameLobbyUI() {
        this.bg.active = false;
        this.hideUIs(this.lobbyUIs);
        this.hideUIs(this.persistUIs);
        this.hideUI(GlobalEnum.UI.lobby);
    }

    //开始游戏：
    protected onStartGame() {
        if (!this.levelMng) {
            // Loader.loadSubpackage("Level", this.loadLevelCommonAsset.bind(this), true);
            this.loadLevelCommonAsset();
        } else {
            this.enterLevel();
        }
    }
    //加载关卡场景所需的通用资源并创建对象池
    protected loadLevelCommonAsset() {
        Loader.loadResDir("myGame/Prefab/LevelAsset", (assets) => {
            for (let i = assets.length - 1; i >= 0; --i) {
                let prefab: cc.Prefab = assets[i];
                GlobalPool.createPool(prefab.name, prefab, prefab.name);
            }
            this.loadLevelManager();
        });
    }
    //加载关卡场景管理器
    protected loadLevelManager() {
        Loader.loadRes("myGame/Prefab/LevelManager", (res) => {
            let node: cc.Node = cc.instantiate(res);
            this.node.getChildByName("LevelManager").addChild(node);
            this.levelMng = node.getComponent("LevelManager");
            this.levelMng.init();
            // this.enterLevel();
            this.loadLevelController();
        })
    }
    protected loadLevelController() {
        Loader.loadRes("myGame/Prefab/UI/LevelController", (res) => {
            let node = cc.instantiate(res);
            this.uiLayer.getChildByName("LevelController").addChild(node);
            let js: LevelController = node.getComponent(LevelController);
            js.init();
            js.setDisable();
            this.enterLevel();
        });
    }
    //进入关卡
    protected enterLevel(level?: number) {
        if (!level) {
            level = this.getCurLevel();
        }
        //todo:测试
        level = 1;
        //进入关卡:
        this.hideGameLobbyUI();
        this.hideUIs(this.levelUIs);
        let levelData = this.getLevelData(level);
        this.levelMng.enterLevel(levelData);
        this.showUI(GlobalEnum.UI.levelInfo, levelData);
        this.showTeachAnim();
    }

    //获取玩家当前能进入的关卡
    protected getCurLevel(): number {
        return PlayerData.getData("gameData.curLevel");
    }
    //获取关卡数据
    protected getLevelData(level: number) {
        level = 1;//todo
        // let data = GameData.getLevelData(level);
        let data = {
            id: 1,
        }
        return data;
    }
    //显示教学动画
    protected showTeachAnim() {
        let teached = cc.sys.localStorage.getItem(GameConfig.gameName + "teached");
        if (!!teached && !!JSON.parse(teached)) return;
        this.showUI(GlobalEnum.UI.levelTeach);
    }

    //关卡胜利
    protected onLevelWin() {
        this.addCurLevel();
        this.showUI(GlobalEnum.UI.winUI);
    }
    //关卡进度+1
    protected addCurLevel() {
        this.emit(EventType.PlayerDataEvent.updatePlayerData, {
            type: "gameData",
            attribute: "gameData.curLevel",
            value: 1,
            mode: "+",
        });
    }

    //关卡失败
    protected onLevelLose() {
        this.showUI(GlobalEnum.UI.loseUI);
    }

    //继续下一关
    protected onPlayNextLevel() {
        this.exitCurLevel();
        this.putBackCurLevelAsset();
        this.enterLevel();
    }
    //退出当前关卡
    protected exitCurLevel() {
        this.levelMng.exit();
    }
    //回收当前关卡使用的资源
    protected putBackCurLevelAsset() {

    }

    //重玩当前关卡
    protected onReplayCurLevel() {
        this.resetCurLevel();
        this.putBackCurLevelAsset();
        this.enterLevel();
    }
    //重置当前关卡状态
    protected resetCurLevel() {
        this.levelMng.reset();
    }

    //返回首页
    protected onComeBackGameLobby() {
        this.exitLevel();
        this.putBackLevelAsset();
        this.showGameLobbyUI();
    }
    //彻底退出关卡场景
    protected exitLevel() {
        if (!!this.levelMng) this.levelMng.exit();
    }
    //回收关卡场景的全部资源
    protected putBackLevelAsset() {

    }
}
