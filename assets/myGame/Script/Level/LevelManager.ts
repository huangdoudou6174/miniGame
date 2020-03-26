import yyComponent from "../Common/yyComponent";
import { GlobalEnum } from "../GameSpecial/GlobalEnum";
import { EventType } from "../GameSpecial/GameEventType";

const { ccclass, property } = cc._decorator;
//关卡管理器
@ccclass
export default class LevelManager extends yyComponent {

    protected levelData: any;             //当前关卡的关卡数据

    protected elapseTimer: number;        //关卡经历的时间，单位 毫秒
    protected lastFrameTime: number;      //上一帧更新时的时间戳
    protected isPaused: boolean;          //关卡是否暂停状态
    protected initLevelTimer() {
        this.elapseTimer = 0;
        this.isPaused = false;
    }
    protected resetLevelTimer() {
        this.elapseTimer = 0;
        this.isPaused = false;
    }

    /**关卡中动态添加的模型节点存放层 */
    @property(cc.Node)
    protected levelLayer: cc.Node = null;

    public init() {
        this.initComponents();
        this.initCustomUpdateState();
        this.initLevelTimer();

        this.registAllCustomUpdate();
        this.onEvents();
    }
    public reset() {
        //回收关卡中的对象

        this.resetCustomUpdateState();
        this.resetLevelTimer();
    }

    /**暂停关卡运行 */
    public pause() {
        this.isPaused = true;
    }
    /**继续关卡运行 */
    public resume() {
        this.isPaused = false;
    }

    //进入关卡，设置关卡数据，启动关卡控制器，开始游戏
    public enterLevel(levelData) {
        this.node.active = true;
        this.levelData = levelData;
        this.setData();
        this.startLevel();
    }
    //关卡数据设置完毕，开始运行关卡进行游戏
    protected startLevel() {
        this.enterCustomUpdateState(GlobalEnum.LevelState.playing);
        this.lastFrameTime = Date.now();
        // this.schedule(this.customUpdate, 0.016);
        this.emit(EventType.CtrlEvent.ctrlStart);
        this.emit(EventType.AudioEvent.playBGM, GlobalEnum.AudioClip.BGM, true);
        this.emit(EventType.SDKEvent.startRecord);
        this.emit(EventType.ALDEvent.levelStart, this.levelData.lv);
    }

    //退出关卡
    public exit() {
        this.reset();
        this.node.active = false;
        // this.unschedule(this.customUpdate);
    }

    //自定义的每帧更新函数，由计时器执行
    public customUpdate() {
        if (this.isPaused) return;
        let d = Date.now();
        let dt = d - this.lastFrameTime;
        this.lastFrameTime = d;

        if (dt > 34) dt = 34;//避免苹果手机打开下拉菜单再回来，dt值过大
        dt *= 0.001;//单位转换为秒
        this.elapseTimer += dt;
        if (!!this.customStep) {
            this.customStep(dt);
        }
    }

    //关卡进行中
    protected stepLevelPlaying(dt: number) {
        // console.log("关卡管理器子类未实现方法stepLevelPlaying");
    }
    //关卡胜利
    protected stepLevelWin(dt: number) {
        // console.log("关卡管理器子类未实现方法stepLevelWin");
    }
    //关卡失败
    protected stepLevelLose(dt: number) {
        // console.log("关卡管理器子类未实现方法stepLevelLose");
    }

    /**玩家胜利 */
    protected win() {
        this.enterCustomUpdateState(GlobalEnum.LevelState.win);
        this.emit(EventType.CtrlEvent.ctrlEnd);
        this.emit(EventType.DirectorEvent.playerWin);
        this.emit(EventType.AudioEvent.playBGM, GlobalEnum.AudioClip.win, false);
        this.emit(EventType.SDKEvent.stopRecord);
        this.emit(EventType.ALDEvent.levelWin, this.levelData.lv);
    }
    /**玩家失败 */
    protected lose() {
        this.enterCustomUpdateState(GlobalEnum.LevelState.lose);
        this.emit(EventType.CtrlEvent.ctrlEnd);
        this.emit(EventType.DirectorEvent.playerLose);
        this.emit(EventType.AudioEvent.playBGM, GlobalEnum.AudioClip.lose, false);
        this.emit(EventType.SDKEvent.stopRecord);
        this.emit(EventType.ALDEvent.levelLose, this.levelData.lv);
    }


    update(dt: number) {
        // this.customUpdate(dt);
        if (!this.isPaused && !!this.customStep) {
            this.customStep(dt);
        }
    }


}
