//vec() returns a 2D vector dictionary.
function vec(x, y){
  return {x:x, y:y};
}

//veclone() returns a cloned vector
function veclone(v){
  return new vec(v.x, v.y);
}

//magnitude() returns the magnitude of the vector, v.
function magnitude(v){
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

//unit() returns the unit vector
function unit(v){
  let mag = magnitude(v);
  return new vec(v.x/mag, v.y/mag);
}

//rotate() returns a vector, p, rotated clockwise by angle, a.
function rotate(p, a){
  let x = p.x*Math.cos(a) - p.y*Math.sin(a);
  let y = p.x*Math.sin(a) + p.y*Math.cos(a);
  return new vec(x, y);
}

//getAngle() returns the angle from 0 that v is pointing with center at c
function getAngle(v, c){
  let v1 = sub(v, c);
  var angle;
  if(v1.x == 0){
    angle = (v1.y > 0 ? (Math.PI/2) : (3*Math.PI/2));
  }else{
    angle = Math.atan(v1.y/v1.x) + (v.x < c.x ? Math.PI : 0);
  }
  if(angle < 0) angle += (Math.PI*2);
  return angle;
}

//addAngle() adds two angles and returns within the range (0, Math.PI*2)
function addAngle(a1, a2){
  let angle = a1+a2;
  while(angle < 0) angle+=(Math.PI*2);
  return (angle)%(Math.PI*2);
}

//add() returns the addition of the two given vectors.
function add(v1, v2){
  return new vec(v1.x+v2.x, v1.y+v2.y);
}

//neg() returns the negation of the given vector.
function neg(v){
  return new vec(-v.x, -v.y);
}

//sub() returns the result of subtracting v2 from v1
function sub(v1, v2){
  return new vec(v1.x - v2.x, v1.y - v2.y);
}

//mult() returns the result of multiplying v by constant a
function mult(v, a){
  return new vec(v.x*a, v.y*a);
}

//lerp() lerps between the points
function lerp(v1, v2, t){
  return add(v1, mult(sub(v2, v1), t));
}

//getRectCenter() returns the center of the rect
function getRectCenter(r){
  return add(r[0], add(mult(sub(r[1], r[0]), 0.5), mult(sub(r[3], r[0]), 0.5)));
}

//scaleRect() returns the scaled rect hitbox
function scaleRect(r){
  let scaled = new Array(4);
  for(let i = 0; i < 4; i++) scaled[i] = mult(r[i], scale);
  return scaled;
}

//lerpRect() returns a rect in between the two given rects
function lerpRect(r1, r2, t){
  let r = new Array(4);
  for(let i = 0; i < 4; i++){
    r[i] = add(r1[i], mult(sub(r2[i], r1[i]), t));
  }
  return r;
}

//getSign() returns the sign of the number
function getSign(a){
  return (a/Math.abs(a));
}

//constrain() keeps the value within the specified range
function constrain(val, low, high){
  if(val < low) return low;
  if(val > high) return high;
  return val;
}

//constrainMag() keeps the magnitude of the vec below the specified value
function constrainMag(vec, val){
  if(magnitude(vec) <= val) return vec;
  else return mult(unit(vec), val);
}

//list() is a singley-linked list object.
function list(){
  this.head;
  this.tail;
  this.count = 0;
  this.addLast = function(elem){
    let node = new listNode(elem);
    if(this.tail === undefined || this.head === undefined){
      this.head = node;
      this.tail = node;
    }else{
      this.tail.nxt = node;
      this.tail = node;
    }
    this.count++;
  };
  this.addFirst = function(elem){
    let node = new listNode(elem);
    if(this.tail === undefined || this.head === undefined){
      this.head = node;
      this.tail = node;
    }else{
      node.nxt = this.head;
      this.head = node;
    }
    this.count++;
  };
  this.remove = function(){
    if(this.head !== undefined && this.head !== null){
      if(this.head == this.tail){
        this.tail = undefined;
      }
      this.head = this.head.nxt;
      this.count--;
    }
  };
}

function listNode(elem){
  this.nxt;
  this.elem = elem;
}

/*
checklistMap is an object used to store data about the Structure pixelMap that is
being fragment checked by Structure.clean(). The goal of checklistMap is to provide a 'checklist'
for the map so when the map is being recursively traversed through, it can remove the visited
values from its checklistMap. Hence, when it is done traversing, we are left with a map of the
fragment of the structure.
*/
function checklistMap(map){
  this.width = map.length;
  this.height = map[0].length;
  this.visit = new Array(this.width*this.height);
  this.count = 0;
  this.values = new Array(this.width);
  for(let i = 0; i < this.width; i++){
    this.values[i] = new Array(this.height);
    for(let j = 0; j < this.height; j++){
      if(map[i][j] !== undefined && map[i][j] !== null){
        this.values[i][j] = map[i][j].clone();
        this.count++;
      }else{
        this.values[i][j] = null;
      }
    }
  }
  
  this.visit = function(x, y){
    this.visit[x+(y*this.width)] = true;
  };
  
  this.visited = function(x, y){
    return this.visit[x + (y*this.width)];
  };
  
  this.remove = function(x, y){
    if(this.values[x][y] !== undefined && this.values[x][y] !== null){
      this.values[x][y] = null;
      this.count--;
    }
  };
  
  this.getMap = function(){
    return this.values;
  };
}

/*
Structure is an object that represents any structural object in the game with position, force values, and a map of the pixels in it
*/
function Structure(x, y, theta, map, width, height, id){
  this.id = id;
  this.pixelMap;
  if(map == 'SOLID_WALL'){
    this.type = map;
    this.pixelMap = new Array(width);
    for(let i = 0; i < width; i++){
      this.pixelMap[i] = new Array(height);
      for(let j = 0; j < height; j++){
        this.pixelMap[i][j] = new Pixel('black', this, 1.0);
      }
    }
  }else if(map == 'CHECKPOINT'){
    this.type = map;
    this.pixelMap = new Array(width);
    for(let i = 0; i < width; i++){
      this.pixelMap[i] = new Array(height);
      for(let j = 0; j < height; j++){
        this.pixelMap[i][j] = new Pixel("rgba(200, 100, 100, 1.0)", this, 1.0);
      }
    }
  }else if(map == 'STARTPOINT'){
    this.type = map;
    this.pixelMap = new Array(width);
    for(let i = 0; i < width; i++){
      this.pixelMap[i] = new Array(height);
      for(let j = 0; j < height; j++){
        if((j+i)%2 == 0) this.pixelMap[i][j] = new Pixel("black", this, 1.0);
        else this.pixelMap[i][j] = new Pixel("white", this, 1.0);
      }
    }
  }else if(map === null){
    this.type = 'OTHER';
    this.pixelMap = new Array(width);
    for(let i = 0; i < width; i++){
      this.pixelMap[i] = new Array(height);
    }
  }else this.pixelMap= map;
  
  this.width = this.pixelMap.length*10;
  this.height = this.pixelMap[0].length*10;
  this.pos = new vec(x, y);
  this.theta = theta;
  this.vel = new vec(0, 0);
  this.accel = new vec(0, 0);
  
  /*
  Structure.setPixel() is used to place a pixel in a structure that will atomatically
  connect to its neighbors.
  */
  this.setPixel = function(x, y, pixel){
    if(Number.isInteger(x) && Number.isInteger(y)){
      this.pixelMap[x][y] = pixel;
      //left connection:
      if(x > 0){
        let adj = this.pixelMap[x-1][y];
        if(adj !== undefined && adj !== null){
          pixel.connect(1.0, adj, Connection.LEFT);
        }
      }
      //right connection:
      if(x < this.pixelMap.length - 1){
        let adj = this.pixelMap[x+1][y];
        if(adj !== undefined && adj !== null){
          pixel.connect(1.0, adj, Connection.RIGHT);
        }
      }
      //up connection:
      if(y > 0){
        let adj = this.pixelMap[x][y-1];
        if(adj !== undefined && adj !== null){
          pixel.connect(1.0, adj, Connection.UP);
        }
      }
      //down connection:
      if(y < this.pixelMap[0].length - 1){
        let adj = this.pixelMap[x][y+1];
        if(adj !== undefined && adj !== null){
          pixel.connect(1.0, adj, Connection.DOWN);
        }
      }
    }
  };
  
  /*
  Structure.breakPixel() breaks a random connection from the pixel.
  */
  this.breakPixel = function(x, y){
    let rand = parseInt(Math.random()*4);
    if(Number.isInteger(x) && Number.isInteger(y)){
      let pixel = this.pixelMap[x][y];
      //left connection:
      if(x > 0 && rand == 0){
        let adj = this.pixelMap[x-1][y];
        if(adj !== undefined && adj !== null){
          pixel.connection[Connection.LEFT] = null;
          adj.connection[Connection.RIGHT] = null;
        }
      }
      //right connection:
      if(x < this.pixelMap.length - 1 && rand == 1){
        let adj = this.pixelMap[x+1][y];
        if(adj !== undefined && adj !== null){
          pixel.connection[Connection.RIGHT] = null;
          adj.connection[Connection.LEFT] = null;
        }
      }
      //up connection:
      if(y > 0 && rand == 2){
        let adj = this.pixelMap[x][y-1];
        if(adj !== undefined && adj !== null){
          pixel.connection[Connection.UP] = null;
          adj.connection[Connection.DOWN] = null;
        }
      }
      //down connection:
      if(y < this.pixelMap[0].length - 1 && rand == 3){
        let adj = this.pixelMap[x][y+1];
        if(adj !== undefined && adj !== null){
          pixel.connection[Connection.DOWN] = null;
          adj.connection[Connection.UP] = null;
        }
      }
    }
  };
  
  /*
  Structure.getPixel() returns the pixel from Structure.pixelMap[][] that is requested.
  */
  this.getPixel = function(x, y){
    if(Number.isInteger(x) && Number.isInteger(y)){return this.pixelMap[x][y];}
  };
  
  /*
  Structure.show() displays a rectangle to the size of Structure.pixelMap[][] with respect to
  the structure's location and rotation.
  */
  this.show = function(isDetailed){
    if(isDetailed === undefined){
      game.ctx.save();
      game.ctx.translate(this.pos.x*scale, this.pos.y*scale);
      game.ctx.rotate(this.theta);
      let transX = (0 - this.width/2)*scale;
      let transY = (0 - this.height/2)*scale;
      game.ctx.translate(transX, transY);//Translate so the center of the sructure is the Structure.pos
      let height = this.pixelMap[0].length;
      let width = this.pixelMap.length;
      let color = this.pixelMap[0][0].color;
      
      game.ctx.fillStyle = color;
      game.ctx.strokeStyle = color;
      game.ctx.lineWidth = 1;
      game.ctx.lineCap = 'square';
      game.ctx.strokeRect(0, 0, scale*pixSize*width, scale*pixSize*height);
      if(game.garage.isSolid) game.ctx.fillRect(0, 0, scale*pixSize*width, scale*pixSize*height);
      game.ctx.restore();
    }else{
      //Slow function that shows every pixel:
      game.ctx.save();
      game.ctx.translate(this.pos.x*scale, this.pos.y*scale);
      game.ctx.rotate(this.theta);
      let height = this.pixelMap[0].length;
      let width = this.pixelMap.length;
      let offsetX = width/2;
      let offsetY = height/2;
      for(var j = 0; j < height; j++){
        for(var i = 0; i < width; i++){
          if(this.pixelMap[i][j] !== null && this.pixelMap[i][j] !== undefined){
            this.pixelMap[i][j].show(scale*pixSize*(i - offsetX), scale*pixSize*(j - offsetY));
          }
        }
      }
      game.ctx.restore();
    }
  };
  
  /*
  Structure.update() updates the structure's location based on its current location and velocity.
  */
  this.update = function(dt){
    this.vel = vec(this.vel.x*0.95, this.vel.y*0.95);
    this.pos = vec(this.pos.x + (this.vel.x*dt), this.pos.y + (this.vel.y*dt));
  };
  
  /*
  Structure.trim() trims the empty space around the structure so that only the smallest
  rectabgular hitbox remains. if nothing remains; returns null.
  */
  this.trim = function(){
    let yStart = 0;
    let yEnd = this.pixelMap[0].length;
    let yTraverse = true;
    let xStart = 0;
    let xEnd = this.pixelMap.length;
    let xTraverse = true;
    //Find yStart and yEnd:
    for(let j = yStart; j < yEnd; j++){
      let rowEmpty = true;
      for(let i = xStart; i < xEnd; i++){
        if(this.pixelMap[i][j] !== undefined && this.pixelMap[i][j] !== null){
          if(yTraverse){
            yTraverse = false;
            yStart = j;
          }
          rowEmpty = false;
        }
      }
      if(rowEmpty && !yTraverse){
        yEnd = j;
      }
    }
    //Find xStart and xEnd:
    for(let i = xStart; i < xEnd; i++){
      let rowEmpty = true;
      for(let j = yStart; j < yEnd; j++){
        if(this.pixelMap[i][j] !== undefined && this.pixelMap[i][j] !== null){
          if(xTraverse){
            xTraverse = false;
            xStart = i;
          }
          rowEmpty = false;
        }
      }
      if(rowEmpty && !xTraverse){
        xEnd = i;
      }
    }
    //Create and set the new pixelMap:
    if(yStart == yEnd){
      return null;
    }else{
      let width = xEnd - xStart;
      let height = yEnd - yStart;
      var newMap = new Array(width);
      for(let i = 0; i < width; i++){
        newMap[i] = new Array(height);
        for(let j = 0; j < height; j++){
          newMap[i][j] = this.pixelMap[i+xStart][j+yStart];
        }
      }
      this.pixelMap = newMap;
      this.width = this.pixelMap.length*10;
      this.height = this.pixelMap[0].length*10;
    }
    return new vec(xStart, yStart);
  };
  
  /*
  Structure.setMap() sets a new map to the structure.
  */
  this.setMap = function(map){
    this.pixelMap = map;
    this.width = this.pixelMap.length*10;
    this.height = this.pixelMap[0].length*10;
  };
  
  /*
  Structure.resize() gives the struct a new width and height
  */
  this.resize = function(w, h){
    let pixelMap = new Array(w);
    for(let i = 0; i < w; i++){
      pixelMap[i] = new Array(h);
      for(let j = 0; j < h; j++){
        if(this.type == "SOLID_WALL"){
          pixelMap[i][j] = new Pixel('black', this, 1.0);
        }else if(this.type == "STARTPOINT"){
          if((j+i)%2 == 0) pixelMap[i][j] = new Pixel("black", this, 1.0);
          else pixelMap[i][j] = new Pixel("white", this, 1.0);
        }else if(this.type == "CHECKPOINT"){
          pixelMap[i][j] = new Pixel("rgba(200, 100, 100, 1.0)", this, 1.0);
        }
      }
    }
    this.setMap(pixelMap);
  };
  
  /*
  Structure.imitate() is used to set this structure's movement data to that of the passed structure, struct.
  */
  this.imitate = function(struct){
    this.theta = struct.theta;
    this.vel = vec(struct.vel.x, struct.vel.y);
  };
  
  /*
  Structure.clean() clears Structure.pixelMap[][] of any non-connected pixels (ex. if all of its connections broke).
  The algorithm must always start at the closest pixel to the 'drag point' of the structure (only applicable to cars).
  This is so the Car chunk remains as the car, and the rest can become a generic structure. the offset boolean value
  should be true if the structure is a car.
  */
  this.clean = function(offset){
    var x = 0;
    var y = 0;
    var map = new checklistMap(this.pixelMap);
    if(offset){
      x = this.pixelMap.length/4;
      y = this.pixelMap[0].length/2;
    }
    this.cleanRec(parseInt(x), parseInt(y), map);
    if(map.count != 0){
      var newStruct = new Structure(this.pos.x, this.pos.y, this.theta, map.getMap());
      newStruct.imitate(this);
      for(let i = 0; i < this.pixelMap.length; i++){
        for(let j = 0; j < this.pixelMap[0].length; j++){
          let pixel = newStruct.pixelMap[i][j];
          if(pixel !== undefined && pixel !== null){
            this.pixelMap[i][j] = null;
          }
        }
      }
      //Calc new position for main object:
      var trim1 = this.trim();
      var offset1 = scale*pixSize*magnitude(trim1);
      var offTheta1 = Math.PI/2; //Fallback value if trim1.x is zero (cant divide by 0)
      if(trim1.x != 0){
        offTheta1 = Math.atan(trim1.y/trim1.x);
      }
      var offsetX1 = -1*Math.cos(newStruct.theta + offTheta1)*offset1;
      var offsetY1 = -1*Math.sin(newStruct.theta + offTheta1)*offset1;
      
      //Calc new position for fragment object:
      this.pos = vec(this.pos.x + offsetX1, this.pos.y + offsetY1);
      var offset2 = scale*pixSize*magnitude(vec(x, y));
      var offTheta2 = Math.PI/2; //Default value incase cant divide by 0
      if(x != 0){
        offTheta2 = Math.atan(y/x);
      }
      var offsetX2 = Math.cos(newStruct.theta + offTheta2)*offset2;
      var offsetY2 = Math.sin(newStruct.theta + offTheta2)*offset2;
      var trim2 = newStruct.trim();
      offset2 = scale*pixSize*magnitude(trim2);
      if(trim2.x != 0){
        offTheta2 = Math.atan(trim2.y/trim2.x);
      }
      offsetX2 = offsetX2 - Math.cos(newStruct.theta + offTheta2)*offset2;
      offsetY2 = offsetY2 - Math.sin(newStruct.theta + offTheta2)*offset2;
      newStruct.pos = new vec((newStruct.pos.x - offsetX2), (newStruct.pos.y - offsetY2));
      game.map.debris.add(newStruct);
    }
  };
  
  /*
  Structure.cleanRec() is the recursive function that is called by the helper method, Structure.clean().
  */
  this.cleanRec = function(x, y, map){
    map.visit(x, y);
    var pixel = map.getMap()[x][y];
    if(pixel !== undefined && pixel !== null){
      var cntion = pixel.connection;
      if(cntion[Connection.RIGHT] !== null && cntion[Connection.RIGHT] !== undefined){
        cntion[Connection.RIGHT] = null;
        if(!map.visited(x+1, y)){
          map.getMap()[x+1][y].connection[Connection.LEFT] = null;
          this.cleanRec(x+1, y, map);
        }
      }
      if(cntion[Connection.UP] !== null && cntion[Connection.UP] !== undefined){
        cntion[Connection.UP] = null;
        if(!map.visited(x, y-1)){
          map.getMap()[x][y-1].connection[Connection.DOWN] = null;
          this.cleanRec(x, y-1, map);
        }
      }
      if(cntion[Connection.LEFT] !== null && cntion[Connection.LEFT] !== undefined){
        cntion[Connection.LEFT] = null;
        if(!map.visited(x-1, y)){
          map.getMap()[x-1][y].connection[Connection.RIGHT] = null;
          this.cleanRec(x-1, y, map);
        }
      }
      if(cntion[Connection.DOWN] !== null && cntion[Connection.DOWN] !== undefined){
        cntion[Connection.DOWN] = null;
        if(!map.visited(x, y+1)){
          map.getMap()[x][y+1].connection[Connection.UP] = null;
          this.cleanRec(x, y+1, map);
        }
      }
      map.remove(x, y);
    }
  };
  
  /*
  Structure.collision() returns true if there is a collision with the given hitbox and the Structure's hitbox.
  */
  this.collision = function(r){
    if(!inCircle(r[0], this.pos, ((this.width > this.height) ? (this.width/1.8 + 80) : (this.height/1.8 + 80)))) return false; //Check to see if the struct is in range
    return SATCheck(r, this.getRect());
  };
  
  /*
  Structure.getRect() returns the hitbox for the structure as an array of four points.
  */
  this.getRect = function(){
    let offX = (this.width/2);
    let offY = (this.height/2);
    let trans = rotate(new vec(-offX, -offY), this.theta);
    let origin = add(this.pos, trans);
    let rect = [
      origin,
      add(origin, rotate(new vec(this.width, 0), this.theta)),
      add(origin, rotate(new vec(this.width, this.height), this.theta)),
      add(origin, rotate(new vec(0, this.height), this.theta))
      ];
    return rect;
  }
}

/*
Car is an extension of the structure object that overrides the showanddisplay functions to better tailor to a Car object. (Adds tire marks and positions it slightly differently)
*/
function Car(x, y, theta, map, width, height){
  Structure.call(this, x, y, theta, map, width, height);
  this.trailX;
  this.trailY;
  this.noseTrailX;
  this.noseTrailY;
  this.camOffset = new vec(0, 0);
  this.tireMarksRight = new list();
  this.tireMarksLeft = new list();
  this.crash = false;
  this.cRect;
  this.lastRect;
  this.lastPos;

  /*
  Car.crashed() puts the car into a crashed state.
  */
  this.crashed = function(r){
    this.crash = true;
    this.cRect = r
  }
  
  /*
  Car.checkBoundColl() checks the boundary pixels of the car to see which ones have collided, and which ones will break.
  */
  this.checkBoundColl = function(r){
    for(let i=0; i < this.pixelMap.length; i++){
      for(let j=0; j < this.pixelMap[0].length; j++){
        if(this.checkPixColl(i, j, r)){
          this.breakPixel(i, j);
          return;
        }
      }
    }
    return;
  }
  
  /*
  Car.checkPixColl() checks if the given pixel is colliding with the given hitbox.
  */
  this.checkPixColl = function(x, y, r){
    let pixel = this.pixelMap[x][y];
    if(pixel !== undefined && pixel !== null){
      let w = this.pixelMap.length;
      let h = this.pixelMap[0].length;
      let supRect = this.getRect();
      let rect = [
        new vec(supRect[0].x + (x/w)*(supRect[1].x-supRect[0].x) + (y/h)*(supRect[3].x-supRect[0].x), supRect[0].y + (x/w)*(supRect[1].y-supRect[0].y) + (y/h)*(supRect[3].y - supRect[0].y)),           //Top Left
        new vec(supRect[0].x + ((x+1)/w)*(supRect[1].x-supRect[0].x) + (y/h)*(supRect[3].x-supRect[0].x), supRect[0].y + ((x+1)/w)*(supRect[1].y-supRect[0].y) + (y/h)*(supRect[3].y - supRect[0].y)),   //Top Right
        new vec(0, 0), //Bottom Right Placeholder
        new vec(supRect[0].x + (x/w)*(supRect[2].x-supRect[3].x) + ((y+1)/h)*(supRect[3].x-supRect[0].x), supRect[0].y + (x/w)*(supRect[2].y-supRect[3].y) + ((y+1)/h)*(supRect[3].y-supRect[0].y)) //Bottom Left
      ];
      rect[2] = add(rect[3], add(rect[1], neg(rect[0])));
      /*
      game.ctx.strokeStyle = 'rgba(0, 255, 0, 1.0)';
      game.ctx.beginPath();
      game.ctx.moveTo(rect[0].x, rect[0].y);
      game.ctx.lineTo(rect[1].x, rect[1].y);
      game.ctx.lineTo(rect[2].x, rect[2].y);
      game.ctx.lineTo(rect[3].x, rect[3].y);
      game.ctx.lineTo(rect[0].x, rect[0].y);
      game.ctx.stroke();
      game.ctx.beginPath();
      game.ctx.moveTo(r[0].x, r[0].y);
      game.ctx.lineTo(r[1].x, r[1].y);
      game.ctx.lineTo(r[2].x, r[2].y);
      game.ctx.lineTo(r[3].x, r[3].y);
      game.ctx.lineTo(r[0].x, r[0].y);
      game.ctx.stroke();
      */
      return SATCheck(r, rect);
    } else return false;
  }
  
  /*
  Car.update() updates the positional values for the car's structure.
  */
  this.update = function(dt){
    /*Velocity is proportional to the dist to the mouse positions:*/
    this.lastPos = veclone(this.pos);
      let m = game.mouseGamePos();
      if(m.x !== undefined && m.y !== undefined){
        if(this.trailX !== undefined && this.trailY !== undefined){
          // Check if the car is stopped before changing the angle
          if(magnitude(vec(this.pos.x - m.x, this.pos.y - m.y)) > 5*scale){
            let velX = (this.trailX - this.pos.x)*4;
            let velY = (this.trailY - this.pos.y)*4;
            let noseX = (this.noseTrailX - this.pos.x)*4;
            let noseY = (this.noseTrailY - this.pos.y)*4;
            this.noseTrailX += (m.x - this.noseTrailX)*8*dt;
            this.noseTrailY += (m.y - this.noseTrailY)*8*dt;
            this.trailX += (m.x - this.trailX)*4*dt;
            this.trailY += (m.y - this.trailY)*4*dt;
            if(this.crash){
              this.checkBoundColl(this.cRect);
              this.clean(true);
              let newPos = getOuterContact(this.pos, mult(this.vel, dt), this.getRect(), this.cRect);
              let dPos = sub(newPos, this.pos);
              this.pos = newPos;
              this.vel = getPrllVel(this.vel, this.cRect);
              let structHit = game.map.collisionCheck(this.getRect());
              if(structHit!==null) this.vel = new vec(0,0);//stop the car if it is going to hit another wall
              this.vel = constrainMag(this.vel, 2000);//Keep the velocity under a certain value
              this.pos = add(this.pos, mult(this.vel, dt));
              this.vel = add(dPos, this.vel);
              this.crash = false;
            }else{
              this.vel = vec(this.vel.x + (velX - this.vel.x)/(scale*pixSize), this.vel.y + (velY - this.vel.y)/(scale*pixSize)); //ease the velocity toward the new velocity
              this.vel = constrainMag(this.vel, 2000);//Keep the velocity under a certain value
              this.pos = add(this.pos, mult(this.vel, dt));
            }
            
            let newAngle = Math.atan(noseY/noseX);
            if(Math.abs(noseX)/noseX > 0){
              newAngle = newAngle + Math.PI; //Adjust the angle for the limited range of atan()
            }
            this.theta = newAngle;
          }
        }else{
          this.trailX = m.x;
          this.trailY = m.y;
          this.noseTrailX = m.x;
          this.noseTrailY = m.y;
        }
        
      }
      this.camOffset = sub(mult(this.camOffset, 0.7), mult(this.vel, 0.3*dt));
      this.camScale = (scale*pixSize)/Math.sqrt(magnitude(this.vel));
  };
  
  
  /*
  Car.showTireMarks() shows the car's previous tire marks.
  */
  this.showTireMarks = function(){
    //Show tire marks:
    game.ctx.strokeStyle = 'rgba(160, 160, 160, 0.5)';
    game.ctx.lineWidth = 6;
    //game.ctx.lineCap = 'square';
    let current = this.tireMarksRight.head;
    let dist = 0;
    if(current !== undefined && current !== null){
      while(current.nxt !== undefined && current.nxt !== null){
        dist+=1/this.tireMarksRight.count;
        game.ctx.beginPath();
        game.ctx.moveTo(current.elem.x*scale, current.elem.y*scale);
        game.ctx.lineWidth = 6*dist;
        game.ctx.lineTo(current.nxt.elem.x*scale, current.nxt.elem.y*scale);
        game.ctx.stroke();
        current = current.nxt;
      }
    }
    current = this.tireMarksLeft.head;
    dist = 0;
    if(current !== undefined && current !== null){
      while(current.nxt !== undefined && current.nxt !== null){
        dist+=1/this.tireMarksLeft.count;
        game.ctx.beginPath();
        game.ctx.moveTo(current.elem.x*scale, current.elem.y*scale);
        game.ctx.lineWidth = 6*dist;
        game.ctx.lineTo(current.nxt.elem.x*scale, current.nxt.elem.y*scale);
        game.ctx.stroke();
        current = current.nxt;
      }
    }
  };
  
  /*
  Car.show() displays all of the pixels in Car.pixelMap[][] with respect to
  the car's location and rotation.
  */
  this.show = function(){
    //Show car:
    game.ctx.save();
    //first translation
    game.ctx.translate(game.canvas.width/2, game.canvas.height/2);
    game.ctx.rotate(this.theta);
    let height = this.pixelMap[0].length;
    let width = this.pixelMap.length;
    let transX2 = (0 - width/4)*scale*pixSize;
    let transY2 = (0 - height/2)*scale*pixSize;
    game.ctx.translate(transX2, transY2);//second translation to center the hood of the car at it's location
    let noTires = true; //Variable to check if there are any powered tires left on the vehicle.
    for(var j = 0; j < height; j++){
      for(var i = 0; i < width; i++){
        let pixel = this.pixelMap[i][j];
        if(pixel !== null && pixel !== undefined){
          //check for game pause before adding tireMarks so they dont dissapear during pause
          if(!game.pause){
            //Add tire mark coordinates to this.tireMarks[]:
            if(pixel.isTire !== undefined && pixel.isTire !== null){
              noTires = false;
              let xPrime = (10*(i + transX2/(scale*pixSize))) + 5;//pixel x location WRT car
              let yPrime = (10*(j + transY2/(scale*pixSize))) + 5;//pixel y location WRT car
              let tX = xPrime*Math.cos(this.theta) - yPrime*Math.sin(this.theta) + this.pos.x;//rotate by theta and add car position
              let tY = xPrime*Math.sin(this.theta) + yPrime*Math.cos(this.theta) + this.pos.y;//rotate by theta and add car position
              var list = null;
              if(j>=height/2){
                list = this.tireMarksRight;
              }else if(j<height/2){
                list = this.tireMarksLeft;
              }
              if(list !== null){
                //save the tire location
                list.addLast(vec(tX, tY));
                if(list.count > 160){
                  list.remove();
                }
              }
            }
          }
          //Show the Car pixel
          pixel.show(scale*pixSize*i, scale*pixSize*j);
        }
      }
    }
    /*//Hit_Box
    game.ctx.strokeStyle = 'green';
    game.ctx.strokeRect(0, 0, width*scale*pixSize, height*scale*pixSize);*/
    
    game.ctx.restore();
    if(!game.pause && noTires){
      game.play.endScreen = true;
    }
  };
  
  /*
  Car.staticShow() displays the car as if it was a normal structure. (Used in TrackMaker)
  */
  this.staticShow = function(){
    game.ctx.save();
    game.ctx.translate(this.pos.x*scale, this.pos.y*scale);
    game.ctx.rotate(this.theta);
    
    let transX2 = (0 - this.width/4)*scale;
    let transY2 = (0 - this.height/2)*scale;
    game.ctx.translate(transX2, transY2); //translate to the center of the car
    
    let height = this.pixelMap[0].length;
    let width = this.pixelMap.length;
    for(var j = 0; j < height; j++){
      for(var i = 0; i < width; i++){
        if(this.pixelMap[i][j] !== null && this.pixelMap[i][j] !== undefined){
          this.pixelMap[i][j].show(scale*pixSize*i, scale*pixSize*j);
        }
      }
    }
    game.ctx.restore();
  };
  
  /*
  Car.getRect() returns the hitbox for the car as an array of 4 points.
  */
  this.getRect = function(){
    this.width = this.pixelMap.length*10.0;
    this.height = this.pixelMap[0].length*10.0;
    let offX = (this.width/4);
    let offY = (this.height/2);
    let trans = rotate(new vec(-offX, -offY), this.theta);
    let origin = add(this.pos, trans);
    let rect = [
      origin,
      add(origin, rotate(new vec(this.width, 0), this.theta)),
      add(origin, rotate(new vec(this.width, this.height), this.theta)),
      add(origin, rotate(new vec(0, this.height), this.theta))
      ];
    this.lastRect = rect;
    return rect;
  };
  
  /*
  Car.paint() puts a new paint job on the car.
  */
  this.paint = function(c1, c2){
    var colorM = "rgba(255, 50, 50, 1.0)", colorS = "rgba(100, 100, 100, 1.0)";
    if(c1 !== undefined) colorM = c1.getColor();
    if(c2 !== undefined) colorS = c2.getColor();
    //wheels:
    this.setPixel(1, 0, new Pixel('#000000', this, 1.0));
    this.setPixel(1, 3, new Pixel('#000000', this, 1.0));
    this.setPixel(4, 0, new Pixel('#000000', this, 1.0, true));
    this.setPixel(4, 3, new Pixel('#000000', this, 1.0, true));
    //bumper:
    this.setPixel(0, 0, new Pixel(colorM, this, 1.0));
    this.setPixel(0, 1, new Pixel(colorM, this, 1.0));
    this.setPixel(0, 2, new Pixel(colorM, this, 1.0));
    this.setPixel(1, 1, new Pixel(colorM, this, 1.0));
    this.setPixel(1, 2, new Pixel(colorM, this, 1.0));
    this.setPixel(0, 3, new Pixel(colorM, this, 1.0));
    //windShield:
    this.setPixel(2, 1, new Pixel(colorS, this, 1.0));
    this.setPixel(2, 2, new Pixel(colorS, this, 1.0));
    //mid:
    this.setPixel(3, 1, new Pixel(colorM, this, 1.0));
    this.setPixel(3, 2, new Pixel(colorM, this, 1.0));
    this.setPixel(4, 1, new Pixel(colorM, this, 1.0));
    this.setPixel(4, 2, new Pixel(colorM, this, 1.0));
    //rear:
    this.setPixel(5, 0, new Pixel(colorM, this, 1.0));
    this.setPixel(5, 1, new Pixel(colorM, this, 1.0));
    this.setPixel(5, 2, new Pixel(colorM, this, 1.0));
    this.setPixel(5, 3, new Pixel(colorM, this, 1.0));
    this.trim();
    this.saveState();
  };
  
  /*
  Car.saveState() saves the car's pixel map to be reloaded when destroyed.
  */
  this.saveState = function(){
    this.saveMap = new Array(this.pixelMap.length);
    for(let i = 0; i < this.saveMap.length; i++){
      this.saveMap[i] = new Array(this.pixelMap[0].length);
      for(let j = 0; j < this.saveMap[0].length;j++){
        if(this.pixelMap[i][j] !== null && this.pixelMap[i][j] !== undefined) this.saveMap[i][j] = this.pixelMap[i][j].clone();
        else this.saveMap[i][j] = null;
      }
    }
  };
  
  /*
  Car.center() centers the car.
  */
  this.center = function(){
    this.setPos(new vec(0,0));
    this.vel = new vec(0,0);
    this.theta = Math.PI/2;
    this.trailX = undefined;
    this.trailY = undefined;
    this.noseTrailX = undefined;
    this.noseTrailY = undefined;
    this.camOffset = new vec(0, 0);
    this.tireMarksRight = new list();
    this.tireMarksLeft = new list();
    this.crash = false;
    //Stall the car:
    game.mouseX = undefined;
    game.mouseY = undefined;
    game.mouseButton=undefined;
    game.cam = new vec(0, 0);
  };
  
  /*
  Car.reload() reloads the last car save and centers the car
  */
  this.reload = function(){
    this.pixelMap = this.saveMap;
    this.saveState();
    this.center();
  };
  
  /*
  Car.setPos(p) sets the pos of the car
  */
  this.setPos = function(p){
    this.pos = p;
    this.lastPos = p;
  };
}

/*
ClassicCar() returns a new Car object, styled as the classic Break Racer car.
*/
function ClassicCar(x, y, theta){
  var car = new Car(x, y, theta, null, 6, 4);
  car.paint();
  return car;
}
