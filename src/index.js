import songs from './songs';
import keys from './keys';
import { lerp, getMousePos, hit } from './utils';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const bg = new Image();
const sprite = new Image();

bg.src = './background.png';
sprite.src = './spritesheet.png';


songs.background();

const Game = {
  width: canvas.width,
  height: canvas.height,
  cx: 0,
  cy: 550,
  state: 'PAUSED', //PAUSED || STOPPED || PLAYING
  score: 0,
  btnPlay: {},
  stop: function stop() {
    this.state = 'STOPPED';
  },
  gameOver: function gameOver() {
    this.state = 'GAME_OVER';
  },
  updateScore: function updateScore() {
    this.score += 1;
  },
  makeButton: function makeButton(message, color) {
    ctx.save();
    ctx.font = '48px monospace';
    
    const text = ctx.measureText(message);
    const posX = ((Game.width / 2) - (text.width / 2));
    const posY = Game.height / 2;

    this.btnPlay.x = posX - 10;
    this.btnPlay.y = posY - 45;
    this.btnPlay.width = text.width + 20;
    this.btnPlay.height = 60;
    this.btnPlay.fill = color;
    
    ctx.strokeStyle = this.btnPlay.fill;
    ctx.strokeText(message, posX, posY);

    ctx.strokeStyle = color;
    ctx.strokeRect(this.btnPlay.x, this.btnPlay.y, this.btnPlay.width, this.btnPlay.height);
    ctx.restore();
  },
  restart: function restart() {
    this.state = 'PLAYING';
    this.scorr = 0;
    Asteroids.restart();
    Enemies.restart();
    Ship.restart();
  },
  render: function render() {
    ctx.drawImage(bg, this.cx, this.cy, this.width, this.height, 0, 0, this.width, this.height);

    ctx.save();
    ctx.font = '24px monospace';
    ctx.strokeStyle = '#fff';
    ctx.strokeText(`SCORE: ${this.score}`, 20, 30);
    ctx.restore();

    if (this.state === 'PAUSED') {
      this.makeButton('INICIAR', '#fff');
    } else if (this.state === 'PLAYING') {
      this.cy = (this.cy <= 0) ? 550 : this.cy - 1;
    } else if (this.state === 'GAME_OVER') {
      this.makeButton('GAME OVER', 'red');
    }
  }
};

const Shots = {
  types: {
    SHIP: 'SHIP',
    ENEMY: 'ENEMY'
  },
  elements: [],
  create: function create(type, x, y, color) {
    this.elements.push({
      id: new Date().getTime(),
      x: x,
      y: y,
      raio: 2,
      fill: color,
      velocity: 5,
      type: type
    });
    
    songs.shot();
  },
  destroy: function destroy(targetId) {
    this.element = this.element.filter(shot => shot.id !== id);
  },
  render: function render() {
    if (this.elements.length) {
      ctx.save();
      
      this.elements = this.elements.map(shot => {
        ctx.beginPath();
        ctx.fillStyle = shot.fill;
        ctx.arc(shot.x + shot.raio, shot.y + shot.raio, shot.raio, 0, 2 * Math.PI);
        ctx.fill();

        const targetY = (shot.type === this.types.SHIP) ? shot.y - shot.velocity : shot.y + shot.velocity;
        
        return Object.assign({}, shot, { y: targetY })
      });

      const checkHit = (shot, Obj, elements, sumScore) => {
        return !elements.every(item => {
          if (hit(shot, item)) {
            Game.updateScore();
            Obj.destroy(item.id);
            return false;
          }

          return true;
        });
      };

      const hitInShip = shot => {
        const status = checkHit(shot, Ship, [ Ship ]);

        if (status) {
          Game.stop();
          window.setTimeout(() => Game.gameOver(), 2000);
          return true;
        }

        return false;
      }
      const hitInEnemies = shot => checkHit(shot, Asteroids, Asteroids.elements);
      const hitinAsteroid = shot => checkHit(shot, Enemies, Enemies.elements);

      this.elements = this.elements.filter(shot => {
        if (shot.y < 0) {
          return false;
        } else if (hitinAsteroid(shot)) {
          return false;
        } else if (hitInEnemies(shot)) {
          return false;
        } else if (hitInShip(shot)) {
          return false;
        }

        return true;
      });

      ctx.restore();
    }
  }
};

