// デバッグフラグ
const DEBUG = false;

let drawCount = 0;
let fps = 0;
let lastTime = Date.now();

//スムージング
const SMOOTHING = false;

// ゲームスピード
const GAME_SPEED = 1000/60;

// 画面サイズ
const SCREEN_W = 320;
const SCREEN_H = 320;

// キャンバスサイズ
const CANVAS_W = SCREEN_W *1.5;
const CANVAS_H = SCREEN_H *1.5;

// フィールドサイズ
const FIELD_W = SCREEN_W +120;
const FIELD_H = SCREEN_H +40;

// 星の数
const STAR_MAX = 300;

// キャンバス
const can = document.getElementById("can");
const con = can.getContext("2d");
can.width = CANVAS_W;
can.height = CANVAS_H;
con.mozimageSmoothingEnagbled   = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled     = SMOOTHING;
con.imageSmoothingEnabled       = SMOOTHING;
con.font = "20px 'Impact'";

// フィールド（仮想画面）
const vcan = document.createElement("canvas");
const vcon = vcan.getContext("2d");
vcan.width = FIELD_W;
vcan.height = FIELD_H;
vcon.font = "12px 'Impact'";

// カメラの座標
let camera_x = 0;
let camera_y = 0;

let gameOver = false;
let score = 0;

//ボスのHP
let bossHP = 0;
let bossMHP = 0;

// 星の実体
const star = [];

// キーボードの状態
const key=[];

//オブジェクト達
const teki=[];
const tama=[];
const teta=[];
const expl=[];
let jiki = new Jiki();

// ファイル読み込み
const spriteImage = new Image();
spriteImage.src = "sprite.png";

// ゲーム初期化
function gameInit(){
  for(let i = 0; i < STAR_MAX; i++)star[i] = new Star();
  setInterval(gameLoop, GAME_SPEED);
}

// オブジェクトをアップデート
function updateObj(obj){
  for(let i = obj.length-1; i >= 0; i--){
    obj[i].update();
    if(obj[i].kill)obj.splice(i, 1);
  }
}

// オブジェクトを描画
function drawObj(obj){
  for(let i = 0; i < obj.length; i++)obj[i].draw();
}

// 移動処理
function updateAll(){
  updateObj(star);
  updateObj(tama);
  updateObj(teta);
  updateObj(teki);
  updateObj(expl);
  if(!gameOver)jiki.update();
}

// 描画処理
function drawAll(){
  //描画処理
  vcon.fillStyle=jiki.damage ? "red" : "black";
  vcon.fillRect(camera_x, camera_y, SCREEN_W, SCREEN_H);
  drawObj(star);
  drawObj(teki);
  drawObj(tama);
  drawObj(expl);
  drawObj(teta);
  if(!gameOver)jiki.draw();

  //自機の範囲 0~FIELD_W
  // カメラの範囲　0~(FILED_W-SCREEN_W)
  camera_x = Math.floor((jiki.x>>8)/FIELD_W * (FIELD_W-SCREEN_W));
  camera_y = Math.floor((jiki.y>>8)/FIELD_H * (FIELD_H-SCREEN_H));

  // ボスのHPを表示する
  if(bossHP>0){
    let sz = (SCREEN_W-20)*bossHP/bossMHP;
    let sz2 = (SCREEN_W-20);

    vcon.fillStyle = "rgba(255, 0, 0, 0.5)";
    vcon.fillRect(camera_x+10, camera_y+10, sz, 10);
    vcon.strokeStyle = "rgba(255, 0, 0, 0.9)";
    vcon.strokeRect(camera_x+10, camera_y+10, sz2, 10);
  }

  // 自機のHPを表示する
  if(jiki.hp>0){
    let sz = (SCREEN_W-20)*jiki.hp/jiki.mhp;
    let sz2 = (SCREEN_W-20);

    vcon.fillStyle = "rgba(0, 255, 0, 0.5)";
    vcon.fillRect(camera_x+10, camera_y+SCREEN_H-14, sz, 10);
    vcon.strokeStyle = "rgba(0, 255, 0, 0.9)";
    vcon.strokeRect(camera_x+10, camera_y+SCREEN_H-14, sz2, 10);
  }

  // スコアの表示
  vcon.fillStyle = "white";
  vcon.fillText("SCORE "+score, camera_x+10, camera_y+14 );

  // 仮想画面から実際のキャンバスにコピー
  con.drawImage(vcan, camera_x, camera_y, SCREEN_W, SCREEN_H, 0, 0, CANVAS_W, CANVAS_H);
}

function gameOverText(s, x, y){
  const w = con.measureText(s).width;
  x -= w/2;
  y -= 20;
  con.fillText(s, x, y);
}

// 情報の表示
function putInfo(){
  con.fillStyle = "white";

  if(gameOver){
    gameOverText("GAME OVER", CANVAS_W/2,  CANVAS_H/2);
    gameOverText("Push 'R' key to restart!", CANVAS_W/2,  CANVAS_H/2+20);
  }


  if(DEBUG){
    drawCount++;
    if(lastTime+1000 <= Date.now()){
      fps = drawCount;
      drawCount = 0;
      lastTime = Date.now();
    }

    con.fillText("FPS :" + fps, 20, 20);
    con.fillText("Tama:" + tama.length, 20, 40);
    con.fillText("Tama:" + teki.length, 20, 60);
    con.fillText("Teta:" + teta.length, 20, 80);
    con.fillText("X:" + (jiki.x>>8), 20, 100);
    con.fillText("Y:" + (jiki.y>>8), 20, 120);
    con.fillText("HP:" + jiki.hp, 20, 140);
    con.fillText("SCORE:" + score, 20, 160);
    con.fillText("COUNT:" + gameCount, 20, 180);
    con.fillText("WAVE:" + gameWave, 20, 200);
  }
}

let gameCount = 0;
let gameWave = 0;
let gameRound = 0;

let starSpeed = 100;
let starSpeedReq = 100;

// ゲームループ
function gameLoop(){

  gameCount++
  if(starSpeedReq>starSpeed)starSpeed++;
  if(starSpeedReq<starSpeed)starSpeed--;

  if(gameWave==0){
    if(rand(0, 30) == 1){
      teki.push(new Teki(1, rand(0,FIELD_W)<<8, 0, 0, rand(300, 1200)));
    }
    if(gameCount > 60*20){
      gameWave++;
      gameCount = 0;
      starSpeedReq=200;
    }
  }else if(gameWave==1){
    if(rand(0, 30) == 1){
      teki.push(new Teki(0, rand(0,FIELD_W)<<8, 0, 0, rand(300, 1200)));
    }
    if(gameCount > 60*20){
      gameWave++;
      gameCount = 0;
      starSpeedReq=100;
    }
  }else if(gameWave==2){
    if(rand(0, 15) == 1){
      let r = rand(0, 1);
      teki.push(new Teki(r, rand(0,FIELD_W)<<8, 0, 0, rand(300, 1200)));
    }
    if(gameCount > 60*20){
      gameWave++;
      gameCount = 0;
      teki.push(new Teki(2, FIELD_W/2<<8, -(70<<8), 0, 200));
      starSpeedReq=600;
    }
  }if(gameWave==3){

    if(teki.length == 0){
      gameWave = 0;
      gameCount = 0
      starSpeedReq=100;
    }
  }



  updateAll();
  drawAll();
  putInfo();
}

window.onload = function(){
  gameInit();
}
