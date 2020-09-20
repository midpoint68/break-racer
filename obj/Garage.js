/*
Garage() returns a Garage object used to display and interact with the player's car settings.
*/
function Garage(){
  this.color1 = -1;
  this.color2 = -1;
  this.isSolid = true;
  this.sceneBtns = new list();
  this.homeBtn = new Button(9, 3, "HOME", function(){game.goHome(true);});
  //this.isSolidBtn = new Button(9, 3, "")
  this.sceneBtns.addLast(this.homeBtn);
  
  this.call = function(){
    game.play.call();
    game.title(h/2 - 24*(pixSize/scale));
    this.homeBtn.show(w/2 + 14*(pixSize/scale), h/2 - 21*(pixSize/scale));
    
    game.ctx.lineWidth = 2;
    for(let i = 0; i < 36; i++){
      let x = w/2 - 24*(pixSize/scale) + i*((pixSize/scale));
      let y1 = h/2 - 21*(pixSize/scale);
      let y2 = h/2 - 19*(pixSize/scale);
      game.ctx.fillStyle = "hsl("+(i*10)+","+100+"%,"+50+"%)";
      game.ctx.fillRect(x, y1, (pixSize/scale), (pixSize/scale));
      if(inBox(game.mouseX, game.mouseY, x, y1, (pixSize/scale), (pixSize/scale))){
        game.ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
        game.ctx.strokeRect(x, y1, (pixSize/scale), (pixSize/scale));
        if(game.mousePress){
          this.color1 = i;
          this.paintCar();
        }
      }
      game.ctx.fillStyle = "hsl(0,0%,"+parseInt(i*100/36)+"%)";
      game.ctx.fillRect(x, y2, (pixSize/scale), (pixSize/scale));
      if(inBox(game.mouseX, game.mouseY, x, y2, (pixSize/scale), (pixSize/scale))){
        game.ctx.strokeStyle = "rgba(255, 0, 0, 1.0)";
        game.ctx.strokeRect(x, y2, (pixSize/scale), (pixSize/scale));
        if(game.mousePress){
          this.color2 = i;
          this.paintCar();
        }
      }
    }
    if(this.color1 != -1){
      game.ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
      game.ctx.strokeRect(w/2 - 24*(pixSize/scale) + this.color1*((pixSize/scale)), h/2 - 21*(pixSize/scale), (pixSize/scale), (pixSize/scale));
    }
    if(this.color2 != -1){
      game.ctx.strokeStyle = "rgba(255, 0, 0, 1.0)";
      game.ctx.strokeRect(w/2 - 24*(pixSize/scale) + this.color2*((pixSize/scale)), h/2 - 19*(pixSize/scale), (pixSize/scale), (pixSize/scale));
    }
  };
  
  this.mousePressed = function(){
    btnCheck(this.sceneBtns, true);
  };
  
  this.mouseReleased = function(){
    
  };
  
  this.mouseMoved = function(){
    btnCheck(this.sceneBtns);
  };
  
  this.keyPressed = function(e){
    if(e.key == 's' || e.key == 'S'){
      this.isSolid = !this.isSolid;
      alert("Transparent walls "+(this.isSolid ? "deactivated." : "activated."));
    }
  };
  
  this.paintCar = function(){
    let c1 = this.color1, c2 = this.color2;
    if(c1 == -1) c1 = new Color(255, 50, 50, 1.0);
    else c1 = new Color(c1*10, 100, 50);
    if(c2 == -1) c2 = new Color(100, 100, 100, 1.0);
    else c2 = new Color(0, 0, parseInt(c2*100/36));
    game.car.paint(c1, c2);
  };
  
  this.getColor1 = function(){
    let c1 = this.color1;
    if(c1 == -1) c1 = new Color(255, 50, 50, 1.0);
    else c1 = new Color(c1*10, 100, 50);
    return c1.getColor();
  };
  
  this.getColor2 = function(){
    let c2 = this.color2;
    if(c2 == -1) c2 = new Color(100, 100, 100, 1.0);
    else c2 = new Color(0, 0, parseInt(c2*100/36));
    return c2.getColor();
  };
}