const Ship = {
  x: ((Game.width / 2) - (47 / 2)),
  y: (Game.height - 41 - 20),
  cx: 0,
  cy: 0,
  width: 47,
  height: 41,
  movingDir: 'LTR',
  isMoving: false,
  distance: 10,
  velocity: 10,
  maxVelocity: 30,
  shot: function shot() {
    if (Game.state === 'PLAYING') {
      const shotX = (this.x + (this.width / 2) - 2);
      const shotY = (this.y - 2);
  
      Shots.create(Shots.types.SHIP, shotX, shotY, '#fff');
    }
  },
  moveToLeft: function moveToLeft() {
    const targetPosition = this.x - lerp(this.x, (this.x + this.distance));

    if (targetPosition >= 5) {
      this.x = targetPosition;
    }
  },
  moveToRight: function moveToRight() {
    const targetPosition = this.x + lerp(this.x, (this.x + this.distance));

    if (targetPosition + this.width <= Game.width - 5) {
      this.x = targetPosition;
    }
  },
  destroy: function destroy() {
    songs.explosion();
  
    this.cx = 101;
    this.cy = 57;
  },
  restart: function restart() {
    this.cx = 0;
    this.cy = 0;
  },
  render: function render() {
    ctx.drawImage(
      sprite,
      this.cx,
      this.cy,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );

    if (Game.state === 'PLAYING' && this.isMoving) {
      if (this.movingDir === 'LTR') this.moveToRight();
      else this.moveToLeft();
    }
  }
};

