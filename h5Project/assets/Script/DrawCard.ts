
const { ccclass, property } = cc._decorator;

/**
 * 卡牌状态
 */
enum CardState {
    NORMAL = 0,
    DRAWCARD,
    COMBAT,
    FINISH,
}
cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    firstNode: cc.Node = null;
    @property(cc.Node)
    drawCardBtn: cc.Node = null;
    @property(cc.Node)
    downLoadBtn: cc.Node = null;
    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;
    @property(cc.VideoPlayer)
    drawCardVideo: cc.VideoPlayer = null;
    @property(cc.Node)
    victoryNode: cc.Node = null;
    @property(cc.Node)
    copy: cc.Node = null;
    @property(cc.Node)
    victoryDownLoad: cc.Node = null;

    cardNode: cc.Node = null;
    roleNodeList: cc.Node[] = [];
    experience: cc.Node = null;
    selectRole: cc.Node = null;
    isWukong: boolean = true;
    cardState: number = CardState.NORMAL;

    onLoad() {
    }

    start() {
        this.drawCardBtn.on(cc.Node.EventType.TOUCH_START, this.drawCardClick, this);
        this.downLoadBtn.on(cc.Node.EventType.TOUCH_START, this.downLoadClick, this);
        this.victoryDownLoad.on(cc.Node.EventType.TOUCH_START, this.downLoadClick, this);
        this.copy.on(cc.Node.EventType.TOUCH_START, this.copyClick, this);
    }

    /**
     * 点击抽卡
     */
    drawCardClick() {
        this.drawCardVideo.node.active = true;
        this.drawCardVideo.play();
        this.cardState = CardState.DRAWCARD;
    }

    /**
     * 点击下载
     */
    downLoadClick() {
        console.log("下载");
    }

    /**
     * 显示抽卡结果
     * @param {*} videoplayer 播放器
     * @param {*} eventType 事件类型
     * @param {*} customEventData 自定义参数
     */
    showDrawCard(videoplayer, eventType: cc.VideoPlayer.EventType, customEventData) {
        //播放完成
        if (eventType == 3) {
            if (this.cardState == CardState.DRAWCARD) {
                this.firstNode.active = false;
                this.drawCardVideo.node.active = false;
                this.cardNode = cc.instantiate(this.cardPrefab);
                this.node.addChild(this.cardNode);
                this.isWukong = Math.random() > 0.5;
                this.showCardNode();
            } else if (this.cardState == CardState.COMBAT) {
                this.cardNode.active = false;
                this.showVictory();
            } else if (this.cardState == CardState.FINISH) {
                this.playVictory();
            }
        }
    }

    /**
     * 显示抽卡节点
     */
    showCardNode() {
        for (let i = 0; i < 2; i++) {
            this.roleNodeList[i] = this.cardNode.getChildByName(`role${i}`);
        }
        this.experience = this.cardNode.getChildByName("experience");
        this.selectRole = this.cardNode.getChildByName("selectRole");
        this.experience.on(cc.Node.EventType.TOUCH_START, this.downLoadClick, this);
        this.selectRole.on(cc.Node.EventType.TOUCH_START, this.selectRoleClick, this);

        this.roleNodeList[0].active = this.isWukong;
        this.roleNodeList[1].active = !this.isWukong;
    }

    /**
     * 选择角色
     */
    selectRoleClick() {
        console.log(this.isWukong);
        this.drawCardVideo.node.active = true;
        cc.loader.loadRes(`Video/combat${this.isWukong ? 1 : 2}.mp4`, cc.Asset, (err, clip) => {
            this.drawCardVideo.clip = clip;
            this.drawCardVideo.play();
            this.cardState = CardState.COMBAT;
        });
    }

    /**
     * 胜利
     */
    showVictory() {
        cc.loader.loadRes(`Video/victory${this.isWukong ? 1 : 2}.mp4`, cc.Asset, (err, clip) => {
            this.drawCardVideo.clip = clip;
            this.playVictory();
            this.cardState = CardState.FINISH;
            this.drawCardVideo.stayOnBottom = true;
            this.victoryNode.active = true;
        });
    }

    /**
     * 播放胜利动画
     */
    playVictory() {
        this.drawCardVideo.play();
    }

    /**
     * 复制
     */
    copyClick() {
        if (cc.sys.isBrowser) {
            let str = "aoligei";
            let temp = document.createElement('textarea');
            temp.value = str;
            document.body.appendChild(temp);
            temp.select(); // 选择对象
            document.execCommand("Copy"); // 执行浏览器复制命令
            temp.style.display = 'none';
            console.log('复制成功');
        }
    }
}
