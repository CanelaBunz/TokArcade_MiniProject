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
   * Intercambia authCode por Access Token
   */
  async authenticate(authCode) {
    const response = await this.http.post('/v1/user/authenticate', {
      authcode: authCode
    });

    if (response.success && response.data) {
      return response.data; // { userId, accessToken, tokenType, expiresIn }
    }
    throw new Error(response.message || 'Fallo en la autenticación remota');
  }

  /**
   * Obtiene la información detallada del usuario
   */
  async getUserInfo(accessToken, authCode) {
    const response = await this.http.post('/v1/user/info', 
      { authCodes: [authCode] },
      { 'Authorization': `Bearer ${accessToken}` }
    );

    if (response.success && response.data) {
      return new User({
        userId: response.data.userId,
        fullName: this._extractFullName(response.data),
        nickName: response.data.nickName,
        avatar: response.data.avatar
      });
    }
    throw new Error(response.message || 'Error obteniendo información del usuario');
  }

  _extractFullName(data) {
    if (data.fullName) return data.fullName;
    return [data.firstName, data.secondName, data.lastName]
      .filter(Boolean)
      .join(' ') || 'Jugador_01';
  }
}
