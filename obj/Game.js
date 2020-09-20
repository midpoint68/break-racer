//GLOBAL VARIABLES:
var SH = 750; // The standard height used to develop the game, used to scale objects and text accordingly
var pixSize = 10; // The standaard pixel size to scale accordingly
var scale = 1; //Default scale;
var w, h; //Canvas width and height

function Game(canvas, ctx, carType){
  //Animation and control variables:
  this.canvas = canvas;
  this.ctx = ctx;
  this.dt;
  this.now;
  this.lastFrameTime;
  this.mousePress = false;
  this.mouseButton;
  this.mouseX;
  this.mouseY;
  this.mXd;
  this.mYd;
  //Scenes:
  this.play = new Play();
  this.menu = new MainMenu();
  this.garage = new Garage(); //Garage is defined once to stay constant
  this.track;
  this.scene = this.menu;
  //Objects:
  this.car;
  if(carType === 'classic'){
    this.car = ClassicCar(0, 0, Math.PI/2);
  }
  this.cam = new vec(this.car.pos.x, this.car.pos.y);
  this.map;
  
  this.draw = function(){
    //Calc last animFrameTime:
    this.now = performance.now();
    if(this.dt === undefined){
      this.dt = 0.0;
      this.lastFrameTime = this.now;
    } else {
      this.dt = (this.now - this.lastFrameTime)/1000;
      this.lastFrameTime = this.now;
    }
    //Re-render canvas:
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    scale = SH/this.canvas.height;
    w = this.canvas.width;
    h = this.canvas.height;
    
    this.scene.call();
  };
  
  this.goHome = function(seamless){
    this.switchScene(this.menu);
    this.play = new Play();
    this.map.clear();
    if(!seamless) this.car.reload();
  };
  
  this.title = function(y){
    
    let color = this.garage.getColor1();
    this.ctx.fillStyle = color;
    this.ctx.fillRect(w/2 - 24*(pixSize/scale), y, 48*(pixSize/scale), 2*(pixSize/scale));
    this.ctx.font = ""+parseInt(4*(pixSize/scale))+"px Arial";
    this.ctx.fillStyle= 'rgba(0, 0, 0, 1.0)';
    this.ctx.fillText("BREAK RACER", w/2 - 24.32*(pixSize/scale), y - 0.25*(pixSize/scale));
    this.ctx.fillStyle = color;
    this.ctx.fillRect(w/2 + 5*(pixSize/scale), y-2*(pixSize/scale), 11*(pixSize/scale), 0.6*(pixSize/scale));
    this.ctx.fillStyle = game.garage.getColor2();
    this.ctx.fillRect(w/2 + 5*(pixSize/scale), y-2.85*(pixSize/scale), 4*(pixSize/scale), 0.45*(pixSize/scale));
    this.ctx.fillRect(w/2 + 5*(pixSize/scale), y-1*(pixSize/scale), 16*(pixSize/scale), 0.75*(pixSize/scale));
  };
  
  /*
  mouseGamePos() returns the mouse position in the game.
  */
  this.mouseGamePos = function(){
    if(this.mouseX !== undefined){
      return new vec(this.mouseX + this.cam.x - (this.canvas.width/2) - this.car.camOffset.x, this.mouseY + this.cam.y - (this.canvas.height/2) - this.car.camOffset.y);
    }else{
      return new vec(undefined, undefined);
    }
  };
  
  this.loadMap = function(map){
    this.map = map;
  };
  
  this.getDefaultMap = function(name, mapObj){
    let map = null;
    if(name === 'classic'){
      map = new GameMap();
      map.setData(getDefaultMap());
    }else if(name === 'empty'){
      map = new GameMap();
    }else if(name === 'fromFile'){
      map = new GameMap();
      map.setData(mapObj);
    }
    return map;
  };
  
  this.switchScene = function(scn){
    this.scene = scn;
    if(this.scene.sceneBtns !== null && this.scene.sceneBtns !== undefined){
      btnCheck(this.scene.sceneBtns);
    }
  };
}

function mousePressed(e){
  game.mousePress = true;
  game.mouseButton = e.button;
  game.mouseX = e.clientX;
  game.mouseY = e.clientY;
  game.scene.mousePressed();
  
}

