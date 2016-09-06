var canvas;
var player;
var anchoPlayer;
var altoPlayer;

var bombillos;
var disparos;

var playerImage, disparoImagen, particleImage, backgroundImg, colisionparticleImage;

var score = 0;

var cityImage, spriteCity;
var nubesImage, spriteNubes;

var posXCerca = 0;
var posYCerca = 0;
var posXmitad = 0;
var posYmitad = 0;
var posXLejos = 0;
var posYLejos = 0;

var animacionBombillo;
var animacionExplotion;

var sonidodisparo;
var sonidoExterminado;

function preLoad()
{
    // Cargamos imagenes
    disparoImagen = loadImage("img/disparoNave.png");
    colisionparticleImage = loadImage("img/asteroids_bullet.png");
    playerImage = loadImage("img/celular1.png");
    particleImage = loadImage("img/1.png");
    cityImage = loadImage("img/city.png");
    nubesImage = loadImage("img/nubes.png");
    
    // carga de animaciones (bombillo)
    animacionBombillo = loadAnimation("img/1.png","img/18.png");
                                      
    // carga de la animacion que explota
    animacionExplotion = loadAnimation("img/explotion1.png","img/explotion13.png"); 
                                        
    // cambiamos default de load lectura de la explosion
    animacionExplotion.looping = false; 
}

function setup() 
{
  preLoad(); 
  
  sonidodisparo = loadSound('sonidos/disparo.mp3');
  sonidoExterminado = loadSound('sonidos/exterminado.mp3');
                
  canvas = createCanvas(800, 600);
  canvas.parent(lienzo);
  
  posXCerca = width/2;
  posYCerca = 0;
  
  posYmitad = 420;
  posXmitad = 900;
  
  posXLejos = 0;
  posYLejos = 90;  
    
  // nubes
  spriteNubes = createSprite(-400, 220, 800, 600);    
  spriteNubes.addImage(nubesImage);
  spriteNubes.setSpeed(0.5, 0); 
  
  // ciudad        
  spriteCity = createSprite(-700, 330, 800, 600);    
  spriteCity.addImage(cityImage);
  spriteCity.setSpeed(1.5, 0);  
  
  // player
  anchoPlayer = 40;
  altoPlayer = 150;
  player = createSprite(width-anchoPlayer,height/2,anchoPlayer,altoPlayer);
  //player.shapeColor = color(255, 0, 212);  
  player.addImage("normal", playerImage);
  player.rotation = -90;
  
  // creamos el grupo de bombillos
  bombillos = new Group();
  
  // numero de bombillos que añadimos al grupo 
  for (var i = 0; i < 20; i++) 
  {
      createBombillo(2, random(width/2), random(height));
  }
  
  disparos = new Group();
  
  // fijamos volumen
  sonidodisparo.setVolume(0.1);
  sonidoExterminado.setVolume(0.1);

}

function draw() 
{
  background(0,0,0);
  
  // esta seria con un easing para mover el player
  player.velocity.y = (mouseY - player.position.y) * 0.2;
  
  // movemos los fondos y actualizamos 
  if(spriteCity.position.x > width + 700)
  spriteCity.position.x = width - 1500;
  
  if(spriteNubes.position.x > width + 400)
  spriteNubes.position.x = width - 1400;
        
  // reestablece la posicion de los bombillos
  for (var i = 0; i < bombillos.length; i++) 
  {
      if(bombillos[i].position.y < 0)
      {
          bombillos[i].position.y = height;
      } 
  }
     
  //disparamos
  if(keyWentDown('x') || (mouseIsPressed))
  {
        disparar();
  }
  
  // colisiones con la libreria play.js
  
  // cuando sobre los bombillos esta el disparo
  // se ejecuta la animacion
  bombillos.overlap(disparos, bombilloColisionado);
  
  // cuando sobre los disparos esta el bombillo
  // actualizamos el score
  disparos.overlap(bombillos, actualizarScore);
  
  // degub info
  /*
  noStroke();
  fill(12, 249, 206);
  textSize(13);
  text("posX mouse:  "+int(mouseX), width/2, height/2);
  text("posY mouse:  "+int(mouseY), width/2, height/2+24);
  */

  drawSprites();
  
  // dibujamos el score
  noStroke();
  fill(255, 245, 11);
  textSize(30);
  
  score = bombillos.length;
  
  if( bombillos.length > 0)
  {
      text("score "+score, 25, 40);
  }
  else {
      text("TU GANAS !", width/2 - 100, height/2);
  }
 
}

function createBombillo(type, x, y)
{
    var bombilloWidth = 20;
    var bombilloheight = 80;
    var bombillo = createSprite(x, y,bombilloWidth,bombilloheight);
    var img = loadImage("img/1"+floor(random(0,3))+".png");
    //bombillo.addImage(img);
    
    bombillo.addAnimation("defecto", animacionBombillo);
    bombillo.shapeColor = color(10, 96, 214);
    bombillo.setSpeed(2.5-random(type/2), 270);
    bombillo.type = type;
  
    // el type serian como las vidas de los bombillos
    if(type == 2)
        bombillo.scale = .6;
    if(type == 1)
        bombillo.scale = .3;
  
    bombillo.mass = 2+bombillo.scale;
    bombillo.setCollider("circle", 0, 0, 50);
    bombillos.add(bombillo);
    return bombillo;
}

function bombilloColisionado(bombillo, disparo) {
var newType = bombillo.type-1;

// cuando es la primera colision del bombillo con el disparo
if(newType>0) 
{
  createBombillo(newType, bombillo.position.x, bombillo.position.y);
  createBombillo(newType, bombillo.position.x, bombillo.position.y);
  
  for(var i=0; i<10; i++) {
    var explocionDibujada = createSprite(disparo.position.x, disparo.position.y, 20, 20);
    explocionDibujada.addImage(colisionparticleImage);
    explocionDibujada.shapeColor = color(245, 59, 10);
    explocionDibujada.setSpeed(random(3,5), random(360));
    explocionDibujada.friction = 0.95;
    explocionDibujada.life = 15;
    }
  }

// cuando es la segunda colision, disparamos la animacion
if (newType == 0)
{
    var colision = createSprite(disparo.position.x, disparo.position.y, 20, 20); 
    var imgExplotion = loadImage("img/explotion13.png");
    //colision.addImage(imgExplotion);
    colision.addAnimation("explosion", animacionExplotion);
    //colision.shapeColor = color(10, 96, 214);
    sonidoExterminado.play();

} 

// cuando se terminan los eventos de colision, 
// retiramos el disparo y el bombillo respectivo
disparo.remove();
bombillo.remove();

}

function actualizarScore()
{
    score -= 1;
}

function disparar()
{
    var disparoAncho = 60;
    var disparoAlto = 6;
    var disparo = createSprite(width+anchoPlayer,height/2, disparoAncho, disparoAlto);
    disparo.shapeColor = color(255, 0, 0);
    disparo.addImage(disparoImagen);
    disparo.mirrorX(-1);
    //disparo.velocity.y = 0;
    //disparo.velocity.x = -7; 
    disparo.setSpeed(8.5, 180);
    disparo.position.x = player.position.x-anchoPlayer;
    disparo.position.y = player.position.y;
    disparo.friction = 0.995;
    disparo.life = 180;
    disparos.add(disparo);
    sonidodisparo.play();
    
    if(disparo.position.x < 0)
    {
        disparo.remove();
    }
}
