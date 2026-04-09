export class GameSession {
  constructor(id, title) {
    this.id = id;
    this.title = title;
    this.score = 0;
    this.status = 'READY'; // READY, PLAYING, PAUSED, ENDED
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.status = 'PLAYING';
    this.startTime = new Date();
  }

  pause() {
    if (this.status === 'PLAYING') {
      this.status = 'PAUSED';
    }
  }

  resume() {
    if (this.status === 'PAUSED') {
      this.status = 'PLAYING';
    }
  }

  end() {
    this.status = 'ENDED';
    this.endTime = new Date();
  }

  addPoints(points) {
    this.score += points;
  }

  getDurationInSeconds() {
    if (!this.startTime) return 0;
    const end = this.endTime || new Date();
    return Math.floor((end - this.startTime) / 1000);
  }
}
