export default class Sound {
  constructor(sound) {
    this.audio = new Audio(sound.src);
    this.audio.volume = sound.volume;
  }

  play() {
    this.audio.play();
  }
}
