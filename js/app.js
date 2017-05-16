"use strict";
/**
 * 基类,包含在屏幕上所有东西所需要的宽度和高度，应该被任何需要由这些信息的类继承
 * 单元宽度，和高度
 * @param {number} HORIZONTAL_TILE_WIDTH - 宽度
 * @param {number} VISIBLE_VERTICAL_TILE_HEIGHT - 高度
 * @constructor
 */
var GameItem = function() {
  this.HORIZONTAL_TILE_WIDTH = 101;
  this.VISIBLE_VERTICAL_TILE_HEIGHT = 83;
};

/**
 * 渲染基类，在屏幕上呈现每一个的对象
 * @param {number} x - x代表对象在Canvas水平坐标上的位置
 * @param {number} y - y代表对象在Canvas垂直坐标上的位置
 * @param {number} width - 对象图片的宽度
 * @param {string} sprite - 被渲染对象的图片文件
 * @constructor
 */
var RenderableItem = function(x, y, width, sprite) {
  GameItem.call(this);
  this.x = x;
  this.y = y;
  this.width = width;
  this.sprite = sprite;
};

RenderableItem.inheritsFrom(GameItem);

//渲染基类原型对象方法，在画布上画出对象
RenderableItem.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * 移动基类对象，代表一个在屏幕上显示的对象，拥有一个位置，并且可以移动位置
 * @param {number} x - x coordinate position on the canvas of this item
 * @param {number} y - y coordinate position on the canvas of this item
 * @param {number} width - 对象的可视化宽度(用来决定是否与其他的对象产生了碰撞)
 * @param {number} verticalBuffer - 距离画布顶部的像素,垂直剩余量（缓冲区）,就是最上面的小河占据的高度
 * @param {string} sprite - 被渲染对象的图片文件
 * @constructor
 */
var MovableItem = function(x, y, width, verticalBuffer, sprite) {
  RenderableItem.call(this, x, y, width, sprite);
  this.startingXPosition = x;
  this.startingYPosition = y;
  this.halfVisibleWidth = width / 2;
  this.rowAdjust = verticalBuffer;
};

MovableItem.inheritsFrom(RenderableItem);

//在画布上该对象的水平中间位置
MovableItem.prototype.midPoint = function() {
  return this.x + (this.HORIZONTAL_TILE_WIDTH / 2);
};

//到画布左侧边框的可视化距离
MovableItem.prototype.visibleLeft = function() {
  return this.midPoint() - this.halfVisibleWidth;
};

//到画布右侧边框的可视化距离
MovableItem.prototype.visibleRight = function() {
  return this.midPoint() + this.halfVisibleWidth;
};

//对象占据的行
MovableItem.prototype.onRow = function() {
  var adjustedY = this.y - this.rowAdjust;
  if (adjustedY != 0) {
    // 一个表示小于或等于指定数字的最大整数的数字 ,有多少行
    return Math.floor(adjustedY / this.VISIBLE_VERTICAL_TILE_HEIGHT);
  } else {
    return 0;
  }
};

/**
 *检测一个对象是不是被另外一个对象碰到了。条件是这两个对象的可视化边框有重叠，并且同时他们在相同的行上。
 *@param {object}  item 我们要检测的目标碰撞对象
 *@returns {boolean} 是否产生了碰撞，如果是则返回true，否返回false
 */
