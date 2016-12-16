var State = {
    SWIMMING : 0,
    SWIMMING_TO_HURT : 1,
    HURT : 2,
    HURT_TO_SWIMMING : 3
};


var HelloWorldLayer = cc.Layer.extend({
    _title:"Testing Animate3D",
    _subtitle:"Touch to beat the tortoise",
    _sprites:[],
    _swims:[],
    _hurts:[],
    _turn_arounds:[],
    _moveActions:[],
    _states:[],
    _elapseTransTimes:[],
    _shareIcon: null,
    _deleteIcon: null,
    _spriteSizes: [],
    _collisionFlags: [],
    _originTarget: [],
    _z: 0,
    _spriteNum: 5,
    _dragStart: null,
    _isDrag: false,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        // /////////////////////////////
        // // 2. add a menu item with "X" image, which is clicked to quit the program
        // //    you may modify it.
        // // ask the window size
        // var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        // var helloLabel = new cc.LabelTTF("Hello World C", "Arial", 38);
        // // position the label on the center of the screen
        // helloLabel.x = size.width / 2;
        // helloLabel.y = size.height / 2 + 200;
        // // add the label as a child to this layer
        // this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        // this.sprite = new cc.Sprite(res.HelloWorld_png);
        // this.sprite.attr({
        //     x: size.width / 2,
        //     y: size.height / 2
        // });
        // this.addChild(this.sprite, 0);
        this.addSprite3D();
        this.addMenu();
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesEnded: this.onTouchesEnded.bind(this),
            onTouchesBegan: this.onTouchesBegan.bind(this),
            onTouchesMoved: this.onTouchesMoved.bind(this)
        }, this);

        this.scheduleUpdate();

        return true;
    },


    sendHttpEvent: function(event) {
        var xhr = cc.loader.getXMLHttpRequest();

        xhr.open( "GET", "http://localhost:4477/cocos?event=" + encodeURIComponent(event));
        xhr.setRequestHeader( "Content-Type", "text/plain" );
        xhr.send( );

        xhr.onreadystatechange = function ()
        {
            cc.log( "Networking away" );

            if ( xhr.readyState == 4 && ( xhr.status >= 200 && xhr.status <= 207 ) )
            {
                var httpStatus = xhr.statusText;
                cc.log( httpStatus );

                var response = xhr.responseText;
                cc.log( response );
            }
        }
    },

    addSprite3D:function(){
        // getPosition3D();
        // cc.Camera.getDefaultCamera().getPosition3D();
        cc.log('cam pos before', JSON.stringify(cc.Camera.getDefaultCamera().getPosition3D()));
        // cc.Camera.getDefaultCamera().setPosition3D(cc.math.vec3(0, 100, 0));
        var cam_pos = cc.Camera.getDefaultCamera().getPosition3D();
        cam_pos.z+=200;
        cc.Camera.getDefaultCamera().setPosition3D(cam_pos);
        cc.log('cam pos after', JSON.stringify(cc.Camera.getDefaultCamera().getPosition3D()));
        // cc.Camera.getDefaultCamera().lookAt(cc.math.vec3(0, 0, 0));

        // var cam_pos = cc.Camera.getDefaultCamera().getPosition3D();
        // cam_pos.z += 500;
        // cc.Camera.getDefaultCamera().setPosition3D(cam_pos);

        // var model = res.tortoise_c3b;
        var model = res.spider;

        for (var i = 0; i < this._spriteNum; i++) {
            this._elapseTransTimes.push(0);
            var sprite = new jsb.Sprite3D(model);
            sprite.setTexture("res/zhizhu_01.png");
            sprite.setRotation3D(cc.math.vec3(90, 26, 0));
            var scale = 30 * ((0.5 * (i%3) + 1));
            sprite.setScale(scale);
            var s = cc.winSize;
            sprite.setPosition(cc.p((i+1) * s.width / 6, (i + 1 ) * s.height / 6));
            // sprite.setPosition3D(cc.math.vec3(s.width * 4 / 5, s.height / 2, 0));
            cc.log('sprite pos', JSON.stringify(sprite.getPosition3D()));
            this.addChild(sprite);
            this._sprites.push(sprite);
            var aabb = sprite.getAABB();
            this._spriteSizes.push({    // 精灵的尺寸
                width: aabb.max.x - aabb.min.x,
                height: aabb.max.y - aabb.min.y,
            });

            var animation = new jsb.Animation3D(model);

            if(animation){
                // var animate = new jsb.Animate3D(animation, 0, 1.933);
                var animate = new jsb.Animate3D(animation, 0, 1);
                // var animate = new jsb.Animate3D(animation, 5.24, 1.8);
                this._swims.push(new cc.RepeatForever(animate));
                sprite.runAction(this._swims[i]);

                this._swims[i].retain();
                // this._hurt = new jsb.Animate3D(animation, 1.933, 2.8);
                // this._hurt = new jsb.Animate3D(animation, 13.1, 17.2);
                this._hurts.push(new jsb.Animate3D(animation, 5.24, 1.8));
                this._hurts[i].retain();

                this._turn_arounds.push(new jsb.Animate3D(animation, 2.84, 1.6));
                // this._turn_around = new jsb.Animate3D(animation, 2.84, 4);
                this._turn_arounds[i].retain();

                // this._walk_right = new jsb.Animate3D(animation, 4.44, 0.8);
                // this._turn_over = new jsb.Animate3D(animation, 5.24, 1.8);

                this._states.push(State.SWIMMING);
                this._collisionFlags.push(false);
            }
            this.walk(i);
        }


        /*var request = new jsb.HttpRequest();
        request.setRequestType(HttpRequest.Type.GET);
        request.setUrl('qunaraphone://main');*/


    },


    log_str: function (tag, obj) {
        cc.log(tag, JSON.stringify(obj));
    },

    walk: function (i, reverse) {
        i = parseInt(i);
        cc.log("walk called", i, reverse);
        this._sprites[i].stopActionByTag(100 + parseInt(i));
        if (this._moveActions[i]) {
            this._moveActions[i].release();
        }

        var s         = cc.winSize;
        var winWidth  = s.width;
        var winHeight = s.height;
        this.log_str('winSize', s);
        var pos = this._sprites[i].getPosition3D();
        cc.log("pos", pos.x, pos.y, pos.z);

        var dx, dy;
        var halfSpriteDimension = Math.max(this._spriteSizes[i].width, this._spriteSizes[i].height) / 2;
        cc.log('halfSpriteDimension', halfSpriteDimension);
        if (!reverse) {
        for (let i = 0; i < 3; i++) {
            let sideRandom = Math.random(); // 这个变量用来判断蜘蛛朝屏幕4条边的那一条走
            if (sideRandom < 0.25) {
                dx = halfSpriteDimension;
                dy = halfSpriteDimension + Math.random() * (winHeight - halfSpriteDimension * 2);
            } else if (sideRandom >= 0.25 && sideRandom < 0.5) {
                dx = winWidth - halfSpriteDimension;
                dy = halfSpriteDimension + Math.random() * (winHeight - halfSpriteDimension * 2);
            } else if (sideRandom >= 0.5 && sideRandom < 0.75) {
                dx = halfSpriteDimension + Math.random() * (winWidth - halfSpriteDimension * 2);
                dy = halfSpriteDimension;
            } else {
                dx = halfSpriteDimension + Math.random() * (winWidth - halfSpriteDimension * 2);
                dy = winHeight - halfSpriteDimension;
            }
            if (Math.abs(dx - pos.x) > 200 && Math.abs(dy - pos.y) > 200) { // 尽量避免沿着屏幕边缘走
                break;
            }
        }

        cc.log("dx dy", dx, dy);
        // this.drawNode = new cc.DrawNode();
        // this.drawNode.drawDot(pos, 3, cc.color(255,0,0,255));
        // this.drawNode.drawDot(cc.math.vec3(dx, dy, pos.z), 3, cc.color(255,0,0,255));
        // this.addChild(this.drawNode);
        var tan = (dy - pos.y) / (dx - pos.x);

        // var distance = Math.pow((dy - pos.y), 2) + Math.pow((dx - pos.x), 2)
        var distance = cc.pDistance(pos, cc.p(dx, dy));

        var speed    = 160;
        var duration = distance / speed;
        cc.log('distance, duration', distance, duration);

        cc.log('delta y,x', dy - pos.y, dx - pos.x);
        cc.log("tan, atan", tan, Math.atan(tan));
        var degrees  = cc.radiansToDegrees(Math.atan(tan));
        cc.log("degrees", degrees);

        var rotation = this._sprites[i].getRotation3D();
        rotation.z   = -degrees + 180;
        if ((dx - pos.x) < 0) {
            rotation.z -= 180;
        }


        var rotate_delta = rotation.z - this._sprites[i].getRotation3D().z;

        var rotate_speed = 2000;

        var rotate_duration = rotate_delta / rotate_speed;

        cc.log('rotate_delta, rotate_duration', rotate_delta, rotate_duration);
        var rot             = cc.rotateTo(1, rotation);

        this._originTarget[i] = {
            'dx': dx,
            'dy': dy
        }
        this.log_str('before rotate', this._sprites[i].getRotation3D());
        this.log_str('after rotate', rotation);
        this._moveActions[i] = cc.moveTo(duration, cc.p(dx, dy));
        } else {
            var dx =  this._originTarget[i].dx;
            var dy =  this._originTarget[i].dy;

            var newTarget = this.getReversePoint(dx,dy,pos.x,pos.y, i);

            //var distance = cc.pDistance(pos, cc.p(dx, dy));
            //var degrees  = cc.radiansToDegrees(Math.atan(tan));

            //var BackDistance = 80;

            var speed    = 160;
            var duration = cc.pDistance(pos, cc.p(newTarget.x, newTarget.y)) / speed;
            //var duration = Math.min(winHeight / 6,BackDistance * Math.sqrt(1 + Math.pow(tan, 2))) / speed;

            //var directionX = 1;
            //
            //if (dx - pos.x >= 0) {
            //    directionX = -1;
            //}
            //
            //var directionY = 1;
            //if (dy - pos.y >= 0) {
            //    directionY = -1;
            //}
            //
            var self = this;
            //
            var rot = cc.rotateBy(1, 180);
            //var new_dx;
            //var new_dy;
            //
            //if (2 * pos.x - dx > winWidth - halfSpriteDimension ) {
            //
            //    new_dx = winWidth - halfSpriteDimension;
            //} else if (2 * pos.x - dx < halfSpriteDimension){
            //    new_dx = halfSpriteDimension
            //} else {
            //    new_dx = 2 * pos.x - dx;
            //}
            //
            //if (2 * pos.y - dy > winHeight - halfSpriteDimension) {
            //    new_dy = winHeight - halfSpriteDimension;
            //} else if (2 * pos.y - dy < halfSpriteDimension){
            //    new_dy = halfSpriteDimension;
            //} else {
            //    new_dy = 2 * pos.y - dy;
            //}
            this._originTarget[i] = {
                'dx': newTarget.x,
                'dy': newTarget.y
            }

            this._moveActions[i] = cc.moveTo(duration, cc.p(newTarget.x, newTarget.y));
        }
        this._moveActions[i].retain();
        var seq  = cc.sequence(rot,cc.callFunc(this.resetCollision, this, i), this._moveActions[i], cc.callFunc(this.reachEndCallBack, this, i));
        seq.setTag(100 + i);
        this._sprites[i].runAction(seq);
    },

    addMenu: function () {
        var size = cc.winSize;
        // var deleteItem = this._deleteIcon = new cc.MenuItemImage(
        //     res.delete_png,
        //     res.delete_png,
        //     function () {
        //         cc.log('delete is clicked');
        //     },
        //     this
        // );
        // deleteItem.attr({
        //     x: size.width/4,
        //     y: size.height/5,
        //     anchorX: 0.5,
        //     anchorY: 0.5
        // });
        // var deleteMenu = new cc.Menu(deleteItem);
        // deleteMenu.x = 0;
        // deleteMenu.y = 0;
        // this.addChild(deleteMenu, 1);
        //
        //
        // var forwardItem = this._shareIcon = new cc.MenuItemImage(
        //     res.forward_png,
        //     res.forward_png,
        //     function () {
        //         cc.log('forward is clicked');
        //         this.sendHttpEvent();
        //     },
        //     this
        // );
        // forwardItem.attr({
        //     x: size.width * 3/4,
        //     y: size.height/5,
        //     anchorX: 0.5,
        //     anchorY: 0.5
        // });
        // var forwardMenu = new cc.Menu(forwardItem);
        // forwardMenu.x = 0;
        // forwardMenu.y = 0;
        // this.addChild(forwardMenu, 1);
        //
        //
        var shareItem = new cc.MenuItemImage(
            res.share_png,
            res.share_png,
            function () {
                cc.log('share is clicked');
                this.sendHttpEvent('share:type=click_open');
            },
            this
        );
        cc.log('size.width: '+size.width+'size.height: '+size.height);
        shareItem.attr({
            x: size.width,
            y: 0,
            anchorX: 1,
            anchorY: 0
        });
        var shareMenu = new cc.Menu(shareItem);
        shareMenu.x = 0;
        shareMenu.y = 0;
        this.addChild(shareMenu, -1);
    },
    reachEndCallBack:function(sender, index){
        this.walk(index);
        // var sprite = this._sprite;
        // sprite.stopActionByTag(100);
        // var inverse = this._moveAction.reverse();
        // inverse.retain();
        // this._moveAction.release();
        // this._moveAction = inverse;

        // var rot = cc.rotateBy(1, {x : 0, y : 0, z : 180});
        // var seq = cc.sequence(rot, this._moveAction, cc.callFunc(this.reachEndCallBack, this));
        // seq.setTag(100);

        // sprite.runAction(seq);
    },

    renewCallBack:function(sender, i){
        this._sprites[i].runAction(this._swims[i]);
        this._states[i] = State.HURT_TO_SWIMMING;
        this._elapseTransTimes[i] = 0.0;
    },


    onTouchesBegan:  function(touches, event){
        for(var i in touches) {
        var point  = touches[i].getLocation();
        cc.log('get touch', point.x, point.y);
            for (var i in this._sprites) {
                var spriteXY = this._sprites[i].getPosition3D();
                if (cc.pDistance(point, spriteXY) < 100) {
                    this._dragStart = {x: point.x, y: point.y, spriteIndex: parseInt(i)};
                    return true;
                }
            }
        }

    },
    onTouchesMoved : function(touches, event){
        for(var i in touches) {
            var endTouch = touches[i].getLocation();
            var offsetX  = endTouch.x;
            var offsetY  = endTouch.y;
        }

        if (this._dragStart) {
            if (Math.max(Math.abs(offsetX - this._dragStart.x), Math.abs(offsetY - this._dragStart.y)) > 100) {
                this._isDrag = true;
            }
            var index = this._dragStart.spriteIndex;

            this._sprites[index].stopActionByTag(100 + parseInt(index));
            this._sprites[index].setPosition(cc.p(offsetX, offsetY));
        }
    },

    onTouchesEnded:function(touches, event){
        for(var i in touches) {
            var location = touches[i].getLocation();
            if(this._isDrag) {
                this.walk(this._dragStart.spriteIndex);
                this._isDrag = false;
                this._dragStart = null;
                this.sendHttpEvent('drag:');

                return ;
            }

            for (var i = 0; i < this._spriteNum; i++) {

                if (this._sprites[i]) {
                    var len = cc.pDistance(this._sprites[i].getPosition(), location);

                    if (len < 120) {
                        if (this._states[i] == State.SWIMMING) {
                            this._elapseTransTimes[i] = 0;
                            this._states[i] = State.SWIMMING_TO_HURT;
                            this._sprites[i].stopAction(this._hurts[i]);
                            var move_action       = this._sprites[i].getActionByTag(100 + i);
                            this._sprites[i].stopAction(move_action);
                            this._sprites[i].runAction(this._hurts[i]);
                            var delay             = cc.delayTime(this._hurts[i].getDuration() - jsb.Animate3D.getTransitionTime());
                            this.log_str("delay", this._hurts[i].getDuration());
                            var seq               = cc.sequence(delay, cc.callFunc(this.renewCallBack, this, i));
                            seq.setTag(200 + i);
                            this._sprites[i].runAction(seq);
                            cc.log('100', this._sprites[i].getActionByTag(100 + i));
                            cc.log('200', this._sprites[i].getActionByTag(200 + i));
                            this.sendHttpEvent('hurt: spider'+ i);
                            setTimeout(this.walk.bind(this, [i]), 1700);
                        }
                    }
                }
            }
        }
    },

    collisionDetect: function(){
        if (this._sprites.length === this._spriteNum) {
            for(var i = 0; i <  this._spriteNum; i++) {
                var noCollision = 0;
                var spriteA = this._sprites[i];
                var posA = spriteA.getPosition3D();
                var spriteSizeA = this._spriteSizes[i];
                for (var j = 0; j < this._spriteNum; j++) {
                    if ( i === j ) {
                        continue;
                    }
                    var spriteB = this._sprites[j];
                    var posB = spriteB.getPosition3D();
                    var spriteSizeB = this._spriteSizes[j];
                    if (cc.pDistance(cc.p(posA.x, posA.y), cc.p(posB.x,posB.y)) <= Math.min((spriteSizeA.width + spriteSizeB.width)/2, (spriteSizeA.height + spriteSizeB.height)/2)
                        && !this._collisionFlags[i]) {
                        this._collisionFlags[i] = true;
                        this._collisionFlags[j] = true;
                        //cc.log("collision happen:", posA.x , posB.x, spriteSizeA.width, spriteSizeB.width, Math.abs(posA.y - posB.y), spriteSizeA.height, spriteSizeB.height);
                        var move_actionA       = this._sprites[i].getActionByTag(100 + parseInt(i));
                        var move_actionB       = this._sprites[j].getActionByTag(100 + parseInt(j));
                        this._sprites[i].stopAction(move_actionA);
                        this._sprites[j].stopAction(move_actionB);
                        this.walk(i, true);
                        this.walk(j, true);
                        // this._sprite.getActionByTag(100).pause();
                    }
                    if (cc.pDistance(cc.p(posA.x, posA.y), cc.p(posB.x,posB.y)) > Math.min((spriteSizeA.width + spriteSizeB.width)/2, (spriteSizeA.height + spriteSizeB.height)/2)
                        && Math.abs(posA.y - posB.y) > Math.max(spriteSizeA.height, spriteSizeB.height)/2 + 10
                        ) {
                        noCollision ++;
                    }
                }
                if (noCollision === this._spriteNum - 1){
                    this._collisionFlags[i] = false;
                    //cc.log('collisionDetect noCollision', noCollision , this._spriteNum - 1 );
                }
            }
        }
    },

    resetCollision: function(i) {
        if (this._collisionFlags[i]) {
            this._collisionFlags[i] = false;
        }

    },
    getReversePoint: function (dx, dy, posX, posY, i) {
        var newTargetX = 0;
        var newTargetY = 0;

        var halfSpriteDimension = Math.max(this._spriteSizes[i].width, this._spriteSizes[i].height) / 2;
        var s         = cc.winSize;
        var winWidth  = s.width;
        var winHeight = s.height;

        if (Math.abs(dx - posX)<= 0.0001) {
            newTargetY = winHeight - dy;
            newTargetX = dx + 10 * Math.random();
        } else {
            var tan = (dy - posY) / (dx - posX);
        if (dx == halfSpriteDimension ) {
            if (Math.abs(dx - posX)<= 0.0001) {
                newTargetY = winHeight - dy;
                newTargetX = dx;
            } else {
                    if (tan >= winHeight / winWidth) {
                        newTargetY = winHeight - halfSpriteDimension;
                        newTargetX = (newTargetY - dy) / tan + dx;
                    } else if (tan <= -1 * (s.height / winWidth)) {
                        newTargetY = halfSpriteDimension;
                        newTargetX = (newTargetY - dy) / tan + dx;
                    } else {
                        newTargetX = winWidth - halfSpriteDimension;
                        newTargetY = dy - (dx - newTargetX) * tan
                    }
            }
        } else if (dx == winWidth - halfSpriteDimension){

                if (tan >= winHeight / winWidth) {
                    newTargetY = halfSpriteDimension;
                    newTargetX = (newTargetY - dy) / tan + dx;
                } else if (tan <= -1 * (s.height / winWidth)) {
                    newTargetY = winHeight - halfSpriteDimension;
                    newTargetX = (newTargetY - dy) / tan + dx;
                } else {
                    newTargetX = halfSpriteDimension;
                    newTargetY = dy - (dx - newTargetX) * tan
                }
        } else if (dy == halfSpriteDimension) {
                if (tan <= winHeight / winWidth && tan >=0) {
                    newTargetX = winWidth - halfSpriteDimension;
                    newTargetY = (newTargetX - dx) * tan + dy;
                } else if (tan >= -1 * (s.height / winWidth) && tan < 0) {
                    newTargetX = halfSpriteDimension;
                    newTargetY = (newTargetX - dx) * tan + dy;
                } else {
                    newTargetY = winHeight - halfSpriteDimension;
                    newTargetX = dx - (dy - newTargetY) / tan;
                }

        } else if (dy == winHeight - halfSpriteDimension) {
            if (tan <= winHeight / winWidth && tan >= 0) {
                newTargetX = halfSpriteDimension;
                newTargetY = (newTargetX - dx) * tan + dy;
            } else if (tan >= -1 * (s.height / winWidth) && tan < 0) {
                newTargetX =  winWidth - halfSpriteDimension;
                newTargetY = (newTargetX - dx) * tan + dy;
            } else {
                newTargetY = halfSpriteDimension;
                newTargetX = dx - (dy - newTargetY) / tan;
            }

        }
        }
        if (newTargetX < halfSpriteDimension ){
            newTargetX = halfSpriteDimension;
        } else if (newTargetX > winWidth - halfSpriteDimension){
            newTargetX = winWidth - halfSpriteDimension;
        }

        if (newTargetY < halfSpriteDimension) {
            newTargetY = halfSpriteDimension;
        } else if (newTargetY > winHeight - halfSpriteDimension){
            newTargetY = winHeight - halfSpriteDimension;
        }
        return cc.p(newTargetX, newTargetY);
    },
    update:function(dt) {
        //if (this._spriteNum > 1 ) {
        //    this.collisionDetect();
        //}

        for (var i = 0; i < this._spriteNum; i++) {
            if (this._states[i] == State.HURT_TO_SWIMMING) {
                this._elapseTransTimes[i] += dt;

                if (this._elapseTransTimes[i] >= jsb.Animate3D.getTransitionTime()) {
                    this._sprites[i].stopAction(this._hurts[i]);
                    this._states[i] = State.SWIMMING;
                }
            } else if (this._states[i] == State.SWIMMING_TO_HURT) {
                this._elapseTransTimes[i] += dt;

                if (this._elapseTransTimes[i] >= jsb.Animate3D.getTransitionTime()) {
                    this._sprites[i].stopAction(this._swims[i]);
                    this._states[i] = State.HURT;
                }
            }
        }
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        // this.setCascadeOpacityEnabled(true)
        // this.setOpacity(255 * 0)

        var layer = new HelloWorldLayer();
        // var layer = Animate3DTest;
        // layer.setCascadeOpacityEnabled(true)
        // layer.setOpacity(255 * 0)
        this.addChild(layer);
    }
});
