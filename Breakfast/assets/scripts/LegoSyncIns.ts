import {
    sendToNative,
    jsbOn,
    JSBMethodName,
    jsbOff,
    ErrorCode,
    jsbridgeH5ToPc,
    LegoSync,
    LegoSyncNode,
    NodeType,
    SyncRole,
} from "@byted-edu/lego-sync";
class LegoSyncIns {
    private static _instance: LegoSyncIns;
    private legoSync: LegoSync;
    private callback;
    private refreshCallback;
    private legoSyncNode = {
        nodeType: NodeType.COCOS,
        stateId: "ev-cocos-game",
        onRecover: (data: any) => {
             cc.log("onRecover------------------->",data);
            if (this.callback) {
                this.callback(data);
            }
        },
        onReceive: (data: any) => {
            cc.log("onReceive------------------->",data);
            if (this.callback) {
                this.callback(data);
            }
        },
        onPageChange: (data: any) => {
        // 处理收到的翻页数据
            cc.log("onPageChange------------------->",data);
            if (this.refreshCallback) {
                this.refreshCallback(data);
            }
        },
        onReceiveEvent: () => {
            cc.log("onReceiveEvent");
        },
    };
    public static get instance() {
        if (!this._instance) {
            this._instance = new LegoSyncIns();
            this._instance.legoSync = new LegoSync();
            this._instance.legoSync.addNode(this._instance.legoSyncNode);
            sendToNative(sendToNative.JSBName.pageLoad, { status: "success" });
        }
        return this._instance;
    }
    public sendStatus(data){
        this.legoSync.sendStatus(this.legoSyncNode, data);
    }
    public setReceiveCB(callback) {
        this.callback = callback;
    }
    public setRefreshCB(refreshCB) {
        this.refreshCallback = refreshCB;
    }
}
export default LegoSyncIns;