//
//misc.js その他いろいろ、共通関数
//

// 星のクラス
class Star {

  constructor(){
    this.x = rand(0, FIELD_W)<<8;
    this.y = rand(0, FIELD_H)<<8;
    this.vx = 0;
    this.vy = rand(100, 200);
    this.sz = rand(1, 2);
  }

  draw(){
    const x = this.x>>8;
    const y = this.y>>8;
    if(x<camera_x || x>=camera_x+SCREEN_W || y<camera_y || y>=camera_y+SCREEN_H){
      return;
    }
    vcon.fillStyle = rand(0, 2) != 0 ? "#66f" : "#aef";
    vcon.fillRect(x, y, this.sz, this.sz);
  }

  update(){
    this.x += this.vx*starSpeed/100;
    this.y += this.vy*starSpeed/100;
    if(this.y>FIELD_H<<8){
      this.y = 0;
      this.x = rand(0, FIELD_W)<<8;
    }
  }

}

//キャラクターのベースクラス
class CharaBase
{
	constructor( snum, x,y, vx,vy )
	{
		this.sn   = snum;
		this.x    = x;
		this.y    = y;
		this.vx   = vx;
		this.vy   = vy;
		this.kill = false;
    this.count = 0;
	}

	update()
	{
		this.x += this.vx;
		this.y += this.vy;
    this.count++;

		if( this.x+(100<<8)<0 || this.x-(100<<8)>FIELD_W<<8
				|| this.y+(100<<8)<0 || this.y-(100<<8)>FIELD_H<<8 )this.kill = true;
	}

	draw()
	{
		drawSprite( this.sn, this.x , this.y );
	}
}

// 爆発のクラス
class Expl extends CharaBase{

  constructor(c, x, y, vx, vy){
    super(0, x, y, vx, vy);
    this.timer = c;
  }

  update(){
    if(this.timer){
      this.timer--;
      return;
    }
    super.update();
  }

  draw(){
    this.sn = 16 + (this.count>>2);
    if(this.sn==27){
      this.kill = true;
      return;
    }
    super.draw();
  }

}

// もっと派手な爆発
function explosion(x, y, vx, vy){
  expl.push(new Expl(0, x, y, vx, vy));
  for(let i=0;i<10;i++){
    const evx = vx+(rand(-10, 10)<<6);
    const evy = vy+(rand(-10, 10)<<6);
    expl.push(new Expl(i, x, y, evx, evy))
  }
}

//キーボードが押されたとき
document.onkeydown = function(e)
{
	key[ e.keyCode ] = true;
  if(gameOver && e.keyCode==82){
    delete jiki;
    jiki = new Jiki();
    gameOver = false;
  }
}

//キーボードが離されたとき
document.onkeyup = function(e)
{
	key[ e.keyCode ] = false;
}

//スプライトを描画する
function drawSprite( snum, x, y )
{
	let sx = sprite[snum].x;
	let sy = sprite[snum].y;
	let sw = sprite[snum].w;
	let sh = sprite[snum].h;

	let px = (x>>8) - sw/2;
	let py = (y>>8) - sh/2;

	if( px+sw <camera_x || px >=camera_x+SCREEN_W
			|| py+sh <camera_y || py >=camera_y+SCREEN_H )return;

	vcon.drawImage( spriteImage,sx,sy,sw,sh,px,py,sw,sh);
}


//整数のランダムを作る
function rand(min,max)
{
	return Math.floor( Math.random()*(max-min+1) )+min;
}

// 当たり判定
function checkHit(x1, y1, r1,  x2, y2, r2){
  // 円同士
  const a = (x2-x1)>>8;
  const b = (y2-y1)>>8;
  const r = r1+r2;

  return (r*r >= a*a + b*b);

  // 矩形同士
  // const left1 = x1>>8;
  // const right1 = left1+w1;
  // const top1 = y1>>8;
  // const bottom1 = top1+h1;
  //
  // const left2 = x2>>8;
  // const right2 = left2+w2;
  // const top2 = y2>>8;
  // const bottom2 = top2+h2;
  //
  // return( left1 <= right2 &&
  //         right1 >= left2 &&
  //         top1 <= bottom2 &&
  //         bottom1 >= top2
  //       );



}
