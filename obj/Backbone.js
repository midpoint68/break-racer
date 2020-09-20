var game;
var jsonInput;
window.onload = function(){
  jsonInput= document.getElementById("jsonFile")
  var canvas = document.getElementById('gameWindow');
  var ctx = canvas.getContext('2d');
  game = new Game(canvas, ctx, 'classic');
  game.loadMap(game.getDefaultMap('classic'));
  draw();
};

function draw(){
  requestAnimationFrame(draw);
  game.draw();
}
