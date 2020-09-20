function Track(mapData){
  this.data = mapData;
  this.wall = new Array(this.data.wall.length);
  this.checkpoint = new Array(this.data.checkpoint.length);
  this.numChecks = 0;
  this.numWalls = 0;
  this.numLaps = this.data.numLaps;
  
  //load car:
  game.car.theta = this.data.spawnT;
  game.car.pos = new vec(this.data.spawnX, this.data.spawnY);
  
  //load startpoint:
  let offset = rotate(new vec(1, 0), game.car.theta);
  let sp = this.data.startpoint;
  let startPos = new vec(game.car.pos.x - (offset.x*scale*game.car.height/2), game.car.pos.y - (offset.y*scale*game.car.height/2));
  if(sp!==null && sp!==undefined) this.startpoint = new Structure(startPos.x, startPos.y, sp.theta, sp.type, sp.width, sp.height);
  else this.startpoint = new Structure(startPos.x, startPos.y, game.car.theta - Math.PI/2, "STARTPOINT", 32, 2); //Default startpoint
  
  //load checkpoints:
  let cp = this.data.checkpoint;
  for(let i = 0; i < cp.length; i++){
    if(cp[i] !== null && cp[i] !== undefined){
      this.checkpoint[i] = new Structure(cp[i].xPos, cp[i].yPos, cp[i].theta, cp[i].type, cp[i].width, cp[i].height, this.numChecks);
      this.numChecks++;
    }
  }
  
  //load walls:
  let wall = this.data.wall;
  for(let i = 0; i < wall.length; i++){
    if(wall[i] !== null && wall[i] !== undefined){
      this.wall[i] = new Structure(wall[i].xPos, wall[i].yPos, wall[i].theta, wall[i].type, wall[i].width, wall[i].height, this.numWalls);
      this.numWalls++;
    }
  }
  
  this.camPos = new vec(0, 0);
  this.sceneBtns = new list();
  this.homeBtn = new Button(11, 3, "HOME", function(){if(!game.track.saved && !confirm("The track is not saved. Are you sure you want to discard changes?")) return; jsonInput.style.display = "none";game.goHome();});
  this.saveBtn = new Button(11, 3, "SAVE", function(){game.track.saved = true;game.track.saveData();game.map.data = game.track.data;alert("Track Saved");});
  this.newBtn = new Button(11, 3, "NEW", function(){if(confirm("Are you sure? All track data will be lost.")){let data = {name:"Break Racer Track",numLaps:3,spawnX:0,spawnY:0,spawnT:(Math.PI/2),wall:new Array(10),checkpoint:new Array(1)}; game.track = new Track(data); game.switchScene(game.track);}});
  this.exportBtn = new Button(11, 3, "EXPORT", function(){let name = prompt("Enter track name:"); if(name!==null){game.track.data.name = name;game.track.saveBtn.funct();let jsonData = JSON.stringify(game.track.data);download(jsonData, ""+((name !=="") ? name : "Break Racer Track")+".json", 'text/plain');}});
  this.loadBtn = new Button(11, 3, "LOAD", function(){jsonInput.style.display = "block";game.track.notLoading = false;});
  this.lapsBtn = new Button(11, 3, "#laps: "+this.numLaps, function(){game.track.saved = false; game.track.numLaps++; if(game.track.numLaps > 10) game.track.numLaps = 1; this.text = "#laps: "+game.track.numLaps;});
  this.structBtn = new Button(13, 3, "wall", function(){game.track.addStruct();});
  this.checkpointBtn = new Button(13, 3, "checkpoint", function(){game.track.addCheckpoint();});
  this.addBtn = new DropDown(13, 3, "add", [this.structBtn, this.checkpointBtn]);
  this.sceneBtns.addLast(this.homeBtn); this.sceneBtns.addLast(this.saveBtn); this.sceneBtns.addLast(this.newBtn); this.sceneBtns.addLast(this.exportBtn); this.sceneBtns.addLast(this.lapsBtn);this.sceneBtns.addLast(this.addBtn);this.sceneBtns.addLast(this.loadBtn);
  this.selected = null;
  this.rotate = false;
  this.rotateHover = false;
  this.scale = false;
  this.scaleHover = null;
  this.scaleCorner = null;
  this.saved = true;
  this.notLoading = true;

  this.call = function(){
    game.sceneBtns = this.btns;
    let w = game.canvas.width, h = game.canvas.height;
    game.ctx.fillStyle = "rgba(230, 230, 230, 0.5)";
    game.ctx.fillRect(0, 0, 15*(pixSize/scale), 10*(pixSize/scale) + (this.addBtn.open ? 6*(pixSize/scale) : 0));
    game.ctx.fillRect(w - 13*(pixSize/scale), 0, 13*(pixSize/scale), 22*(pixSize/scale));
    this.homeBtn.show(w - 12*(pixSize/scale), (pixSize/scale));
    this.newBtn.show(w - 12*(pixSize/scale), 5*(pixSize/scale));
    this.saveBtn.show(w - 12*(pixSize/scale), 9*(pixSize/scale));
    this.exportBtn.show(w - 12*(pixSize/scale), 13*(pixSize/scale));
    this.loadBtn.show(w - 12*(pixSize/scale), 17*(pixSize/scale));
    this.lapsBtn.show((pixSize/scale), (pixSize/scale));
    this.addBtn.show((pixSize/scale), 5*(pixSize/scale));
    
    game.ctx.save();
    game.ctx.translate(this.camPos.x*scale, this.camPos.y*scale); //Make cam translation
    this.showStructures();
    this.showSelected();
    game.ctx.restore();
  };
  
  this.saveData = function(){
    //save walls:
    let wall = this.wall;
    let wallData = new Array(wall.length);
    for(let i = 0; i < wall.length; i++){
      let w = wall[i];
      if(w!== null && w!== undefined) wallData[i] = {xPos:w.pos.x, yPos:w.pos.y, theta:w.theta, type:w.type, width:w.pixelMap.length, height:w.pixelMap[0].length};
    }
    this.data.wall = wallData;
    //save checkpoints:
    let cp = this.checkpoint;
    let cpData = new Array(cp.length);
    for(let i = 0; i < cp.length; i++){
      let c = cp[i];
      if(c!== null && c!== undefined) cpData[i] = {xPos:c.pos.x, yPos:c.pos.y, theta:c.theta, type:c.type, width:c.pixelMap.length, height:c.pixelMap[0].length};
    }
    this.data.checkpoint = cpData;
    //save the rest of the stuff:
    let sp = this.startpoint;
    this.data.startpoint = {xPos:sp.pos.x, yPos:sp.pos.y, theta:sp.theta, type:sp.type, width:sp.pixelMap.length, height:sp.pixelMap[0].length};
    this.data.spawnX = game.car.pos.x;
    this.data.spawnY = game.car.pos.y;
    this.data.spawnT = game.car.theta;
    this.data.numLaps = this.numLaps;
  };
  
  this.worldMousePos = function(){
    if(game.mouseX !== undefined){
      return sub(mult(new vec(game.mouseX - (game.canvas.width/2), game.mouseY  - (game.canvas.height/2)), 1/scale), this.camPos);
    }else{
      return new vec(undefined, undefined);
    }
  };
  
  this.showStructures = function(){
    game.ctx.save();
    game.ctx.translate(game.canvas.width/2, game.canvas.height/2);
    //Show the startpoint:
    let offset = rotate(new vec(1, 0), game.car.theta);
    let startPos = new vec(game.car.pos.x - (offset.x*scale*game.car.height/2), game.car.pos.y - (offset.y*scale*game.car.height/2));
    this.startpoint.pos = startPos;
    this.startpoint.theta = game.car.theta - Math.PI/2;
    this.startpoint.show(true);
    //show the checkpoints:
    for(let i = 0; i < this.checkpoint.length; i++){
      let cp = this.checkpoint[i];
      if(cp !== undefined && cp !== null){
        cp.show();
      }
    }
    //show the walls:
    for(let i = 0; i < this.wall.length; i++){
      let wall = this.wall[i];
      if(wall !== undefined && wall !== null){
        this.wall[i].show();
      }
    }
    //show the car:
    game.car.staticShow();
    game.ctx.restore();
  };
  
  this.addStruct = function(struct){
    if(struct === undefined) this.wall[this.numWalls] = new Structure(-this.camPos.x, -this.camPos.y, 0, "SOLID_WALL", 20, 2, this.numWalls);
    else this.wall[this.numWalls] = struct;
    this.numWalls++;
    this.saved = false;
  };
  
  this.addCheckpoint = function(checkpoint){
    if(checkpoint === undefined) this.checkpoint[this.numChecks] = new Structure(-this.camPos.x, -this.camPos.y, 0, "CHECKPOINT", 20, 2, this.numChecks);
    else this.checkpoint[this.numChecks] = checkpoint;
    this.numChecks++;
    this.saved = false;
  };
  
  this.removeStruct = function(){
    let id = this.selected.id;
    if(this.selected.type === "SOLID_WALL"){
      let newWalls = new Array(this.wall.length - 1);
      this.numWalls = 0;
      for(let i = 0; i < this.wall.length; i++){
        if(this.wall[i] !== null && this.wall[i] !== undefined){
          if(i < id){
            newWalls[i] = this.wall[i];
            this.numWalls++;
          } else if(i > id){
            newWalls[i - 1] = this.wall[i];
            newWalls[i - 1].id = (i-1);
            this.numWalls++;
          }
        }
      }
      this.wall = newWalls;
    }else if(this.selected.type === "CHECKPOINT"){
      let newChecks = new Array(this.checkpoint.length - 1);
      this.numChecks = 0;
      for(let i = 0; i < this.checkpoint.length; i++){
        if(this.checkpoint[i] !== null && this.checkpoint[i] !== undefined){
          if(i < id){
            newChecks[i] = this.checkpoint[i];
            this.numChecks++;
          } else if(i > id){
            newChecks[i - 1] = this.checkpoint[i];
            newChecks[i - 1].id = (i-1);
            this.numChekcs++;
          }
        }
      }
      this.checkpoint = newChecks;
    }
    this.saved = false;
  };
  
  this.duplicateStruct = function(){
    let s = this.selected;
    this.addStruct(new Structure(-this.camPos.x, -this.camPos.y, s.theta, s.type, s.pixelMap.length, s.pixelMap[0].length, this.numWalls));
    this.saved = false;
  };
  
  this.showSelected = function(){
    game.ctx.save();
    game.ctx.translate(game.canvas.width/2, game.canvas.height/2);
    if(this.selected !== null){
      let r = scaleRect(this.selected.getRect());
      game.ctx.strokeStyle = "rgba(255, 255, 0, 1.0)";
      game.ctx.lineWidth = 2;
      rect(r);
      //Draw edit points:
      let rEdit = new Array(4);
      //Left Top:
      rEdit[0] = add(r[0], mult(add(unit(sub(r[0], r[3])), unit(sub(r[0], r[1]))), 5));
      rEdit[1] = add(r[1], mult(add(unit(sub(r[1], r[2])), unit(sub(r[1], r[0]))), 5));
      rEdit[2] = add(r[2], mult(add(unit(sub(r[2], r[1])), unit(sub(r[2], r[3]))), 5));
      rEdit[3] = add(r[3], mult(add(unit(sub(r[3], r[0])), unit(sub(r[3], r[2]))), 5));
      this.rotateHover = false;
      this.scaleHover = null;
      if(this.selected != this.startpoint){
        //Check Rotate Hover:
        let rotatePos = add(mult(add(rEdit[1], rEdit[2]), 0.5), mult(unit(sub(rEdit[1], rEdit[0])), 10));
        if(inCircle(mult(this.worldMousePos(), scale), rotatePos, 8)){
          game.ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
          this.rotateHover = true;
        }else{
          game.ctx.strokeStyle = "rgba(220, 220, 220, 1.0)";
        }
        //Draw Rotate icon:
        rotateIcon(rotatePos, this.selected.theta);
      }
      if(this.selected != game.car){
        //Check Scale Hover:
        for(let i = 0; i < 4; i++){
          let radius = 6;
          if(inCircle(mult(this.worldMousePos(), scale), rEdit[i], radius)){
            game.ctx.strokeStyle = "rgba(100, 100, 100, 1.0)";
            this.scaleHover = i;
          }else {
            game.ctx.strokeStyle = "rgba(220, 220, 220, 1.0)";
          }
          game.ctx.beginPath();
          ellipse(rEdit[i].x, rEdit[i].y, radius, radius);
          game.ctx.stroke();
        }
      }
    }
    game.ctx.restore();
  };
  
  this.setRotation = function(){
    let angle = getAngle(this.worldMousePos(), this.selected.pos);
    this.selected.theta = angle;
  };
  
  this.setScale = function(){
    let corn = rotate(this.selected.getRect()[this.scaleCorner], -this.selected.theta);
    let dist = sub(rotate(this.worldMousePos(), -this.selected.theta), corn);
    dist.x = dist.x * getSign(corn.x - rotate(this.selected.pos, -this.selected.theta).x);
    dist.y = dist.y * getSign(corn.y - rotate(this.selected.pos, -this.selected.theta).y);
    let w = constrain((this.selected.pixelMap.length + Math.floor(dist.x/10)), 1, 256);
    let h = constrain((this.selected.pixelMap[0].length + Math.floor(dist.y/10)), 1, 256);
    this.selected.resize(w, h);
  };
  
  this.select = function(){
    let worldMouse = this.worldMousePos();
    let carRect = game.car.getRect();
    if(inRect(worldMouse, carRect)){
      this.saved = false;
      return game.car;
    }
    let startRect = this.startpoint.getRect();
    if(inRect(worldMouse, startRect)){
      this.saved = false;
      return this.startpoint;
    }
    for(let i = 0; i < this.wall.length; i++){
      let w = this.wall[i];
      if(w!== undefined && w!==null){
        if(inRect(worldMouse, w.getRect())){
          this.saved = false;
          return w;
        }
      }
    }
    for(let i = 0; i < this.checkpoint.length; i++){
      let cp = this.checkpoint[i];
      if(cp !== undefined && cp !== null){
        if(inRect(worldMouse, cp.getRect())){
          this.saved = false;
          return cp;
        }
      }
    }
    return null;
  };
  
  this.resetValues = function(){
    this.selected = null;
    this.rotate = false;
    this.rotateHover = false;
    this.scale = false;
    this.scaleHover = null;
    this.scaleCorner = null;
  };
  
  this.mousePressed = function(){
    if(this.notLoading){
      btnCheck(this.sceneBtns, true);
      if(this.rotateHover){
        this.rotate = true
      } else if(this.scaleHover !== null){
        this.scale = true;
        this.scaleCorner = this.scaleHover;
      } else this.selected = this.select();
    }
  };
  
  this.mouseReleased = function(){
    game.canvas.style.cursor = "default";
    this.rotate = false;
    this.scale = false;
  };
  
  this.mouseMoved = function(){
    if(this.notLoading){
      btnCheck(this.sceneBtns);
      if(game.mousePress){
        if(this.selected === null){
          game.canvas.style.cursor = "all-scroll";
          this.camPos.x+=game.mXd/scale;
          this.camPos.y+=game.mYd/scale;
        }else if(this.rotate){
          this.setRotation();
        }else if(this.scale){
          this.setScale();
        }else{
          game.canvas.style.cursor = "grab";
          this.selected.pos = add(this.selected.pos, new vec(game.mXd/scale, game.mYd/scale));
        }
      }
    }
  };
  
  this.keyPressed = function(e){
    if(this.notLoading){
      if((e.key == 'd' || e.key == 'D') && this.selected != game.car && this.selected != this.startpoint && this.selected !== null && this.selected !== undefined){
        this.duplicateStruct();
      }
      if(e.key == 'w' || e.key == 'W'){
        this.addStruct();
      }
    }
  };
  
  this.keyDown = function(e){
    if(this.notLoading){
      if((e.keyCode == 8 || e.keyCode == 46) && this.selected != game.car && this.selected != this.startpoint && this.selected !== null && this.selected !== undefined){
        this.removeStruct();
        this.resetValues();
      }
    }
  };
}