function mouseReleased(e){
  game.mousePress = false;
  game.scene.mouseReleased();
}

function mouseMoved(e){
  if(game.mouseX!==undefined){
    game.mXd = e.clientX-game.mouseX;
    game.mYd = e.clientY-game.mouseY;
  }
  game.mouseX = e.clientX;
  game.mouseY = e.clientY;
  game.scene.mouseMoved();
}

function keyPressed(e){
  game.scene.keyPressed(e);
}

function keyDown(e){
  if(game.scene == game.track) game.track.keyDown(e);
}

function Button(w, h, text, funct){
  this.h = h;
  this.w = w;
  this.x;
  this.y;
  this.text = text;
  this.funct = funct;
  this.hover = false;
  
  this.show = function(x, y){
    this.x = x;
    this.y = y;
    if(this.hover){
      game.ctx.strokeStyle = game.garage.getColor1();
      game.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      game.ctx.lineWidth = (pixSize/scale)/2;
    }
    else{
      game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.0)';
      game.ctx.fillStyle = 'rgba(100, 100, 100, 1.0)';
      (pixSize/scale)/8;
    }
    game.ctx.strokeRect(x, y, this.w*(pixSize/scale), this.h*(pixSize/scale));
    game.ctx.font = ""+parseInt(h*0.8*(pixSize/scale))+"px Arial";
    game.ctx.fillText(this.text, x+0.8*(pixSize/scale), y + this.h*0.8*(pixSize/scale));
  };

  this.check = function(mX, mY, pressed){
    if(this.x !== undefined){
      if(inBox(mX, mY, this.x, this.y, this.w*(pixSize/scale), this.h*(pixSize/scale))){
        if(pressed){
          this.funct();
          mouseReleased();
        }
        this.hover = true;
      }else this.hover = false;
    }
  };
}

function DropDown(w, h, text, btns){
  this.btns = btns;
  this.h = h;
  this.w = w;
  this.x = 0;
  this.y = 0;
  this.text = text;
  this.hover = false;
  this.open = false;
  
  this.funct = function(){
    this.open = !this.open;
  };
  
  this.show = function(x, y){
    this.x = x;
    this.y = y;
    if(this.hover){
      game.ctx.strokeStyle = game.garage.getColor1();
      game.ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      game.ctx.lineWidth = (pixSize/scale)/2;
    }
    else{
      game.ctx.strokeStyle = 'rgba(0, 0, 0, 0.0)';
      game.ctx.fillStyle = 'rgba(100, 100, 100, 1.0)';
      (pixSize/scale)/8;
    }
    if(this.open) game.ctx.strokeRect(x, y, this.w*(pixSize/scale), this.h*(this.btns.length + 1)*(pixSize/scale));
    else game.ctx.strokeRect(x, y, this.w*(pixSize/scale), this.h*(pixSize/scale));
    game.ctx.font = ""+parseInt(h*0.8*(pixSize/scale))+"px Arial";
    game.ctx.fillText(this.text, x+0.8*(pixSize/scale), y + this.h*0.8*(pixSize/scale));
    
    if(this.open){
      for(let i = 0; i < this.btns.length; i++){
        this.btns[i].show(x, y+(this.h*(i+1)*(pixSize/scale)));
      }
    }
  };
  
  this.check = function(mX, mY, pressed){
    let height = (this.open ? this.h*(this.btns.length+1) : this.h);
    if(inBox(mX, mY, this.x, this.y, this.w*(pixSize/scale), height*(pixSize/scale))){
      if(pressed){
        this.funct();
        mouseReleased();
      }
      this.hover = true;
    }else{
      this.hover = false;
      this.open = false;
    }
    
    for(let i = 0; i < this.btns.length; i++){
      this.btns[i].check(mX, mY, pressed);
    }
  };
}

function btnCheck(btns, click){
  if(click == undefined) click = false;
  if(btns !== null){
    let current = btns.head;
    do{
      current.elem.check(game.mouseX, game.mouseY, click);
      current = current.nxt;
    }while(current !== null && current !== undefined);
  }
}