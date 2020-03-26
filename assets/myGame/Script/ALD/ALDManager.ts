import yyComponent from "../Common/yyComponent";
import { EventType } from "../GameSpecial/GameEventType";

//微信小游戏阿拉丁数据统计管理器
const { ccclass, property } = cc._decorator;

@ccclass
export default class ALDManager extends yyComponent {
    private apiName: string = 'wx';
    private api: any;
    public init() {
        this.api = window[this.apiName];
        this.onEvents();
    }
    protected onEvents() {
        this.on(EventType.ALDEvent.levelStart, this.onStart, this);
        this.on(EventType.ALDEvent.levelWin, this.onLevelWin, this);
        this.on(EventType.ALDEvent.levelLose, this.onLevelLose, this);
    }

    /**
     * 关卡开始
     * @param lv    关卡编号
     */
    private onStart(lv: number) {
        let data = {
            stageId: lv.toString(),         //关卡id
            stageName: "第" + lv + "关",    //关卡名称
            userId: ""                      //玩家id
        };
        this.api.aldStage.onStart(data);
    }
    /**
     * 关卡中事件
     * @param data 
     * @param data.stageId      关卡id
     * @param data.stageName    关卡名称
     * @param data.userId       用户id
     * @param data.event        事件名称
     * @param data.params       事件参数
     * @param data.params.itemName  道具名称
     * @param data.params.itemCount 道具数量
     * @param data.params.desc      描述
     * @param data.params.itemMoney 道具价格 
     */
    private onRunning(data) {
        this.api.aldStage.onRunning(data);
    }
    /**
     * 关卡完成
     * @param data 
     * @param data.stageId      关卡id
     * @param data.stageName    关卡名称
     * @param data.userId       用户id，可选
     * @param data.event        关卡完成  关卡进行中，用户触发的操作    该字段必传
     * @param data.params
     * @param data.params.desc  描述
     */
    private onEnd(data) {
        if (null == data) {
            data = {
                stageId: "1",
                stageName: "第一关",
                event: "complete",
                params: {
                    desc: "关卡完成"
                }
            }
        }
        this.api.aldStage.onEnd(data);
    }

    /**
     * 关卡胜利
     * @param lv 关卡编号
     */
    private onLevelWin(lv: number) {
        let data = this.convertData(lv);
        data.event = "complete";
        data.params = {
            desc: "关卡胜利",
        };
        this.api.aldStage.onEnd(data);
    }
    /**
     * 关卡失败
     * @param lv 关卡编号
     */
    private onLevelLose(lv: number) {
        let data = this.convertData(lv);
        data.event = "fail";
        data.params = {
            desc: "关卡失败",
        };
        this.api.aldStage.onEnd(data);
    }

    /**
     * 通过关卡编号生成阿拉丁统计需要的基础数据
     * @param lv 
     */
    private convertData(lv: number): any {
        return {
            stageId: lv.toString(),         //关卡id
            stageName: "第" + lv + "关",    //关卡名称
            userId: ""                      //玩家id
        };
    }
}
