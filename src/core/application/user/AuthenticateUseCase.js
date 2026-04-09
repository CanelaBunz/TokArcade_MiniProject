export class AuthenticateUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(scopes) {
    try {
      // 1. Obtener authCode del cliente
      const authCode = await this.userRepository.getAuthCode(scopes);
      
      // 2. Intercambiar por token en el servidor
      const authData = await this.userRepository.authenticate(authCode);
      
      return { 
        authCode, 
        ...authData 
      };
    } catch (error) {
      console.error('[AuthenticateUseCase] Error:', error);
      throw error;
    }
  }
}
