var game = function() {

  var Q = (window.Q = Quintus({ development: true, audioSupported: [ 'mp3','ogg' ] })
    .include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio")
    .setup({
      width: 320,
      height: 480
    })
    .controls() 
    .touch()
    .enableSound());

  Q.Sprite.extend("Mario", {
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
	this.on('mario.hit',this,'hit');
	this.on('mario.jump',this,'jump');
	this.on('mario.destroy',this,'destroy');

	this.on("bump.bottom", function(collision) {
		if(collision.obj.p.type==Q.SPRITE_ENEMY){
			/*console.log('enemigo muerto');
	  		//collision.obj.destroy();
			this.p.vy = -500;
			this.p.jump = true;*/
			collision.obj.trigger('enemy.die');
		}
	});
    },
    step: function(dt) {
    	if(this.p.y>600){
    		console.log('me he caido');
    		this.p.y=380;
    		this.p.x=150;
    	}
    	if(this.p.vx>0){    		
    		this.p.direction = 'right';
    	}else if(this.p.vx<0){
    		this.p.direction = 'left';
    	}

    	if(!this.p.dead && !this.p.win){
    		if(this.p.vx==0 && this.p.vy==0 && !this.p.ignoreControls){
    			this.play('stay_'+this.p.direction);
    		} else if(this.p.landed > 0 && !this.p.ignoreControls) {
    			console.log('landed');
				if(Q.inputs['fire']) {
					this.p.speed = 300;
					this.play("run_" + this.p.direction);
				} else {
					this.p.speed = 200;
					this.play("walk_" + this.p.direction);
				}
			} else if((this.p.landed < 0 && !this.p.ignoreControls) || this.p.jump) {
				console.log(this.p.jump);
				this.play("jump_" + this.p.direction);
				this.p.jump=false;				
			}
			if(Q.inputs['up'] && this.jump && this.p.landed > 0) {
					Q.audio.play('jump_small', {loop:false});
					console.log('sonido jump');
				}
    	}else if(this.p.dead){
    		this.play('dead_right');
    	}
	    
    },
    win: function(){
		Q.stageScene("endGame",1, { label: "You Win!" });
    },
    die: function(){
    	this.p.dead=true;
    	this.del('2d, platformerControls');
    	Q.audio.play('music_die', {loop:false});
    
    	this.animate({ x: this.p.x, y: this.p.y-50, angle: 0 }, 0.25, Q.Easing.Linear);
    	this.animate({ x: this.p.x, y: this.p.y+100, angle: 0 }, 2.5, Q.Easing.Quadratic.In,{delay: 0.5});
		Q.stageScene("endGame",1, { label: "You Lose!" });
    },
    hit: function(){

    },
    jump: function(){
    	this.p.vy = -600;
		this.p.jump = true;
    }
  });

Q.MovingSprite.extend('Enemy',{
	init: function(p, defaults){
		this._super(p, defaults);
		this.add('2d, animation, aiBounce');

		this.on('bump.top',this,function(collision){
			if(collision.obj.isA("Mario")){
				Q.audio.play('squish_enemy',{loop:false});
				this.p.vx=this.p.vy=0;
			  	this.play('crushed',5);
			}
		});
		
		this.on("bump.left,bump.right,bump.bottom", function(collision) {
			if(collision.obj.isA("Mario")){
			  	collision.obj.trigger('mario.die');
			}
		});

		this.on("bump.top", function(collision){
			if(collision.obj.isA("Mario")){
			  	collision.obj.trigger("mario.jump");
			}
		});

		this.on('destroy',this,'destroy');
		//this.on('hit.sprite',this,'hit');
	},
	step: function(dt){
		if(this.p.dead){
			this.del('2d, aiBounce');
		}
		this._super(dt);
	}
})

