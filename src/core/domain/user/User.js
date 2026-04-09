export class User {
  constructor({ userId, fullName, nickName, avatar, points = 0 }) {
    this.id = userId;
    this.fullName = fullName;
    this.nickName = nickName;
    this.avatar = avatar;
    this.points = points;
  }

  get displayName() {
    return this.fullName || this.nickName || 'Jugador_01';
  }
}
