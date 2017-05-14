const Songs = {
  _explosion: new Audio('explosion.wav'), 
  _shot: new Audio('laser.ogg'),
  _background: new Audio('sound-background.mp3'),

  background: function background() {
    this._background.currentTime = 0;
    this._background.play();
    this._background.volume -= 0.9;
  },

  explosion: function explosion() {
    this._explosion.currentTime = 0;
    this._explosion.play();
  },

  shot: function explosion() {
    this._shot.currentTime = 0;
    this._shot.play();
  }
};

export default Songs;