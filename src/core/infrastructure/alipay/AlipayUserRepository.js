import { User } from '../../domain/user/User';

export class AlipayUserRepository {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Obtiene el authCode personal del dispositivo
   */
  async getAuthCode(scopes) {
    return new Promise((resolve, reject) => {
      my.call('getUserPersonalInformationAuthCode', {
        usage: 'Autorizar datos personales para TokArcade',
        scopes: scopes,
        success: (apiRes) => {
          if (Number(apiRes.resultCode) === 10000) {
            resolve(apiRes.result);
          } else {
            reject(new Error(apiRes.resultMsg || 'Error obteniendo authCode personal'));
          }
        },
        fail: (err) => {
          reject(new Error(err.errorMessage || 'Error en getUserPersonalInformationAuthCode'));
        }
      });
    });
  }

  /**
   * Intercambia authCode por Access Token (MOCK para ignorar servidor caído)
   */
  async authenticate(authCode) {
    console.log("Mocking authentication bypass due to Toka 500 Server Error.");
    return {
      userId: "0000000000000000",
      accessToken: "mocked_jwt_token_12345",
      tokenType: "Bearer",
      expiresIn: 1800
    };
  }

  /**
   * Obtiene la información detallada del usuario (MOCK para ignorar servidor caído)
   */
  async getUserInfo(accessToken, authCode) {
    console.log("Mocking UserInfo bypass due to Toka 500 Server Error.");
    return new User({
      userId: "0000000000000000",
      fullName: "Desarrollador VIP",
      nickName: "Toka Tester",
      avatar: ""
    });
  }

  _extractFullName(data) {
    if (data.fullName) return data.fullName;
    return [data.firstName, data.secondName, data.lastName]
      .filter(Boolean)
      .join(' ') || 'Jugador_01';
  }
}
