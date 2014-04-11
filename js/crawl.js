Game = {};

Game.Load = function(game){};

Game.Load.prototype = {

  preload: function(){
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('player', 'assets/ladybug-shadow-60.png');
    game.load.spritesheet('baddy', 'assets/ant-spritesheet-shadow-30.png', 32, 30);
    game.load.image('background', 'assets/background.jpg');
  },

  create: function(){
    this.background = game.add.tileSprite(0, 0, 400, 400, 'background');

    // Title text
    this.title = game.add.text(game.world.centerX, 150, "Crawl", {font: "90px 'Faster One'", fill:"#FFDC00", align: "center"});
    this.title.anchor.setTo(0.5);
    this.title.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);

    // Text
    this.text = game.add.text(game.world.centerX, 250, "move with arrow keys\npress UP to begin", { font: "20px Audiowide", fill: "#000", align: "center"});
    this.text.anchor.setTo(0.5);
    this.text.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);

    this.cursors = game.input.keyboard.createCursorKeys();
    this.time = this.game.time.now + 1000;
  },

  update: function(){
    if (this.game.time.now > this.time && !ScoreIt.isVisible() && this.cursors.up.isDown) {
      game.state.start('Play');
    }
  }
};

Game.Play = function(game){};

Game.Play.prototype = {

  create: function(){
    this.background = game.add.tileSprite(0, 0, 400, 400, 'background');

    // Player
    this.player = game.add.sprite((game.world.centerX) - 21, (game.world.centerY) - 16, 'player');
    this.player.config = {
      bodyWidth: 42,
      bodyHeight: 32,
      velocity: 150 * 1.2
    }
    game.physics.enable(this.player, Phaser.Physics.ARCADE);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(this.player.config.bodyWidth, this.player.config.bodyHeight, this.player.config.bodyWidth/2, this.player.config.bodyHeight/2);  

    // Baddies
    this.baddies = game.add.group();
    this.baddies.setAll('outOfBoundsKill', true);
    this.nextBaddyTime = game.time.now;

    // Cursors
    this.cursors = game.input.keyboard.createCursorKeys();

    // Scoretext
    this.score = 0;
    this.nextScoringTime = game.time.now;
    this.scoreText = game.add.text(15, 10, this.score.toString(), {font: '30px Audiowide', fill: '#FFDC00'});
    this.scoreText.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);
  },

  update: function(){
    game.physics.arcade.overlap(this.player, this.baddies, this.killPlayer, null, this);

    // Player
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;
    this.player.body.angularVelocity = 0;

    // Add cursor control of player
    if (this.cursors.left.isDown) {
      this.rotatePlayer(this.player, 180, this.player.config.bodyWidth, this.player.config.bodyHeight);
      this.player.body.velocity.x = -this.player.config.velocity;
    } else if (this.cursors.right.isDown){
      this.rotatePlayer(this.player, 0, this.player.config.bodyWidth, this.player.config.bodyHeight);
      this.player.body.velocity.x = this.player.config.velocity;
    } else if (this.cursors.up.isDown){
      this.rotatePlayer(this.player, 270, this.player.config.bodyHeight, this.player.config.bodyWidth);
      this.player.body.velocity.y = -this.player.config.velocity;
    } else if (this.cursors.down.isDown){
      this.rotatePlayer(this.player, 90, this.player.config.bodyHeight, this.player.config.bodyWidth);
      this.player.body.velocity.y = this.player.config.velocity;
    }

    // Spawn baddies
    if(game.time.now >= this.nextBaddyTime){
      this.nextBaddyTime += 500;
      this.newBaddy();
    }

    // Increase score
    if(game.time.now >= this.nextScoringTime){
      this.nextScoringTime += 1000;
      this.score += 1;
      this.scoreText.text = this.score.toString();
    }
  },

  /*render: function(){
    game.debug.body(this.player);
    game.debug.spriteBounds(this.player);
    this.baddies.forEach(function(baddy){
    game.debug.body(baddy);
    game.debug.spriteBounds(baddy);
    });
    },*/

  newBaddy: function(){
    var startX, startY, angle;
    if (_.random(0, 1) === 0) {
      startX = game.world.randomX;
      startY = _.random(0, 1) === 0 ? -25 : 425;
    } else {
      startY = game.world.randomY;
      startX = _.random(0, 1) === 0 ? -26 : 426;
    }

    if (startX <= 200 && startY <= 200) {
      angle = _.random(20, 70);
    } else if ( startX > 200 && startY <= 200 ) {
      angle = _.random(110, 160);
    } else if ( startX > 200 && startY >= 200 ) {
      angle = _.random(200, 250);
    } else {
      angle = _.random(290, 340);
    }

    var baddy = this.baddies.create(startX, startY, 'baddy');
    baddy.config = {
      bodyWidth: 26,
      bodyHeight: 24,
      velocity: 150 * 1.2
    }
    game.physics.enable(baddy, Phaser.Physics.ARCADE);
    baddy.anchor.setTo(0.5, 0.5);
    baddy.angle = angle;
    baddy.body.setSize(baddy.config.bodyWidth, baddy.config.bodyHeight, baddy.config.bodyWidth/2, baddy.config.bodyHeight/2);  
    baddy.animations.add('move', [0, 1, 2], 10, true);
    baddy.animations.play('move');
    game.physics.arcade.velocityFromAngle(angle, baddy.config.velocity, baddy.body.velocity);
  },

  rotatePlayer: function(player, angle, bodyWidth, bodyHeight){
    player.angle = angle;
    player.body.setSize(bodyWidth, bodyHeight, bodyWidth/2, bodyHeight/2);  
  },

  killPlayer: function(player, baddy){
    player.kill();
    game.score = this.score;
    game.state.start('Over');
  }

};

Game.Over = function(game){};

Game.Over.prototype = {
  create: function(){
    this.background = game.add.tileSprite(0, 0, 400, 400, 'background');

    // Title text
    this.title = game.add.text(game.world.centerX, 150, "Game\nOver", {font: "90px 'Faster One'", fill:"#FFDC00", align: "center"});
    this.title.anchor.setTo(0.5);
    this.title.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);

    // Score text
    this.scoreText = game.add.text(game.world.centerX, 280, "You scored " + game.score + "!", { font: "30px Audiowide", fill: "#000", align: "center"});
    this.scoreText.anchor.setTo(0.5);
    this.scoreText.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);

    // Other Text
    this.text = game.add.text(game.world.centerX, 310, "press UP to restart", { font: "22px Audiowide", fill: "#000", align: "center"});
    this.text.anchor.setTo(0.5);
    this.text.setShadow(5, 5, 'rgba(0,0,0,0.7)', 15);

    this.cursors = game.input.keyboard.createCursorKeys();
    this.time = game.time.now + 1000;

    ScoreIt.checkAndRegisterScore(game.score.toString());
  },

  update: function(){
    if (game.time.now > this.time && !ScoreIt.isVisible() && this.cursors.up.isDown) {
      game.state.start('Play');
    }
  }
};

var game = new Phaser.Game(400, 400, Phaser.AUTO, 'game');

WebFontConfig = {
  google: {
    families: ['Faster One', 'Audiowide']
  }
};

game.state.add('Load', Game.Load);
game.state.add('Play', Game.Play);
game.state.add('Over', Game.Over);
game.state.start('Load');

$(function(){
  ScoreIt.create("#scoreboard", 12);
});