Q.Enemy.extend("Goomba", {
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
    },
    step: function(dt) { 
    	this._super(dt);
	  	//Animations
	  	if(this.p.vx != 0) {
	  		this.play("walk");
	  	} else {
	  		//this.play("stand");
	  	}
    },
	/*stomp: function(collision){
		if(collision.obj.isA("Mario")){
			//Q.stageScene("initialMenu");

			collision.obj.vy-=300;
			collision.obj.jump=true;
			this.p.vx=this.p.vy=0;
			this.del('aiBounce');
		  	this.play('crushed',5);
		}
	},
	side: function(collision){
		if(collision.obj.isA("Mario")){
			collision.obj.destroy();
		}
	}*/
});


Q.Enemy.extend("Bloopa", {
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

		/*this.on("bump.left,bump.right,bump.bottom", function(collision) {
			if(collision.obj.isA("Mario")){
				collision.obj.destroy();
				Q.stageScene("initialMenu"); 
				
			}
		});*/

		this.on("bloopa.jump", this, "jump");
	},

	step: function(dt) {
		this._super(dt);
		//when step into the floor, stop the X movement
		

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
	    // Increment the coins.
	    if(!this.p.pickedUp)
	    {
	    	this.p.pickedUp = true;
	    	//Q.state.inc("coins", 1);	    
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

















  ////////// Load TMX level //////////
Q.scene("level1", function(stage) {
	Q.audio.stop();
	Q.stageTMX("level.tmx", stage);

	var mario = stage.insert(new Q.Mario());

	stage.add("viewport").follow(mario,{ x: true, y: false });
	stage.add("viewport").centerOn(150, 380);

	//stage.insert(new Q.Goomba({x:800}));
	stage.insert(new Q.Bloopa({x:600}));
	stage.insert(new Q.Princess({x:400}));
	stage.insert(new Q.Coin({x:800,y:380}));

	//Q.audio.play('main', { loop: true });


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
		Q.clearStages();
		Q.stageScene('level1');
	})

	/*if(Q.touch(this.type,'mainTitle')){
		Q.clearStages();
		Q.stageScene('level1');
	};*/


	/*var button = container.insert(new Q.UI.Button({ 
		x: 0, 
		y: 0, 
		fill: "#CCCCCC",
		label: "Play" })) 

	button.on("click",function() {
		Q.clearStages();
		Q.stageScene('level1');
	})*/

	container.fit(15,25);
});




  var jsonFiles = ['mario_small.json','goomba.json'];
  var pngFiles = ['mario_small.png','goomba.png'];

  Q.loadTMX("level.tmx, coin.png, coin.json, mainTitle.png, princess.json, princess.png, bloopa.json, bloopa.png, mario_small.png, mario_small.json, goomba.png, goomba.json", function() {
	Q.compileSheets("mario_small.png", "mario_small.json");
    Q.compileSheets("goomba.png", "goomba.json");
    Q.compileSheets("bloopa.png", "bloopa.json");
    Q.compileSheets("princess.png", "princess.json");
	Q.compileSheets("coin.png","coin.json");


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
  		crushed: {frames:[2], rate:0.3, loop:false, trigger: 'destroy'},
  		die: {frames:[3], rate:0.3, loop:false, trigger: 'destroy'}
  	});

  	Q.animations('bloopa',{
  		stand: { frames: [0], rate: 1 },
		jump: { frames: [1], rate: 0.3, loop: false, trigger: "bloopa.jump" },
		crushed: { frames: [2], rate: 0.3, loop: false, trigger: "destroy"}
  	});

  	Q.animations("coin", {
		shine: { frames: [0,1,2,1], rate: 1/3 }
	});

  	Q.load({
          'main': 'music_main.ogg',
          'kill_enemy': 'kill_enemy.ogg',
          'squish_enemy': 'squish_enemy.ogg',
          'music_die': 'music_die.ogg',
          'coin': 'coin.ogg',
          'jump_small': 'jump_small.ogg'
        },function() { Q.stageScene("initialMenu"); });	
  });

};