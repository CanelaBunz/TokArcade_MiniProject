export class GetUserInfoUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(accessToken, authCode) {
    try {
      const user = await this.userRepository.getUserInfo(accessToken, authCode);
      return user;
    } catch (error) {
      console.error('[GetUserInfoUseCase] Error:', error);
      throw error;
    }
  }
}
