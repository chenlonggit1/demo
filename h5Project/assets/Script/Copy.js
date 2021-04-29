
cc.Class({
    extends: cc.Component,

    properties: {
        copyBtn: cc.Node,
        copyNode: cc.Node,
    },

    onload() {
        this.aniTween = null;
    },

    start() {
        this.copyBtn.on("click", this.copy, this);
    },

    copy() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            let result = this.copyIos("aoligei");
            if (result) this.playAnim();
        } else {
            let result = this.copyAndroid("aoligei");
            if (result) this.playAnim();
        }
    },

    copyAndroid(val) {
        let input = val + '';
        const el = document.createElement('textarea');
        el.value = input;
        el.setAttribute('readonly', '');
        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS
        const selection = getSelection();
        let originalRange = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) { }

        document.body.removeChild(el);

        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }
        console.log("android", success);
        return success;
    },

    copyIos(val) {
        const textString = val + '';
        let input = document.querySelector('#copy-input');
        if (!input) {
            input = document.createElement('input');
            input.id = "copy-input";
            input.readOnly = true; // 防止ios聚焦触发键盘事件 
            input.style.position = "absolute";
            input.style.left = "-1000px";
            input.style.zIndex = "-1000";
            document.body.appendChild(input)
        }
        input.value = textString; // ios必须先选中文字且不支持 
        input.select();
        selectText(input, 0, textString.length);
        let success = document.execCommand('copy');
        console.log(document.execCommand('copy'), 'execCommand', textString);
        if (document.execCommand('copy')) {
            document.execCommand('copy');
        }
        input.blur(); // input自带的select()方法在苹果端无法进行选择，所以需要自己去写一个类似的方法 
        // 选择文本。createTextRange(setSelectionRange)是input方法 
        function selectText(textbox, startIndex, stopIndex) {
            if (textbox.createTextRange) {//ie 
                const range = textbox.createTextRange();
                range.collapse(true);
                range.moveStart('character', startIndex);//起始光标 
                range.moveEnd('character', stopIndex - startIndex);//结束光标 
                range.select();//不兼容苹果 
            } else {//firefox/chrome 
                textbox.setSelectionRange(startIndex, stopIndex);
                textbox.focus();
            }
        }
        return success;
    },

    playAnim() {
        this.copyNode.active = true;
        this.copyNode.opacity = 255;
        this.copyNode.position = cc.v3(0, 0, 0);
        if (this.aniTween)
            this.aniTween.stop();
        this.aniTween = cc.tween(this.copyNode)
            .by(1, { position: cc.v3(0, 100, 0) })
            .to(1, { opacity: 0 })
            .call(() => this.copyNode.active = false)
            .start();
    }
});
