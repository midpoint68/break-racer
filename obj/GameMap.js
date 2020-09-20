/*
GameMap is an object that stores the game's structure information and provides tools for game objects to locate and check other game objects.
*/
function GameMap(){
  this.debris = new StructureList();
  this.checkpoint;
  this.data;
  this.startpoint;
  this.lap = 1;
  this.divs = new Array(10);
  for(let i = 0; i < this.divs.length; i++){
    this.divs[i] = new Array(4);
    for(let j = 0; j < this.divs[i].length; j++){
      this.divs[i][j] = new StructureList();
    }
  }
  
  this.setData = function(data){
    if(data.wall!==null && data.wall!==undefined){
      this.data = data;
    }
  };
  
  this.load = function(){
    this.lap = 1;
    game.car.setPos(new vec(this.data.spawnX, this.data.spawnY));
    game.car.theta = this.data.spawnT;
    //load the walls:
    let wall = this.data.wall;
    for(let i = 0; i < wall.length; i++){
      if(wall[i] !== null && wall[i] !== undefined) this.divs[0][0].add(new Structure(wall[i].xPos, wall[i].yPos, wall[i].theta, wall[i].type, wall[i].width, wall[i].height));
    }
    //load the checkpoints:
    let cp = this.data.checkpoint;
    this.checkpoint = new Array(cp.length);
    for(let i = 0; i < cp.length; i++){
      this.checkpoint[i] = new Array(2);
      if(cp[i] !== null && cp[i] !== undefined){
        this.checkpoint[i][0] = new Structure(cp[i].xPos, cp[i].yPos, cp[i].theta, cp[i].type, cp[i].width, cp[i].height);
        this.checkpoint[i][1] = false;
      }
    }
    //load the startpoint:
    let sp = this.data.startpoint;
    this.startpoint = new Structure(sp.xPos, sp.yPos, sp.theta, sp.type, sp.width, sp.height);
  };
  
  this.clear = function(){
    this.divs = new Array(10);
    for(let i = 0; i < this.divs.length; i++){
      this.divs[i] = new Array(4);
      for(let j = 0; j < this.divs[i].length; j++){
        this.divs[i][j] = new StructureList();
      }
    }
    this.debris = new StructureList();
    this.startpoint = null;
    this.checkpoint = null;
  };
  
  this.update = function(dt){
    for(let d = 0; d < this.divs.length; d++){
      for(let dd = 0; dd < this.divs[d].length; dd++){
        let div = this.divs[d][dd];
        let node = div.iterate();
        if(node !== undefined && node !== null){
          var struct;
          do{
            struct = node.struct;
            struct.update(dt);
            node = div.iterate(node);
          } while(node !== null && node !== undefined);
        }
      }
    }
    let node = this.debris.iterate();
    if(node !== undefined && node !== null){
      var struct;
      do{
        struct = node.struct;
        struct.update(dt);
        node = this.debris.iterate(node);
      } while(node !== null && node !== undefined);
    }
  };
  
  this.show = function(){
    //show startpoint:
    if(this.startpoint!==null && this.startpoint!==undefined) this.startpoint.show(true);
    
    /*if(this.checkpoint !== undefined && this.checkpoint!== null){
      //show the checkpoints:
      for(let i = 0; i < this.checkpoint.length; i++){
        this.checkpoint[i][0].show();
      }
    }*/
    
    //show the walls and debris:
    for(let d = 0; d < this.divs.length; d++){
      for(let dd = 0; dd < this.divs[d].length; dd++){
        let div = this.divs[d][dd];
        let node = div.iterate();
        if(node !== undefined && node !== null){
          var struct;
          do{
            struct = node.struct;
            struct.show();
            node = div.iterate(node);
          } while(node !== null && node !== undefined);
        }
      }
    }
    let node = this.debris.iterate();
    if(node !== undefined && node !== null){
      var struct;
      do{
        struct = node.struct;
        struct.show(true);
        node = this.debris.iterate(node);
      } while(node !== null && node !== undefined);
    }
  };
  
  /*
  GameMap.collisionCheck() will use the seperating axis theorem [SATCheck()] to check for rotated object collision.
  */
  this.collisionCheck = function(r){
    let collider;
    do{
      collider = this.divs[0][0].iterate(collider);
    }
    while(collider !== null && collider !== undefined && !collider.struct.collision(r));
    if(collider !== undefined && collider !== null) return collider.struct;
    else return null;
  };
  
  /*
  GameMap.crossedTheLine() returns true if the car has crossed the line and crossed all of the checkpoints before hand.
  */
  this.crossedTheLine = function(r){
    let allCrossed = true;
    for(let i = 0; i < this.checkpoint.length; i++){
      if(!this.checkpoint[i][1]){
        if(this.checkpoint[i][0].collision(r)){
          this.checkpoint[i][1] = true;
        }
        else allCrossed = false;
      }
    }
    if(allCrossed && this.startpoint.collision(r)){
      for(let i = 0 ; i < this.checkpoint.length; i++) this.checkpoint[i][1] = false; //reset checkpoints
      return true;
    }
    return false;
  };
}