const Asteroids ={
  frequency: 200,
  timer: 0,
  elements: [],
  create: function create() {
    const width = 57;
    const height = 53;
    const posX = Math.floor(Math.random() * Game.width / width) * width;

    this.elements.push({
      id: new Date().getTime(),
      width: width,
      height: height,
      cx: 108,
      cy: 5,
      x: posX,
      y: -height,
      velocity: .5
    });
  }, 
  destroy: function destroy(targetId) {
    songs.explosion();
  
    this.elements = this.elements.map(asteroid => {
      return Object.assign({}, asteroid, {
        cx: (asteroid.id === targetId) ? 167 : asteroid.cx
      });
    });

    window.setTimeout(() => {
      this.elements = this.elements.filter(asteroid => asteroid.id !== targetId);
    }, 100);
  },
  restart: function restart() {
    this.elements = [];
  },
  render: function render() {
    this.elements = this.elements.map(asteroid => {
      if (Game.state === 'PLAYING' && hit(Ship, asteroid)) {
        Ship.destroy();
        Game.stop();

        window.setTimeout(() => Game.gameOver(), 2000);
      }

      ctx.drawImage(
        sprite,
        asteroid.cx,
        asteroid.cy,
        asteroid.width,
        asteroid.height,
        asteroid.x,
        asteroid.y,
        asteroid.width,
        asteroid.height
      );

      const targetY = (Game.state === 'PLAYING')
        ? asteroid.y + asteroid.velocity
        : asteroid.y;
      
      const velocityTarget = (Game.state === 'PLAYING')
        ? asteroid.velocity + 0.01
        : asteroid.velocity;

      return Object.assign({}, asteroid, {
        y: targetY,
        velocity: velocityTarget
      });
    });

    if (Game.state === 'PLAYING') {
      this.elements = this.elements.filter(asteroid => asteroid.y < Game.height);

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
};

const Enemies = {
  width: 59,
  height: 47,
  cx: 48,
  cy: 0,
  frequency: 300,
  timer: 0,
  elements: [],
  frequencyCreate: 3,
  frequencyTimer: 0,
  create: function create() {
    const posX = Math.floor(Math.random() * Game.width / this.width) * this.width;

    this.elements.push({
      id: new Date().getTime(),
      width: this.width,
      height: this.height,
      cx: this.cx,
      cy: this.cy,
      x: posX,
      y: -this.height,
      velocity: .5,
      shotTimer: 0,
      moviment: (() => {
        this.frequencyTimer++;
    
        if (this.frequencyTimer === this.frequencyCreate) {
          this.frequencyTimer = 0;
          return 'CRAZY';
        }

        return 'NORMAL';
      })(),
      dir: (posX >= (Game.width / 2)) ? 'RTL' : 'LTR',
      shot: function shot() {
        if (Game.state === 'PLAYING') {
          const shotX = (this.x + (this.width / 2) - 2);
          const shotY = (this.y + this.height + 2);
      
          Shots.create(Shots.types.ENEMY, shotX, shotY, 'red');
        }
      }
    });
  },
  destroy: function destroy(targetId) {
    songs.explosion();
  
    this.elements = this.elements.map(enemy => {
      return Object.assign({}, enemy, {
        cx: (enemy.id === targetId) ? 43 : enemy.cx,
        cy: (enemy.id === targetId) ? 83 : enemy.cy
      });
    });

    window.setTimeout(() => {
      this.elements = this.elements.filter(enemy => enemy.id !== targetId);
    }, 100);
  },
  restart: function restart() {
    this.elements = [];
  },
  render: function render() {
    this.elements = this.elements.map(enemy => {
      if (Game.state === 'PLAYING' && hit(Ship, enemy)) {
        Ship.destroy();
        Game.stop();

        window.setTimeout(() => Game.gameOver(), 2000);
      }

      ctx.drawImage(
        sprite,
        enemy.cx,
        enemy.cy,
        enemy.width,
        enemy.height,
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height
      );

      enemy.shotTimer++;

      if (enemy.shotTimer === 60) {
        enemy.shot();
        enemy.shotTimer = 0;
      }

      const targetY = (Game.state === 'PLAYING')
        ? enemy.y + enemy.velocity
        : enemy.y;

      let targetX = enemy.x;
      let targetDir = enemy.dir;
      
      if (Game.state === 'PLAYING' && enemy.moviment === 'CRAZY') {
        if (enemy.dir === 'LTR') {
          if (enemy.x + enemy.width <= Game.width - 5) 
            targetX = enemy.x + 1;
          else
            targetDir = 'RTL';
        } else {
          if (enemy.x >= 5)
            targetX = enemy.x - 1;
          else
            targetDir = 'LTR';
        }
      }

      const velocityTarget = (Game.state === 'PLAYING')
        ? enemy.velocity + 0.01
        : enemy.velocity;

      return Object.assign({}, enemy, {
        y: targetY,
        x: targetX,
        dir: targetDir,
        velocity: velocityTarget
      });
    });

    if (Game.state === 'PLAYING') {
      this.elements = this.elements.filter(enemy => enemy.y < Game.height);

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
};

const render = () => {
  // limpa o canvas
  ctx.clearRect(0, 0, Game.width, Game.height);

  // adiciona o background
  Game.render();
  
  if (Game.state === 'PLAYING' || Game.state === 'STOPPED') {
    // adiciona a nave
    Ship.render();
    // adiciona os asteroids
    Asteroids.render();
    // adiciona os inimigos
    Enemies.render();
    // tiros
    Shots.render();
  }

  window.requestAnimationFrame(render);
};

const handleKeydown = e => {
  const key = e.keyCode;

  const setDirection = (dir) => {
    Ship.movingDir = dir;
    Ship.isMoving = true;
  }

  switch (key) {
    case keys.A:
    case keys.LEFT_ARROW:
      setDirection('RTL');
      break;
    case keys.D:
    case keys.RIGHT_ARROW:
      setDirection('LTR');
      break;
    case keys.SPACE:
      Ship.shot();
      break;
  }

  if (Ship.isMoving) {
    if (Ship.distance <= Ship.maxVelocity) Ship.distance += Ship.velocity;
  }
};

const handleKeyup = e => {
  const key = e.keyCode;

  if (key !== keys.SPACE) Ship.isMoving = false;
};

const handleMousemove = e => {
  const pos = getMousePos(canvas, e);

  if (hit(pos, Game.btnPlay)) {
    Game.btnPlay.fill = 'red';
    canvas.classList.add('mouse-click');
  } else {
    Game.btnPlay.fill = '#fff';
    canvas.classList.remove('mouse-click');
  }
}

const handleClick = e => {
  const pos = getMousePos(canvas, e);

  if (Game.state === 'PAUSED' && hit(pos, Game.btnPlay))
    Game.state = 'PLAYING';
}

window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);
canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousemove', handleMousemove);

sprite.onload = render();
