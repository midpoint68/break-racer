function Pixel(color, structure, integrity, isTire){
  this.color = color;
  this.structure = structure;
  this.integrity = integrity;
  this.isTire = isTire;
  this.connection = {};
  
  /*
  Pixel.show() displays the pixel at the specified coordinates. Usually used in context of Structure.show(),
  so x and y are usually local to the structure origin.
  */
  this.show = function(x, y){
    game.ctx.fillStyle = color;
    game.ctx.strokeStyle = color;
    game.ctx.lineWidth = 1;
    game.ctx.lineCap = 'round';
    game.ctx.strokeRect(x, y, scale*pixSize, scale*pixSize);
    game.ctx.fillRect(x, y, scale*pixSize, scale*pixSize);
  };
  
  /*
  Pixel.connect() stores a connection to a neighboring Pixel as well as store it on the neighbor's side.
  This allows for impacts to check to see how weak connections are to break them.
  */
  this.connect = function(connectForce, neighbor, dir){
    var cntion = new Connection(connectForce);
    this.connection[dir] = cntion;
    neighbor.connection[-dir] = cntion;
  };
  
  /*
  Pixel.clone() returns a deep clone of the Pixel.
  */
  this.clone = function(){
    var clone = new Pixel(this.color, this.structure, this.integrity, this.isTire);
    var newCntion = {};
    newCntion[Connection.RIGHT] = this.connection[Connection.RIGHT];
    newCntion[Connection.LEFT] = this.connection[Connection.LEFT];
    newCntion[Connection.UP] = this.connection[Connection.UP];
    newCntion[Connection.DOWN] = this.connection[Connection.DOWN];
    clone.connection = newCntion;
    return clone;
  };
}

function Connection(connectForce){
  Connection.LEFT = -1;
  Connection.RIGHT = 1;
  Connection.UP = -2;
  Connection.DOWN = 2;
  this.connectForce = connectForce;
}

function Color(rh, gs, bl, a){
  if(a!==undefined){
    this.r = parseInt(rh);
    this.g = parseInt(gs);
    this.b = parseInt(bl);
    this.a = a;
    this.getColor = function(){
      return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")";
    };
  }else{
    this.h = parseInt(rh);
    this.s = parseInt(gs);
    this.l = parseInt(bl);
    this.getColor = function(){
      return "hsl("+this.h+","+this.s+"%,"+this.l+"%)";
    };
  }
}