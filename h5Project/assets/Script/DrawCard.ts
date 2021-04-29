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
    topBtn: cc.Node = null;
    @property(cc.Node)
    drawCardBtn: cc.Node = null;
    @property(cc.Node)
    downLoadBtn: cc.Node = null;
    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;
    @property(cc.VideoPlayer)
    drawCardVideo: cc.VideoPlayer = null;
    @property([cc.VideoPlayer])
    combatVideo: cc.VideoPlayer[] = [];
    @property([cc.VideoPlayer])
    victoryVideo: cc.VideoPlayer[] = [];
    @property(cc.Node)
    victoryNode: cc.Node = null;
    @property(cc.Node)
    copy: cc.Node = null;
    @property(cc.Node)
    victoryDownLoad: cc.Node = null;
    @property(cc.Node)
    copyNode: cc.Node = null;

    cardNode: cc.Node = null;
    roleNodeList: cc.Node[] = [];
    experience: cc.Node = null;
    selectRole: cc.Node = null;
    isWukong: number = 0;
    cardState: number = CardState.NORMAL;

    onLoad() {
        this.playAudio("bgm", true);
    }

    start() {
        this.topBtn.on("click", this.topClick, this);
        this.drawCardBtn.on("click", this.drawCardClick, this);
        this.downLoadBtn.on("click", this.downLoadClick, this);
        this.victoryDownLoad.on("click", this.downLoadClick, this);
        this.copy.on("click", this.copyClick, this);

        this.copy.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.copy.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
        this.copy.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);

        cc.tween(this.drawCardBtn)
            .repeatForever(cc.tween()
                .to(0.25, { scale: 1.1 })
                .to(0.25, { scale: 1 }))
            .start();
    }

    touchStart(touch) {
        cc.tween(touch.target)
            .to(0.1, { scale: 1.2 })
            .start();
    }

    touchEnd(touch) {
        cc.tween(touch.target)
            .to(0.1, { scale: 1 })
            .start();
    }

    /**
     * 浏览器的安全设定，必须有主动的触摸事件，才能进行视频播放
     */
    topClick() {
        this.topBtn.active = false;
    }

    /**
     * 点击抽卡
     */
    drawCardClick() {
        console.log("click drawCard");
        this.firstNode.active = false;
        this.playAudio("click", false);
        this.drawCardVideo.play();
        this.cardState = CardState.DRAWCARD;
    }

    /**
     * 点击下载
     */
    downLoadClick() {
        console.log("click downLoad");
        this.playAudio("click", false);
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
                this.cardNode = cc.instantiate(this.cardPrefab);
                this.node.addChild(this.cardNode);
                this.isWukong = Math.random() > 0.5 ? 0 : 1;
                this.showCardNode();
            } else if (this.cardState == CardState.COMBAT) {
                this.showVictory();
            } else if (this.cardState == CardState.FINISH) {
                this.playVictory();
            }
        }

        if (this.cardState == CardState.FINISH && eventType == 0) {
            this.victoryNode.active = true;
            this.combatVideo[this.isWukong].node.active = false;
            cc.tween(this.victoryDownLoad)
                .repeatForever(cc.tween()
                    .to(0.25, { scale: 1.1 })
                    .to(0.25, { scale: 1 }))
                .start();
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
        this.experience.on("click", this.downLoadClick, this);
        this.selectRole.on("click", this.selectRoleClick, this);

        this.roleNodeList[0].active = this.isWukong == 0;
        this.roleNodeList[1].active = this.isWukong != 0;

        cc.tween(this.experience)
            .repeatForever(cc.tween()
                .to(0.25, { scale: 1.1 })
                .to(0.25, { scale: 1 }))
            .start();

        let index = this.isWukong == 0 ? 0 : 1;
        this.roleNodeList[index].scale = 0.5;
        this.roleNodeList[index].y = 500;
        cc.tween(this.roleNodeList[index])
            .to(0.3, { scale: 1, position: cc.v3(0, -48, 0) })
            .start();

    }

    /**
     * 选择角色
     */
    selectRoleClick() {
        this.playAudio("click", false);

        this.cardNode.active = false;
        this.drawCardVideo.node.active = false;
        this.combatVideo[this.isWukong].node.active = true;
        this.combatVideo[this.isWukong].play();
        this.cardState = CardState.COMBAT;
    }

    /**
     * 胜利
     */
    showVictory() {
        this.victoryVideo[this.isWukong].node.active = true;
        this.victoryVideo[this.isWukong].play();
        this.cardState = CardState.FINISH;
    }

    /**
     * 播放胜利动画
     */
    playVictory() {
        this.victoryVideo[this.isWukong].play();
    }

    /**
     * 复制
     */
    copyClick() {
        this.playAudio("click", false);
    }

    /**
     * 播放声音
     * @param audioName 
     * @param isLoop 
     */
    playAudio(audioName, isLoop) {
        cc.loader.loadRes("Audio/" + audioName, cc.Asset, (error, res) => {
            cc.audioEngine.play(res, isLoop, 1);
        });
    }
}
