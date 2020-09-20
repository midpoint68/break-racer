function MainMenu(){
  this.sceneBtns = new list();
  this.playBtn = new Button(15, 3, "PLAY", function(){game.play = new Play();game.switchScene(game.play);game.car.reload();game.map.load();});
  this.garageBtn = new Button(15, 3, "GARAGE", function(){game.switchScene(game.garage);});
  this.trackBtn = new Button(15, 3, "TRACK", function(){game.car.center();game.track = new Track(game.map.data);game.switchScene(game.track);});
  this.sceneBtns.addLast(this.playBtn);this.sceneBtns.addLast(this.garageBtn);this.sceneBtns.addLast(this.trackBtn);
  
  this.call = function(){
    game.play.call();
    
    this.playBtn.show(w/2 - 24*(pixSize/scale), h/2 - 20*(pixSize/scale));
    this.garageBtn.show(w/2 - 24*(pixSize/scale), h/2 - 15*(pixSize/scale));
    this.trackBtn.show(w/2 - 24*(pixSize/scale), h/2 - 10*(pixSize/scale));
    game.ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    game.ctx.fillRect(0,0, w, h);
    game.title(h/2 - 24*(pixSize/scale));
  };
  
  this.mousePressed = function(){
    btnCheck(this.sceneBtns, true);
  };
  
  this.mouseReleased = function(){
    
  };
  
  this.mouseMoved = function(){
    btnCheck(this.sceneBtns);
  };
  
  this.keyPressed = function(){
    
  };
}