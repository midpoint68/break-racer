var debugRect;
var debugCarRect;

function Play(){
  this.pause = false;
  this.endScreen = false;
  this.pauseBtns = new list();
  this.homeBtn = new Button(9, 3, "HOME", function(){game.goHome();});
  this.pauseBtns.addLast(this.homeBtn);
  this.raceTime = 0;
  this.timer = 3;
  this.finished = false;

  this.call = function(){
    let inRace = game.map.checkpoint!==undefined && game.map.checkpoint!==null;
    game.cam.x = game.car.pos.x;
    game.cam.y = game.car.pos.y;
    game.ctx.save();
    //game.ctx.scale(game.car.camScale, game.car.camScale);
    game.ctx.translate(game.car.camOffset.x*scale, game.car.camOffset.y*scale);
    game.ctx.save();
    game.ctx.translate(game.canvas.width/2 - game.cam.x*scale, game.canvas.height/2 - game.cam.y*scale);
    //only update game objects if the game is not paused:
    if(!this.pause && this.timer <= 0){
      let time = game.dt;
      if(time < 0.25){//Don't update if the time since the last frame is greater than 0.25 seconds (this means the window probably wasn't in focus)
        if((!this.endScreen) && (!this.finished) && inRace){ //Make sure the car is on a track and not an open play or dessimated
          let tick = 0.0035;//time per tick
          let extra = time%tick;
          let numUpdates = Math.floor(time/tick)+1;
          if(numUpdates > 20) console.log(numUpdates);
          let lastRect = game.car.lastRect;
          let rect = game.car.getRect();
          if(lastRect === undefined) lastRect = rect;
          for(let i = 1; i <= numUpdates; i++){
            //Move the car hitbox with respect to the time that has passed since last frame:
            let currentRect = lerpRect(lastRect, rect, (i/numUpdates));
            //Check for checkpoint hits:
            if(game.map.crossedTheLine(currentRect)){
              game.map.lap++;
              if(game.map.lap > game.map.data.numLaps) this.finished = true;
            }
            //Check for struct hits:
            let structHit = game.map.collisionCheck(currentRect);
            if(structHit !== null){
              game.car.crashed(structHit.getRect());
              game.car.pos = lerp(game.car.pos, game.car.lastPos, (i/numUpdates));
              break;
            }
          }
          if(game.mouseX !== undefined && game.mouseY !== null) this.raceTime+=time;
        }
        game.car.update(time);
        game.map.update(time);
      }
    }
    //Game Display:
    game.map.show();
    game.car.showTireMarks();
    /*if(debugRect!==undefined){
      game.ctx.strokeStyle = "purple";
      game.ctx.lineWidth = 5;
      rect(scaleRect(debugRect));
      rect(scaleRect(debugCarRect));
    }*/
    game.ctx.restore(); //Restore the context before showing the car so there is no 'double translation jitter' with the car display. (The car is always centered on the screen)
    game.car.show();
    game.ctx.restore(); // Restore the default ctx
    //Render finish screen:
    if(this.finished){
      this.finish();
    }
    //Render endScreen:
    if(this.endScreen){
      this.end();
    }
    //Render pause tint:
    if(this.pause){
      this.pauseGame();
      this.homeBtn.show(game.canvas.width - (pixSize/scale)*10, (pixSize/scale));
    }
    if(inRace){
      //Show current race time:
      if(this.pause) game.ctx.fillStyle = game.garage.getColor1(); //Make the text lighter while in the pause screen so it is visible
      else game.ctx.fillStyle = 'rgba(50, 50, 50, 1.0)';
      game.ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
      game.ctx.lineWidth = 1;
      game.ctx.font = ""+Math.floor(18/scale)+"px Arial";
      game.ctx.strokeText(this.getRaceTime(), 6*pixSize/scale, 3*pixSize/scale);
      game.ctx.fillText(this.getRaceTime(), 6*pixSize/scale, 3*pixSize/scale);

      //Render the countdown:
      if(this.timer > 0) this.countdown(game.dt);
    }
  };
  
  this.countdown = function(dt){
    game.ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
    game.ctx.fillRect(0, 0, w, h);
    game.ctx.fillStyle = game.garage.getColor1();
    game.ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
    game.ctx.lineWidth = 1;
    game.ctx.font = ""+Math.floor(50/scale)+"px Arial";
    let time = Math.floor(this.timer*100)/100;
    game.ctx.fillText(time, w/2 - 55/scale, h/4);
    game.ctx.strokeText(time, w/2 - 55/scale, h/4);
    this.timer -= dt;
  };
  
  this.pauseGame = function(){
    let x = 0;
    let y = 0;
    game.ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    game.ctx.fillRect(x, y, w, h);
    game.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    game.ctx.fillRect(x+(pixSize/scale), y+(pixSize/scale), (pixSize/scale), 3*(pixSize/scale));
    game.ctx.fillRect(x+3*(pixSize/scale), y+(pixSize/scale), (pixSize/scale), 3*(pixSize/scale));
  };
  
  this.end = function(){
    let x = 0;
    let y = 0;
    game.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    game.ctx.fillRect(x, y, w, h);
    game.ctx.save();
    game.ctx.translate(w/4, 3*h/8);
    game.ctx.fillRect(0, 0, w/2, h/4);
    game.ctx.fillStyle = game.garage.getColor1();
    game.ctx.font = ""+Math.floor(24/scale)+"px Arial";
    game.ctx.fillText("Your vehicle has been dessimated.", 40/scale, 40/scale);
    game.ctx.fillText("Congratulations.", 40/scale, 80/scale);
    game.ctx.font = ""+Math.floor(18/scale)+"px Arial";
    game.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    game.ctx.fillText("Press ENTER to restart.", 40/scale, 150/scale);
    game.ctx.restore();
  };
  
  this.finish = function(){
    let x = 0, y = 0;
    game.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    game.ctx.fillRect(x, y, w, h);
    //Finish Panel:
    game.ctx.save();
    game.ctx.translate(w/4, h/4);
    game.ctx.fillRect(0, 0, w/2, h/2);
    game.ctx.fillStyle = game.garage.getColor1();
    game.ctx.font = ""+Math.floor(32/scale)+"px Arial";
    game.ctx.fillText("FINISH!", 5/scale, 32/scale);
    game.ctx.fillRect(5/scale, 36/scale, w/2 - 10/scale, 5/scale);
    //Game stats:
    game.ctx.font = ""+Math.floor(24/scale)+"px Arial";
    game.ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    game.ctx.fillRect(155/scale, h/8, 5/scale, h/4);
    game.ctx.fillText("TIME", 5/scale, h/8 + 20/scale);
    game.ctx.fillText(this.getRaceTime(), 165/scale, h/8 + 20/scale);
    game.ctx.font = ""+Math.floor(18/scale)+"px Arial";
    game.ctx.fillText("Press ENTER to return home.", 5/scale, h/2 - 10/scale);
    game.ctx.restore();
  };
  
  this.getRaceTime = function(){
    let milis = Math.floor(this.raceTime*1000)%1000;
    let seconds = Math.floor(this.raceTime)%60;
    let min = Math.floor(this.raceTime/60)%60;
    let hours = Math.floor(min/3600);
    return "" + hours + " : " + min + " : " + seconds + "." + milis;
  };
  
  this.mousePressed = function(){
    if(this.pause) btnCheck(this.pauseBtns, true);
  };
  
  this.mouseReleased = function(){
    
  };
  
  this.mouseMoved = function(){
    if(this.pause) btnCheck(this.pauseBtns);
  };
  
  this.keyPressed = function(e){
    //check for game pause request from user:
    if((e.key == 'p' || e.key == 'P')){
      this.pause = !this.pause;
    }
    else if(e.keyCode == 13 && (this.endScreen || this.finished)) game.goHome();
  };
}