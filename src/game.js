var game = function() {
	var LEFT = 13;
	var RIGHT = 1980;
  var Q = (window.Q = Quintus({ development: true, audioSupported: [ 'mp3','ogg' ] })
    .include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio")
    .setup({
      width: 320,
      height: 480
    })
    .controls() 
    .touch()
    .enableSound());

  Q.MovingSprite.extend("Mario", {
    init: function(p) { 
      this._super(p, {
      	sprite: "mario",
        sheet: "marioR",
        frame: 0,
        x: 650,
        y: 380,
        vx:0,
        vy:0, 
        direction: 'rigth',
        jumpSpeed: -550,
        dead: false,
        win: false
    });

	this.add("2d, platformerControls, animation, tween");
	this.on('mario.win',this,'win');
	this.on('mario.die',this,'die');
	this.on('mario.jump',this,'jump');
	this.on('mario.destroy',this,'destroy');

	this.on("hit.sprite",function(collision) {  
		if(collision.obj.isA("Coin")) { 
			collision.obj.trigger("pick_coin");
		}	
	});

	this.on("bump.bottom", function(collision) {
		if(collision.obj.p.type==Q.SPRITE_ENEMY){

		}
	});
    },
    step: function(dt) {
    	if(this.p.y>1000){
    		this.die();
    	}
    	if(!this.p.dead && !this.p.win){
    		if(this.p.vx==0 && this.p.vy==0 && !this.p.ignoreControls){
    			this.play('stay_'+this.p.direction);
    		} else if(this.p.landed > 0 && !this.p.ignoreControls) {
				if(Q.inputs['fire']) {
					this.p.speed = 300;
					this.play("run_" + this.p.direction);
				} else {
					this.p.speed = 200;
					this.play("walk_" + this.p.direction);
				}
			} else if((this.p.landed < 0 && !this.p.ignoreControls) || this.p.jump) {
				this.play("jump_" + this.p.direction);
				this.p.jump=false;				
			}
			if(Q.inputs['up'] && this.jump && this.p.landed > 0) {
				Q.audio.play('jump_small', {loop:false});
			}
    	}else if(this.p.dead){
    		this.play('dead_right');
    	}
    },
    win: function(){
    	this.del('2d, platformerControls');
		Q.stageScene("endGame",2, { label: "You Win!" });
    },
    die: function(){

    	if (Q.state.get("lives") == 1) { // si muere y solo le queda una vida significa que muere del todo	
			this.p.dead=true;
			this.del('2d, platformerControls');
			Q.audio.stop();
			Q.audio.play('music_die', {loop:false});
			this.animate({ x: this.p.x, y: this.p.y-50, angle: 0 }, 0.25, Q.Easing.Linear);
			this.animate({ x: this.p.x, y: this.p.y+100, angle: 0 }, 2.5, Q.Easing.Quadratic.In,{delay: 0.5, callback: function() { this.destroy(); }});
			Q.state.set("coins", 0);
			Q.stageScene("endGame",2, { label: "You Lose!" });
		}else{ 
			Q.state.inc("lives", (-1));
			Q.state.set("coins", 0);
	   		Q.stageScene('level1');
		}
    },
    jump: function(){
    	this.p.vy = -600;
		this.p.jump = true;
    }
  });


Q.component('enemy', {
    added: function() {
        this.entity.add('2d, animation, aiBounce');
        
        this.entity.on('bump.left, bump.right, bump.bottom', this, 'kill');
    },
    kill: function(collision) {
        if(collision.obj.isA("Mario")){
			collision.obj.trigger('mario.die');
			this.entity.del('2d');
		}
    }
});



Q.MovingSprite.extend("Goomba", {
    init: function(p) {
		this._super(p, {
			sheet:'goomba', 
			sprite: 'goomba', 
			ax: 1,
			x: 650,
        	y: 380,
        	type: Q.SPRITE_ENEMY,
			dead: false
		});
		this.p.vx=-20;
		this.add('enemy');
		this.on("goomba.die", this, "die");
		this.on('bump.top', this, 'top');
    },
    step: function(dt) { 
    	this._super(dt);
	  	if(this.p.vx != 0) {
	  		this.play("walk");
	  	}
    },

	die: function(){
		this.p.vx=this.p.vy=0;
		this.destroy();

	},
    top: function(collision) {
        if(collision.obj.isA("Mario")){
			collision.obj.trigger("mario.jump");
			Q.audio.play('squish_enemy',{loop:false});
		  	this.play('crushed',5);
		}
    }
});

Q.MovingSprite.extend("Piranha", {
	init: function(p) {
		this._super(p, {
			sheet: "piranha",
			sprite: "piranha",
			type: Q.SPRITE_ENEMY,
			frame: 0
		});

		this.add('enemy');

		this.on('bump.top', this, 'top');	

	},
    step: function(dt) { 
    	this._super(dt);
	  	this.play("bite");
    },

	top: function(collision) {
        if(collision.obj.isA("Mario")){
			collision.obj.trigger("mario.die");
		}
    }			
});


Q.MovingSprite.extend("Bloopa", {
    init: function(p) {
		this._super(p, {
			sheet: "bloopa",
			sprite: 'bloopa',
			x: 600,
    		y: 200,
			ax: 0,
			ay:0.2,
			timer:0,
			type: Q.SPRITE_ENEMY,
			gravity:0.2
		});
		this.add('enemy');
		this.on("bloopa.jump", this, "jump");
		this.on("bloopa.die", this, "die");
		this.on('bump.top', this, 'top');
	},

	step: function(dt) {
		this._super(dt);

		this.p.timer = this.p.timer + dt;
		if (this.p.timer > 5) {
	    this.play("jump", 1);
	    this.p.timer = 0;
	  	}else if(this.p.vy == 0 && this.p.timer <=5){
			this.p.vx = 0;
			this.play("stand"); 
		}

	},

	jump: function() {
		this.p.vy = -(Math.floor(Math.random() * (150)) + 50);
		this.p.vx = (Math.random()*100) -50;
		this.play("stand");
	},

	die: function(){
		this.p.vx=this.p.vy=0;
		this.destroy();

	},
    top: function(collision) {
        if(collision.obj.isA("Mario")){
			collision.obj.trigger("mario.jump");
			Q.audio.play('squish_enemy',{loop:false});
		  	this.play('crushed',5);
		}
    }

});

Q.Sprite.extend("Princess", {
    init: function(p) {
	    this._super(p, {
	        sheet: "princess",
	        frame: 0,
	        x: 600,
	        y: 380
		});      
		this.add("2d, aiBounce");

		this.on("bump.left,bump.right,bump.top,bump.bottom", function(collision) {
			if(collision.obj.isA("Mario")){
				Q.audio.stop('main');
				Q.audio.play('win', { loop: false });
				collision.obj.trigger('mario.win');
			}
		});
    },
    step: function(dt) { 
      
    }
});

Q.Sprite.extend("Coin", {

	init: function(p) {
	    this._super(p,{
	      sheet: "coin",
	      sprite: 'coin',
	      type: Q.SPRITE_COLLECTABLE,
	      collisionMask: Q.SPRITE_PLAYER,
	      sensor: true,
	      vx: 0,
	      vy: 0,
	      gravity: 0,
	      pickedUp: false
	    });

	    this.add("2d, animation, tween");
	    this.on("sensor");
  	},
	sensor: function() {
	    if(!this.p.pickedUp)
	    {
	    	this.p.pickedUp = true;
	    	Q.state.inc("coins", 1);	
		    Q.audio.play('coin');
		    this.anim();
	  	}
	},

	step: function(dt) {
		this.play("shine",1);
		//this.anim();
	},

	anim: function() {
		this.animate({ x: this.p.x, y: this.p.y-25, angle: 0 }, 0.25, Q.Easing.Linear, {callback: function() { this.destroy(); }});
	}

});



Q.scene("HUD",function(stage) {
	Q.UI.Text.extend("Monedas",{ 
        init: function(p) {
            this._super({
                label: "Monedas: 0",
                color: "white",
                x: Q.width * 0.25 + 15,
                y: 50
            });

            Q.state.on("change.coins",this,"coins");
        },

        coins: function(coins) {
            this.p.label = "Monedas: " + coins;
        }
	});
	
	// PARTE AVANZADA Vidas
	Q.UI.Text.extend("Vidas",{ 
        init: function(p) {
            this._super({
                label: "Vidas: 3",
                color: "white",
                x: Q.width * 0.75,
                y: 50
            });

            Q.state.on("change.lives",this,"lives");
        },

        lives: function(lives) {
            this.p.label = "Vidas: " + lives;
        }
	});
	
	 var container = stage.insert(new Q.UI.Container({
        x: 0, y: 0, fill: "rgba(0,0,0,0.5)"
    }));

	 container.insert(new Q.Monedas());
	 container.insert(new Q.Vidas());

});











var confirm = false;

  ////////// Load TMX level //////////
Q.scene("level1", function(stage) {
	Q.audio.stop();
	Q.stageTMX("level.tmx", stage);

	var mario = stage.insert(new Q.Mario({x:124,y:528}));

	stage.add("viewport").follow(mario,{ x: true, y: false }, {minY:13,minX:100});
	stage.add("viewport").centerOn(150, 380);

	stage.insert(new Q.Goomba({x:2000}));
	stage.insert(new Q.Goomba({x:500}));
	stage.insert(new Q.Goomba({x:1400}));
	stage.insert(new Q.Goomba({x:1200}));
	stage.insert(new Q.Goomba({x:3230, y:290}));

	stage.insert(new Q.Bloopa({x:2800}));
	stage.insert(new Q.Bloopa({x:3550}));

	stage.insert(new Q.Princess({x:4246,y:324}));
	stage.insert(new Q.Coin({x:800,y:380}));
	stage.insert(new Q.Coin({x:1257,y:750}));
	stage.insert(new Q.Coin({x:1500,y:380}));
	stage.insert(new Q.Coin({x:2000,y:380}));
	stage.insert(new Q.Coin({x:2250,y:380}));
	stage.insert(new Q.Coin({x:2500,y:380}));
	stage.insert(new Q.Coin({x:2940,y:800}));
	stage.insert(new Q.Coin({x:3200,y:290}));
	stage.insert(new Q.Coin({x:3225,y:290}));
	stage.insert(new Q.Coin({x:3250,y:290}));
	stage.insert(new Q.Coin({x:3275,y:290}));


	stage.insert(new Q.Piranha({x: 990, y:460}));


	Q.audio.play('main', { loop: true });


});

Q.scene('endGame',function(stage) {
	var box = stage.insert(new Q.UI.Container({
		x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	}));
  
	var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                       label: "Play Again" }));      
	var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
	                                    label: stage.options.label }));

	button.on("click",function() {
		Q.audio.stop();
		confirm=false;
		Q.clearStages();
		Q.stageScene('initialMenu');
	});
	box.fit(20);
});



