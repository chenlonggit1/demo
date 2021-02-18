
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private holeNode:cc.Node[] = [];
    private diglettNode:sp.Skeleton[] = [];
    private hammer:sp.Skeleton = null;
    private particle:cc.Node = null;
    private scoreLb:cc.Label = null;
    private allScoreLb:cc.Label = null;
    private randomNum:number = 0;
    private isClick:boolean = false;
    private score:number = 0;
    private allScore:number = 0;
    private myTimeout:number = null;
    private title:cc.Animation = null;
    @property (cc.AudioClip)
    private bgm:cc.AudioClip = null;

    onLoad () {
        let hole = this.node.getChildByName("holeNode");
        let diglett = this.node.getChildByName("diglettNode");
        for(let i = 0; i < 5; i++) {
            this.holeNode[i] = hole.getChildByName(`hole${i}`);
            this.diglettNode[i] = diglett.getChildByName(`diglett${i}`).getComponent(sp.Skeleton);
            this.holeNode[i].getChildByName(`holeBtn${i}`).on("click", this.holeClick.bind(this));
        }
        this.hammer = diglett.getChildByName("hammer").getComponent(sp.Skeleton);
        this.particle = this.node.getChildByName("particle");
        this.scoreLb = this.node.getChildByName("score").getComponent(cc.Label);
        this.allScoreLb = this.node.getChildByName("allScore").getComponent(cc.Label);
        this.title = this.node.getChildByName("title").getComponent(cc.Animation);
        cc.audioEngine.play(this.bgm,true,1);
    }

    start () {
        this.title.on(cc.Animation.EventType.FINISHED,()=>{
            this.initdiglettNode();   
        });
    }

    // 获取随机数
    getRandomNum() {
        let value = 0;
        do{
            value = Math.floor(Math.random()*5);
        }while(value == this.randomNum)
        this.randomNum = value;
        this.score = Math.ceil(Math.random()*10);
    }

    //初始化地鼠
    private initdiglettNode() {
        this.getRandomNum();
        this.playAudio("appear",false);
        this.isClick = true;
        this.holeNode[this.randomNum].getChildByName(`holeBtn${this.randomNum}`).height = 440;
        this.diglettNode[this.randomNum].node.active = true;
        this.diglettNode[this.randomNum].setAnimation(0,"zuanchu",false);
        this.diglettNode[this.randomNum].setCompleteListener(()=>{
            if(this.isClick){
                this.diglettNode[this.randomNum].setAnimation(0,"daiji1",true);
                let pos = cc.v2(this.holeNode[this.randomNum].x,this.holeNode[this.randomNum].y-150);
                this.scoreLb.node.setPosition(pos);
                this.scoreLb.node.active = true;
                this.scoreLb.string = this.score.toString();
            }
        })
        
        //一段时间没打自动钻入
        if(this.myTimeout) clearTimeout(this.myTimeout);
        this.myTimeout = setTimeout(()=>{
            if(!this.isClick) return;
            this.isClick = false;
            this.playDrillingAnim(false);
        },5000);
    }

    //击打
    private holeClick(evt) {
        if(!this.isClick) return;
        this.isClick = false;
        let index = parseInt(evt.node.name.replace("holeBtn", ""));
        this.hammer.node.active = true;
        let pos = cc.v2(this.diglettNode[index].node.x-170,this.diglettNode[index].node.y+130);
        this.hammer.node.setPosition(pos);
        this.hammer.setAnimation(0,"chuizi",false);
        this.hammer.setCompleteListener(()=>{
            this.hammer.node.active = false;
        })
        setTimeout(()=>{
            if(index == this.randomNum) {
                this.allScore += this.score;
                this.allScoreLb.string = "分数：" + this.allScore.toString();
                this.playAudio("stun",false);
                this.diglettNode[this.randomNum].setAnimation(0,"xuanyun",true);
                this.playDrillingAnim(true);
            }else{
                this.isClick = true;
            }
        },300);
        
    }

    //播放钻入动画
    private playDrillingAnim(isDelay:boolean) {
        this.holeNode[this.randomNum].getChildByName(`holeBtn${this.randomNum}`).height = 223;
        let time = isDelay ? 1000 : 0;
        this.scoreLb.node.active = false;
        setTimeout(()=>{
            this.playAudio("vanish",false);
            this.diglettNode[this.randomNum].setAnimation(0,"suohui",false);
            this.diglettNode[this.randomNum].setCompleteListener(()=>{
                this.initdiglettNode(); 
            })
        },time);
        setTimeout(()=>{
            this.particle.active = true;
            this.particle.getComponent(cc.ParticleSystem).resetSystem();
            let pos = cc.v2(this.holeNode[this.randomNum].x,this.holeNode[this.randomNum].y-30);
            this.particle.setPosition(pos);
            cc.tween(this.particle).by(0.2,{y:-100}).start();
        },time+50);
    }

    //播放音频
    private playAudio(name:string, loop:boolean, volume: number = 1) {
        cc.resources.load(`audio/${name}`, cc.AudioClip, function (err, clip:cc.AudioClip) {
            if(err) return;
            cc.audioEngine.play(clip,loop,volume);
        });
    }

}