MovableItem.prototype.collidingWith = function(item) {
  try {
    if (this.onRow() === item.onRow()) {
      //有两种情况发生，一种是玩家刚到敌人的右前方时，一种是玩家到了敌人的左后方
      return (item.visibleRight() <= this.visibleRight() && item.visibleRight() >=
        this.visibleLeft()) || (item.visibleLeft() <= this.visibleRight() &&
        item.visibleLeft() >= this.visibleLeft());
    }
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

// 重设玩家的位置到最开始的像素时候，原先有提前保留
MovableItem.prototype.resetPosition = function() {
  this.x = this.startingXPosition;
  this.y = this.startingYPosition;
};

// 这是我们的玩家要躲避的敌人
var Enemy = function() {
  // 要应用到每个敌人的实例的变量写在这里
  // 我们已经提供了一个来帮助你实现更多
  this.verticalBuffer = 57;
  MovableItem.call(this, this._leftMostXPostition(), this.generateYPosition(),
    86, this.verticalBuffer, 'images/enemy-bug.png');
  this.setSpeed();
};

Enemy.inheritsFrom(MovableItem);

// 设置敌人的速度为 100~399 区间内的值
Enemy.prototype.setSpeed = function() {
  this.speed = Math.floor((Math.random() * 300) + 100);
};

// 敌人可以存在的最大左侧的像素位置    空出两个单位的像素
Enemy.prototype._leftMostXPostition = function() {
  return -(this.HORIZONTAL_TILE_WIDTH + 2);
};

// 构造一个垂直方向上的敌人，敌人可以占据在可控范围内的任何石头块行上
Enemy.prototype.generateYPosition = function() {
  return Math.floor(Math.random() * 3) * this.VISIBLE_VERTICAL_TILE_HEIGHT +
    this.verticalBuffer;
};

// 敌人可以存在的最大左侧的像素位置    空出两个单位的像素
Enemy.prototype._rightMostXPosition = function() {
  return ctx.canvas.width + 2;
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
  // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
  // 都是以同样的速度运行的
  //如果敌人跑出了右边界，那么重新设置敌人，以便使它能够再次出现在屏幕上
  if (this.x > this._rightMostXPosition()) {
    this.reset();
  }
  this.x += this.speed * dt;
};

// 重置敌人的位置和速度
Enemy.prototype.reset = function() {
  this.resetPosition();
  this.setSpeed();
};

// 重新设置敌人的位置
Enemy.prototype.resetPosition = function() {
  this.y = this.generateYPosition();
  this.x = this.startingXPosition;
};

// 现在实现你自己的玩家类
var Player = function() {
  MovableItem.call(this, 202, 380, 31, 48, 'images/char-boy.png');
};

Player.inheritsFrom(MovableItem);

// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
Player.prototype.update = function(x, y) {
  this._checkEnemyCollisions();
};

//检测玩家是装上了其中一个敌人，如果确实装上了，则通知游戏属性对象
Player.prototype._checkEnemyCollisions = function() {
  var allEnemiesLength = allEnemies.length;
  for (var i = 0; i < allEnemiesLength; i++) {
  	if (allEnemies[i].collidingWith(this)) {
  		gameProperties.playerCollidedWithEnemy();
  		break;
  	}
  }
};

// 玩家键盘操作处理     非常重要的函数   方向进行控制
Player.prototype.handleInput = function(direction) {
  //用switch比用if要快， 因为前者会建立一个索引， 这样根据索引就可以会直接到达指定的某个位置。
  switch (direction) {
    case 'left':
      this._moveLeft();
      break;
    case 'up':
      this._moveUp();
      break;
    case 'right':
      this._moveRight();
      break;
    case 'down':
      this._moveDown();
      break;
  }
};

// 如果玩家当前不在最左边界，则向左移动
Player.prototype._moveLeft = function() {
  if (this.x >= this.HORIZONTAL_TILE_WIDTH) {
    this.x -= this.HORIZONTAL_TILE_WIDTH;
  }
};

// 如果玩家当前不在最右边界，则向右移动
Player.prototype._moveRight = function() {
  if (this.x + this.HORIZONTAL_TILE_WIDTH < ctx.canvas.width) {
    this.x += this.HORIZONTAL_TILE_WIDTH;
  }
};

// 如果玩家当前不在最顶部石头的那一行，玩家向上移动一行。
// 如果玩家在最顶部石头的那一行，那么就重新设置到他的开始位置，同时通知游戏属性对象
Player.prototype._moveUp = function() {
  if (this._hasReachedTopRow()) {
    gameProperties.playerReachedTopRow();
    this.resetPosition();
    this.resetPosition();
  } else {
    this.y -= this.VISIBLE_VERTICAL_TILE_HEIGHT;
  }
};

// 检测玩家是否已经到了石头区域的最上方
Player.prototype._hasReachedTopRow = function() {
  return this.onRow() === 0;
};

// 如果玩家没有在移动区域的最下方，那么移动玩家向下一个位置
Player.prototype._moveDown = function() {
  if (this.y < this.startingYPosition) {
    this.y += this.VISIBLE_VERTICAL_TILE_HEIGHT;
  }
}

// 游戏属性对象
var GameProperties = function() {
  GameItem.call(this);
  this.consecutiveSuccesses = 0;  //记录下连续成功多少次
  this.sounds = {   //HTML5音频
    enemyCollision: new Audio('sounds/crunch.wav'),
    splash: new Audio('sounds/water-splash.wav')
  };
  this._initializeWalkingArray();
};

GameProperties.inheritsFrom(GameItem);

// 初始化数组，使其包含玩家成功走过的每一步石头的坐标位置
GameProperties.prototype._initializeWalkingArray = function() {
  this.walkedSuccess = [];
  for (var i = 0; i < 3; i++) {
    this.walkedSuccess.push([]);
  }
};

// 玩家装上了一个敌人，此时播放相撞的声音， 并且重置游戏
GameProperties.prototype.playerCollidedWithEnemy = function() {
  this.sounds.enemyCollision.play();
  this.reset();
};

// 重置玩家的属性
GameProperties.prototype.reset = function() {
  this.consecutiveSuccesses = 0;
  player.resetPosition();
}

// 当玩家到达最顶层那一行时，该方法被调用，并且把相应的得分添加到总值上去
GameProperties.prototype.playerReachedTopRow = function() {
  this.sounds.splash.play();
  this.consecutiveSuccesses++;
};

// 游戏属性对象渲染
GameProperties.prototype.render = function() {
  this._renderGamePoints();
};

// 渲染游戏的得分
GameProperties.prototype._renderGamePoints = function() {
  var yCoordinate = 40;
  ctx.clearRect(0, 0, ctx.canvas.width -
    7, yCoordinate);
  ctx.fillStyle = 'green';
  ctx.font = '20pt Nunito, sans-serif';
  if (gameProperties.consecutiveSuccesses > 0) {
    ctx.textAlign = 'right';
    ctx.fillText(gameProperties.consecutiveSuccesses.toString(), ctx.canvas.width -
      7, yCoordinate);
  }
};

// 现在实例化你的所有对象
// 全局游戏属性对象
var gameProperties = new GameProperties();
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
var allEnemies = [];

for(var i = 0; i < 3; i++){
	allEnemies.push(new Enemy());
}

// 把玩家对象放进一个叫 player 的变量里面
var player = new Player();

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };
  player.handleInput(allowedKeys[e.keyCode]);
});