Q.scene('initialMenu',function(stage) {
	stage.insert(new Q.Repeater( { asset: "mainTitle.png" } ));
	var container = stage.insert(new Q.UI.Container({
    	x: Q.width/2, 
    	y: Q.height*2/3, 
    	fill: "rgba(0,0,0,0.5)",
    	type: Q.SPRITE_UI
  	}));

	Q.input.on('confirm',this,function(){
		if(!confirm){
			Q.clearStages();
			Q.state.reset({ coins: 0, lives: 3});
			Q.stageScene('level1');
			Q.stageScene("HUD", 2);
			confirm=true;
		}
	})
	container.fit(15,25);
});

  Q.loadTMX("level.tmx, piranha.png, piranha.json, coin.png, coin.json, mainTitle.png, princess.json, princess.png, bloopa.json, bloopa.png, mario_small.png, mario_small.json, goomba.png, goomba.json", function() {
	Q.compileSheets("mario_small.png", "mario_small.json");
    Q.compileSheets("goomba.png", "goomba.json");
    Q.compileSheets("bloopa.png", "bloopa.json");
    Q.compileSheets("princess.png", "princess.json");
	Q.compileSheets("coin.png","coin.json");
	Q.compileSheets("piranha.png", "piranha.json");


    Q.animations('mario',{
  		walk_right: {frames:[1,2], rate:0.3, loop:false, next:'stay_right'},
  		walk_left: {frames:[15,16], rate:0.3, loop:false, next:'stay_left'},
  		run_right: {frames:[3,4], rate:0.3, loop:true, next:'stay_right'},
  		run_left: {frames:[17,18], rate:0.3, loop:true, next:'stay_left'},
  		stay_right: {frames:[0], rate:1, loop:false},
		stay_left: {frames:[14], rate:1, loop:false},
		jump_left: {frames:[18], rate:0.5, loop:true, next:'stay_left'},
		jump_right: {frames:[4], rate:0.5, loop:true, next:'stay_right'},
		dead_right: { frames:[12], rate: 1, flip: false, loop:true, trigger: 'mario.destroy' },
		dead_left: { frames: [12], rate: 1, flip: 'x' },
		empty_right: { frames: [13], rate: 0.1, flip: false, loop: false }

  	});

  	Q.animations('goomba',{
  		walk: {frames:[0,1], rate:0.3},
  		crushed: {frames:[2], rate:0.3, loop:false, trigger: 'goomba.die'}
  	});

  	Q.animations('bloopa',{
  		stand: { frames: [0], rate: 1 },
		jump: { frames: [1], rate: 0.3, loop: false, trigger: "bloopa.jump" },
		crushed: { frames: [2], rate: 0.3, loop: false, trigger: "bloopa.die"}
  	});

  	Q.animations("coin", {
		shine: { frames: [0,1,2,1], rate: 1/3 }
	});

  	Q.animations('piranha', {
		bite: { frames: [1,0], rate: 0.5}
	});

  	Q.load({
          'main': 'music_main.ogg',
          'kill_enemy': 'kill_enemy.ogg',
          'squish_enemy': 'squish_enemy.ogg',
          'music_die': 'music_die.ogg',
          'coin': 'coin.ogg',
          'win': 'music_level_complete.ogg',
          'jump_small': 'jump_small.ogg'
        },function() { Q.stageScene("initialMenu"); });	
  });

};