/*
StructureList is a list that stores gameObjects for fast, easy and accurate checking and removal.
*/
function StructureList(){
  this.head;
  this.tail;
  this.add = function(struct){
    var node = new SNode(struct);
    if(!this.head){
      this.head = node;
      this.tail = node;
    }else{
      this.tail.nxt = node;
      this.tail = node;
    }
  };
  this.remove = function(struct){
    var prev;
    var current = this.head;
    while(current !== undefined && current !== null && current.struct.id != struct.id){
      prev = current;
      current = current.nxt;
    }
    if(current !== undefined && current !== null){
      if(current == this.head){
        this.head = current.nxt;
      }else{
        prev.nxt = current.nxt;
      }
      return current;
    }else{
	    return null;
    }
  };
  this.iterate = function(current){
  	if(current === null || current === undefined){
  		return this.head;
  	}else{
  		return current.nxt;
  	}
  };
}

/*
SNode is a helper node for StructureList.
*/
function SNode(struct){
  this.struct = struct;
  this.nxt;//next node in the list
}

/*
SATCheck() uses the Separating Axis Theorem to check to see if there is a collision between two rectangles (r1, r2). Arguments should be of type Array of Vec.
*/
function SATCheck(r1, r2, final){
  //Define the two slopes: mB to find the y-intercepts and mN to find the x-intercepts.
  var mB,mN;
  let testSlope1 = slope(r1[0], r1[1]);
  let testSlope2 = slope(r1[0], r1[3]);
  if(testSlope1!==undefined & Math.abs(testSlope1) < 1){ mB = testSlope1; mN = invSlope(r1[0], r1[3]);}
  else{ mB = testSlope2; mN = invSlope(r1[0], r1[1]);}
  
  //Find the y-intercepts (b) and the x-intercepts (n) of all the points.
  let b1 = new Array(4), b2 = new Array(4);
  let n1 = new Array(4), n2 = new Array(4);
  for(let i=0; i<4; i++){
    b1[i] = r1[i].y - (mB*r1[i].x);
    b2[i] = r2[i].y - (mB*r2[i].x);
    n1[i] = r1[i].x - (mN*r1[i].y);
    n2[i] = r2[i].x - (mN*r2[i].y);
  }
  
  //Check to see if there are any gaps between the rectangles' intercepts.
  let r1b = b1[0], r2b = b2[0], r1n = n1[0], r2n = n2[0];
  if(r2b > r1b){
    for(let i=1; i<4; i++){
      if(b1[i] > r1b) r1b = b1[i];
      if(b2[i] < r2b) r2b = b2[i];
    }
    if(r2b > r1b) return false;
  }else if(r2b < r1b){
    for(let i=1; i<4; i++){
      if(b1[i] < r1b) r1b = b1[i];
      if(b2[i] > r2b) r2b = b2[i];
    }
    if(r2b < r1b) return false;
  }
  if(r2n > r1n){
    for(let i=1; i<4; i++){
      if(n1[i] > r1n) r1n = n1[i];
      if(n2[i] < r2n) r2n = n2[i];
    }
    if(r2n > r1n) return false;
  }else if(r2n < r1n){
    for(let i=1; i<4; i++){
      if(n1[i] < r1n) r1n = n1[i];
      if(n2[i] > r2n) r2n = n2[i];
    }
    if(r2n < r1n) return false;
  }
  if(final!==undefined && final) return true;
  else return SATCheck(r2, r1, true); //There must be a collision if there were no gaps found;
}

