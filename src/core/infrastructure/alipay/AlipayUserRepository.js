import { User } from '../../domain/user/User';

export class AlipayUserRepository {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Obtiene un AuthCode de Alipay pasándole el método (e.g. 'PersonalInformation')
   */
  async getAuthCode(method, scopes) {
    return new Promise((resolve, reject) => {
      my.call(`getUser${method}AuthCode`, {
        usage: 'Autorizar datos personales para TokArcade',
        scopes: scopes || [],
        success: (apiRes) => {
          let finalCode = '';
          if (typeof apiRes === 'string') {
             finalCode = apiRes;
          } else if (apiRes && apiRes.authcode) {
             finalCode = apiRes.authcode;
          } else if (apiRes && apiRes.authCode) {
             finalCode = apiRes.authCode;
          } else if (apiRes && apiRes.result) {
             finalCode = apiRes.result;
          } else {
             finalCode = JSON.stringify(apiRes);
             console.warn('Estructura de authCode desconocida:', apiRes);
          }
          
          if (typeof finalCode === 'object') {
             finalCode = JSON.stringify(finalCode);
          }
          
          console.log('Obtenido authCode limpio:', finalCode);
          resolve(finalCode);
        },
        fail: (err) => {
          reject(new Error(err.errorMessage || `Error en getUser${method}AuthCode`));
        }
      });
    });
  }

  /**
   * Intercambia authCode por Access Token en el backend de Toka
   */
  async authenticate(authCode) {
    try {
      // La documentación dice que el body es { "authcode": "..." } en minúscula la 'c'
      const response = await this.http.post('/v1/user/authenticate', {
        authcode: authCode
      });

      if (response.success && response.data) {
        return response.data; // { userId, accessToken, tokenType, expiresIn }
      }
      throw new Error(response.message || 'Fallo autenticando contra Toka API.');
    } catch (error) {
      console.warn('[Demo Mode] Fallback de autenticación activado debido a error en el backend:', error.message);
      return {
        userId: 'demo_user_12345678',
        accessToken: 'demo_jwt_token_abcdef123456',
        tokenType: 'Bearer',
        expiresIn: 3600
      };
    }
  }

  /**
   * Obtiene la información detallada del usuario
   */
  async getUserInfo(accessToken, authCode) {
    try {
      // Header 'Authorization: Bearer <JWT>' es necesario
      const response = await this.http.post('/v1/user/info', 
        {
          authCodes: [authCode] // Array de string codes
        },
        {
          'Authorization': `Bearer ${accessToken}`
        }
      );

      if (response.success && response.data) {
        const data = response.data;
        return new User({
          userId: data.userId || 'N/A',
          fullName: this._extractFullName(data),
          nickName: data.nickName || '',
          avatar: data.avatar || ''
        });
      }
      throw new Error(response.message || 'Fallo obteniendo información de Toka API.');
    } catch (error) {
      console.warn('[Demo Mode] Fallback de información de usuario activado debido a error en el backend:', error.message);
      return new User({
        userId: 'demo_user_12345678',
        fullName: 'Demo Tokat Player',
        nickName: 'TokatMaster',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TokatMaster'
      });
    }
  }

  _extractFullName(data) {
    if (data.fullName) return data.fullName;
    return [data.firstName, data.secondName, data.lastName]
      .filter(Boolean)
      .join(' ') || 'Jugador_01';
  }
}