/*
Download function to download .json track data
*/
function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function loadFile(){
  
  this.receivedText = function(e) {
    let lines = e.target.result;
    var newArr = JSON.parse(lines);
    game.track = new Track(newArr);
    game.scene = game.track;
    jsonInput.style.display = "none";
    game.track.notLoading = true;
    game.track.saveData();
    game.map.data = game.track.data;
  };
  
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
    alert("Couldn't find the fileinput element.");
  }
  else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  }
  else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }
}

/*
rect() draws a strokeRect based on the given hitbox.
*/
function rect(r){
  game.ctx.beginPath();
  game.ctx.moveTo(r[0].x, r[0].y);
  game.ctx.lineTo(r[1].x, r[1].y);
  game.ctx.lineTo(r[2].x, r[2].y);
  game.ctx.lineTo(r[3].x, r[3].y);
  game.ctx.lineTo(r[0].x, r[0].y);
  game.ctx.stroke();
}

/*
ellipse() draws an ellipse at the specified location with given dimensions
*/
function ellipse(x, y, w, h){
  let ctx = game.ctx;
  ctx.moveTo(x+w, y);
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI*2);
}

/*
rotateIcon() draws a rotate icon centered at the given position
*/
function rotateIcon(pos, angle){
  game.ctx.save();
  game.ctx.translate(pos.x, pos.y);
  game.ctx.rotate(angle);
  game.ctx.beginPath();
  game.ctx.moveTo(-4, -8);
  game.ctx.ellipse(-9, 0, 10, 8, 0, -Math.PI/3, Math.PI/3);
  game.ctx.stroke();
  game.ctx.beginPath();
  game.ctx.moveTo(-4, -4);
  game.ctx.lineTo(-4, -8);
  game.ctx.lineTo(0, -8);
  game.ctx.stroke();
  game.ctx.beginPath();
  game.ctx.moveTo(-4, 4);
  game.ctx.lineTo(-4, 8);
  game.ctx.lineTo(0, 8);
  game.ctx.stroke();
  game.ctx.restore();
}
