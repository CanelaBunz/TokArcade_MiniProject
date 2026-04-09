export class AuthenticateUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(scopes) {
    try {
      // 1. Obtener authCode del cliente (por defecto usamos PersonalInformation o el que definan los scopes)
      const authCode = await this.userRepository.getAuthCode('PersonalInformation', scopes);
      
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