/*
inBox() returns if x1, y1 coordinates are in the defined box.
*/
function inBox(x1, y1, x2, y2, w, h){
  if(x1 < (x2+w) && x1 >= x2 && y1 < (y2+h) && y1 >= y2){
    return true;
  }else return false;
}

/*
inRect() returns if pos is in the hit box rect.
*/
function inRect(pos, rect){
  let r = [pos, add(pos, new vec(1, 0)), add(pos, new vec(1, 1)), add(pos, new vec(0, 1))];
  return SATCheck(r, rect);
}

/*
inCircle() returns if the point is in the circle
*/
function inCircle(p, c, r){
  return (magnitude(sub(p, c)) < r);
}
/*
slope() returns the slope between the two points.
*/
function slope(p1, p2){
  if((p2.x - p1.x) === 0) return undefined;
  else return ((p2.y - p1.y)/(p2.x - p1.x));
}

/*
invSlope() returns the inverse slope between the two points.
*/
function invSlope(p1, p2){
  if((p2.y - p1.y) === 0) return undefined;
  else return ((p2.x - p1.x)/(p2.y - p1.y));
}

/*
getPrllVel() returns the parallel component of the velocity to the rectangle hitbox given. (Chooses the appropriate side of the hitbox first)
*/
function getPrllVel(vel, rect){
  let r = [new vec(0, 0), sub(rect[1], rect[0]), sub(rect[2], rect[0]), sub(rect[3], rect[0])];
  var reference;
  if(magnitude(r[1]) > magnitude(r[3])){
    reference = r[1];
  }else{
    reference = r[3];
  }
  let angle = getAngle(reference, r[0]);
  let velAngle = getAngle(vel, new vec(0,0));
  let diffAngle = addAngle(velAngle, -angle);
  let newVel = mult(reference, magnitude(vel)*Math.cos(diffAngle)/magnitude(reference));
  return newVel;
}

/*
getOuterContact() gets the position a box should be in when it collides with a rect so that it is not overlapping on the next frame
*/
function getOuterContact(pos, vel, r1, r2){
  let hitPos = pos;
  let rect = [new vec(0, 0), sub(r2[1], r2[0]), sub(r2[2], r2[0]), sub(r2[3], r2[0])];
  var reference;
  var width;
  if(magnitude(rect[1]) > magnitude(rect[3])){
    reference = rect[1];
    width = rect[3];
  }else{
    reference = rect[3];
    width = rect[1];
  }
  let perp = rotate(sub(reference, rect[0]), Math.PI/2);
  let posPerpVel = unit(perp);
  let negPerpVel = neg(posPerpVel);

  //add the perpVel and recalculate collisions:
  posPos = new vec(pos.x, pos.y);
  negPos = new vec(pos.x, pos.y);
  posR = [veclone(r1[0]), veclone(r1[1]), veclone(r1[2]), veclone(r1[3])];
  negR = [veclone(r1[0]), veclone(r1[1]), veclone(r1[2]), veclone(r1[3])];
  let i=0;
  for(; i < 10000; i++){//limit it to 10000 calls
    posPos = add(posPos, posPerpVel);
    negPos = add(negPos, negPerpVel);
    for(let i = 0; i < 4; i++){
      posR[i] = add(posR[i], posPerpVel);
      negR[i] = add(negR[i], negPerpVel)
    }
    //Check which direction is more favorable:
    if(!SATCheck(posR, r2)){
      pos = posPos;
      break;
    }
    if(!SATCheck(negR, r2)){
      pos = negPos;
      break;
    }
  }
  return pos;
}

