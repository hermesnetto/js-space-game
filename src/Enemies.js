export default class Enemies {
  constructor(Game, canvas, ctx, sprite) {
    this.width = 59;
    this.height = 47;
    this.cx = 48;
    this.cy = 0;
    this.frequency = 300;
    this.timer = 0;
    this.elements = [];

    this.Game = Game;
    this.canvas = canvas;
    this.ctx = ctx;
    this.sprite = sprite;
  }
  
  create() {
    const posX = Math.floor(Math.random() * this.Game.width / this.width) * this.width;

    this.elements.push({
      id: new Date().getTime(),
      width: this.width,
      height: this.height,
      cx: this.cx,
      cy: this.cy,
      x: posX,
      y: -this.height,
      velocity: .5
    });
  }

  render() {
    this.elements = this.elements.map(enemy => {
      this.ctx.drawImage(
        this.sprite,
        this.cx,
        this.cy,
        this.width,
        this.height,
        enemy.x,
        enemy.y,
        this.width,
        this.height
      );

      return Object.assign({}, enemy, { y: enemy.y + 1 });
    });

    if (this.Game.state === 'PLAYING') {
      this.timer++;

      if (this.timer === this.frequency) {
        this.create();
        this.timer = 0;

        if (this.frequency >= 5) {
          this.frequency -= 5;
        }
      }
    }
  }
}