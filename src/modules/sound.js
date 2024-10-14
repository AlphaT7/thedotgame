export default class Sound {
  constructor(sound) {
    this.audio = fetch(sound.src);
    this.audioBuffer;
    this.volume = sound.volume;
    this.audioCtx;
  }

  async play() {
    let audio = await this.audio;
    this.audioCtx = this.audioCtx == null ? new AudioContext() : this.audioCtx;
    this.audioBuffer =
      this.audioBuffer == null ? audio.arrayBuffer() : this.audioBuffer;

    let audioCtx = this.audioCtx;
    let audioBuffer = (await this.audioBuffer).slice();
    let decodedAudio = await audioCtx.decodeAudioData(await audioBuffer);
    let sound = new AudioBufferSourceNode(audioCtx, { loop: false });
    let gainNode = audioCtx.createGain();
    sound.buffer = await decodedAudio;
    gainNode.gain.value = this.volume;
    sound.connect(gainNode).connect(audioCtx.destination);
    sound.start(0);
  }
}
