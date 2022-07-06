const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world,ground;   
var backgroundImg,towerImage;
var canvas, angle, tower, ground, cannon, boat;
var score = 0;
var balls = [];
var boats = [];
var boatsSpritedata, boatSpritesheet, brokenBoatSpritedata,brokenBoatSpritesheet, waterSplashSpritedata, waterSplashSpritesheet;
var boatAnimation = [];
var brokenBoatAnimation = [];
var waterSplashAnimation = [];
var backgroundMusic, waterSound, pirateLaughSound, cannonExplosion;
var isGameOver = false;
var isLaughing = false;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatsSpritedata = loadJSON("./assets/boat/boat.json");
  boatSpritesheet = loadImage("./assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("./assets/boat/boat.json");
  brokenBoatSpritesheet = loadImage("./assets/boat/brokenBoat.png");
  waterSplashSpritedata = loadJSON("./assets/waterSplash/waterSplash.json");
  waterSplashSpritesheet = loadImage("./assets/waterSplash/waterSplash.png");
  backgroundMusic = loadSound("./assets/background_music.mp3");
  waterSound = loadSound("./assets/cannon_water.mp3");
  pirateLaughSound = loadSound ("./assets/pirate_laugh.mp3");
  cannonExplosion = loadSound ("./assets/cannon_explosion.mp3");
}

function setup() {

  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  
  angleMode(DEGREES);
  angle = 15;

  ground = Bodies.rectangle(0,height-1,width*2,1,{ isStatic: true });
  World.add(world,ground);

  tower = Bodies.rectangle(160,350,160,310,{ isStatic: true });
  World.add(world,tower);

  cannon = new Cannon(180, 110, 130, 100, angle);
  
  var boatFrames = boatsSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0 ; brokenBoatFrames.length; i++)  {
    var pos =  brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
    
  }

  var waterSplashFrames = waterSplashSpritedata.frames
  for (var i = 0 ; waterSplashFrames.length; i++)  {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
    
  }
  
}

function draw() {
  image(backgroundImg,0,0,width,height); 

  if(!backgroundMusic.isPlaying())  {

    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);

  }
 
  Engine.update(engine);
 
  push();
  fill("brown");
  rectMode(CENTER);
  rect(ground.position.x,ground.position.y,width*2,1);
  pop();

  push();
  imageMode(CENTER);
  image(towerImage,tower.position.x,tower.position.y,160,310);
  pop();

    showBoats();
  
  for (var i = 0; i < balls.length; i++) {
      showCannonBalls(balls[i], i);
      collisionWithBoat(i);
    }

  cannon.display();

  fill('#6d4c41');
  textSize(40);
  text(`Puntuacion: ${score} `,width -200, 50 );
  textAligne(CENTER,CENTER);

}

function keyReleased() {

  if(keyCode === DOWN_ARROW && !isGameOver) {
    
    cannonExplosion.play();
    cannonExplosion.setVolume(0.1);
    balls[balls.length - 1].shoot();
    
  }


}

function showCannonBalls (ball, index) {
  if(ball) {
    ball.display();
    ball.animate();
    if(ball.body.position.x >= width || ball.body.position.y >= height -50)  {
      waterSound.play();
      waterSound.setVolume(0.1);
      ball.remove(index);
    }
  }
}

function keyPressed () {
   
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x,cannon.y);
    cannonBall.trajectory = [];
    
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
   }

}

function showBoats ()  {

  if (boats.length > 0) {
    
    if (boats.length < 4 && boats[boats.length -1].body.position.x < width -300)  {

      var positions = [-40,-60,-70,-20];
      var position = random(positions);
      var boat = new Boat(width,height -100,170,170,position,boatAnimation);
      boats.push(boat);

    }

    for (var i = 0;i < boats.length; i++ )  {
        
        Matter.Body.setVelocity(boats[i].body,{ x: -0.9, y: 0});
        boats[i].display();
        boats[i].animate();
        var collision = Matter.SAT.collides(this.tower, boats[i].body);
        
        if(collision.collided && !boats[i].isBroken)  {
          if(!isLaughing && !pirateLaughSound.isPlaying())  {
            pirateLaughSound.play();
            isLaughing = true;

          }
          isGameOver = true;
          gameOver();
        }
    }

  } else  {

    var boat = new Boat(width, height -60, 170,170, -60,boatAnimation);
    boats.push(boat);

  }

}

function collisionWithBoat(index)  {

 for(var i = 0;boats.length; i++)  {

  if(balls[index] !== undefined && boats[i]  !== undefined)  {
   
     var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

     if(collision.collided )  {

      score += 5;
      boats[i].remove(i);
      Matter.World.remove(world, balls[index].body);
      delete balls(index);

     }
  
    } 



  

 }

}

function gameOver ()   {

  swal({
    title: `Fin del juego`,
    text: "Gracias por jugar",
    imageUrl: "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
    imageSize: "150x150",
    confirmButtonText: "Jugar de nuevo"
  }, function (isConfirm) {

    if(isConfirm)  {

      location.reload();

    }

  });


}