function getDefaultMap(){
  return {"name":"checkpoint_Test","numLaps":3,"spawnX":-150.47733333333335,"spawnY":142.4053333333334,"spawnT":2.1782409247825445,"wall":[{"xPos":-240.48000000000013,"yPos":-80.63999999999999,"theta":5.310456179148752,"type":"SOLID_WALL","width":128,"height":2},{"xPos":122.39999999999986,"yPos":109.4399999999999,"theta":5.310456179148752,"type":"SOLID_WALL","width":108,"height":2},{"xPos":537.408,"yPos":-606.8160000000008,"theta":0,"type":"SOLID_WALL","width":85,"height":2},{"xPos":842.0066666666655,"yPos":-332.0999999999997,"theta":0,"type":"SOLID_WALL","width":85,"height":2},{"xPos":1207.593333333334,"yPos":-723.113333333332,"theta":5.845394003538022,"type":"SOLID_WALL","width":55,"height":2},{"xPos":1313.0133333333324,"yPos":-412.77333333333326,"theta":5.274482748598126,"type":"SOLID_WALL","width":20,"height":2},{"xPos":1458.0733333333314,"yPos":-492.8800000000003,"theta":0,"type":"SOLID_WALL","width":20,"height":2},{"xPos":1601.466666666666,"yPos":-412.28666666666726,"theta":1.0303768265243176,"type":"SOLID_WALL","width":20,"height":2},{"xPos":1552.2733333333315,"yPos":-838.2799999999992,"theta":0,"type":"SOLID_WALL","width":20,"height":2},{"xPos":1790.9133333333327,"yPos":-598.5933333333336,"theta":1.0362504741017657,"type":"SOLID_WALL","width":57,"height":2},{"xPos":1914.4199999999962,"yPos":-207.14000000000044,"theta":1.7002274198749554,"type":"SOLID_WALL","width":31,"height":2},{"xPos":1684.1533333333314,"yPos":-61.653333333333734,"theta":0,"type":"SOLID_WALL","width":44,"height":2},{"xPos":1459.1199999999978,"yPos":-151.66666666666725,"theta":1.5653319003104162,"type":"SOLID_WALL","width":20,"height":2},{"xPos":988.9973333333344,"yPos":105.37599999999892,"theta":5.940271160346496,"type":"SOLID_WALL","width":100,"height":2},{"xPos":736.9973333333331,"yPos":-25.6640000000011,"theta":0.0005511539228368094,"type":"SOLID_WALL","width":43,"height":1},{"xPos":160.997333333333,"yPos":472.5759999999986,"theta":2.139045112741003,"type":"SOLID_WALL","width":9,"height":6},{"xPos":3.717333333330616,"yPos":664.8639999999984,"theta":0.5766609348691265,"type":"SOLID_WALL","width":41,"height":2},{"xPos":374.46933333333,"yPos":652.9919999999976,"theta":0.5766609348691265,"type":"SOLID_WALL","width":50,"height":2},{"xPos":1000.1973333333333,"yPos":570.6239999999983,"theta":1.1859142483213676,"type":"SOLID_WALL","width":89,"height":2},{"xPos":646.743999999998,"yPos":1224.3840000000032,"theta":5.830815415517165,"type":"SOLID_WALL","width":113,"height":2},{"xPos":-199.4826666666688,"yPos":1325.900000000003,"theta":0.39637068475685905,"type":"SOLID_WALL","width":75,"height":2},{"xPos":-668.7666666666698,"yPos":894.8813333333351,"theta":1.4138694579491153,"type":"SOLID_WALL","width":20,"height":2},{"xPos":-673.6626666666684,"yPos":699.2173333333333,"theta":1.677823799844273,"type":"SOLID_WALL","width":20,"height":2},{"xPos":-631.796000000002,"yPos":525.4706666666676,"theta":1.954157120512685,"type":"SOLID_WALL","width":17,"height":2},{"xPos":-579.4533333333349,"yPos":1147.6799999999992,"theta":0.7734939638391557,"type":"SOLID_WALL","width":10,"height":2},{"xPos":-632.8333333333355,"yPos":1054.5266666666669,"theta":1.2646087181352554,"type":"SOLID_WALL","width":13,"height":2}],"startpoint":{"xPos":-141.34986432877304,"yPos":129.27458844958,"theta":0.6074445979876479,"type":"STARTPOINT","width":40,"height":3},"checkpoint":[{"xPos":271.3946666666667,"yPos":-467.74933333333365,"theta":0.7444853336220096,"type":"CHECKPOINT","width":42,"height":2},{"xPos":1458.277333333333,"yPos":-365.1946666666667,"theta":1.563851993979883,"type":"CHECKPOINT","width":24,"height":2},{"xPos":335.1786666666667,"yPos":180.09600000000037,"theta":0.4501753702436796,"type":"CHECKPOINT","width":42,"height":2},{"xPos":-345.1840000000005,"yPos":426.47733333333395,"theta":0.5941516421111953,"type":"CHECKPOINT","width":41,"height":2}]};
}
