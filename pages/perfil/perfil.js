const app = getApp();

Page({
  data: {
    puntos: 0,
    usuario: 'Jugador_01',
    opciones: [
      { label: 'Historial de Cupones' },
      { label: 'Configuración' },
      { label: 'Soporte' }
    ],

    personalInfoAuthorized: false,
    personalInfoAuthCode: '',
    personalInfoResultMsg: '',
    requestingAuth: false,

    userId: '',
    accessToken: '',
    userInfo: null
  },

  onShow() {
    this.setData({
      puntos: app.globalData.puntos,
      usuario: app.globalData.usuario,
      personalInfoAuthorized: app.globalData.personalInfoAuthorized,
      personalInfoAuthCode: app.globalData.personalInfoAuthCode,
      personalInfoResultMsg: app.globalData.personalInfoResultMsg,
      userId: app.globalData.userId,
      accessToken: app.globalData.accessToken,
      userInfo: app.globalData.userInfo
    });

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },

  onTapOpcion(e) {
    const label = e.currentTarget.dataset.label;
    console.log(`Abriendo sección: ${label}`);
    my.showToast({ content: `Abriendo: ${label}` });
  },

  solicitarAutorizacionPersonal() {
    if (this.data.requestingAuth) return;

    this.setData({
      requestingAuth: true
    });

    my.call('getUserPersonalInformationAuthCode', {
      usage: 'Autorizar datos personales para pruebas de TokArcade',
      scopes: app.globalData.personalInfoScopes,

      success: async (apiRes) => {
        console.log('getUserPersonalInformationAuthCode success:', apiRes);

        const resultCode = Number(apiRes.resultCode);

        if (resultCode === 10000) {
          const authCode = apiRes.result || '';
          const resultMsg = apiRes.resultMsg || 'Autorización exitosa';

          app.globalData.personalInfoAuthorized = true;
          app.globalData.personalInfoAuthCode = authCode;
          app.globalData.personalInfoResultMsg = resultMsg;

          this.setData({
            personalInfoAuthorized: true,
            personalInfoAuthCode: authCode,
            personalInfoResultMsg: resultMsg
          });

          my.showLoading({
            content: 'Autenticando usuario...'
          });

          try {
            await this.autenticarUsuario(authCode);
            await this.obtenerInformacionUsuario();
            my.hideLoading();

            this.setData({
              requestingAuth: false,
              userId: app.globalData.userId,
              accessToken: app.globalData.accessToken,
              userInfo: app.globalData.userInfo
            });

            my.alert({
              title: 'Éxito',
              content: 'Autorización, autenticación y consulta de usuario completadas.'
            });
          } catch (error) {
            my.hideLoading();

            this.setData({
              requestingAuth: false
            });

            my.alert({
              title: 'Error en backend',
              content: error.message || 'No se pudo completar el flujo de usuario.'
            });
          }
        } else if (resultCode === 10006) {
          const resultMsg = apiRes.resultMsg || 'El usuario rechazó la autorización.';

          app.globalData.personalInfoAuthorized = false;
          app.globalData.personalInfoAuthCode = '';
          app.globalData.personalInfoResultMsg = resultMsg;

          this.setData({
            personalInfoAuthorized: false,
            personalInfoAuthCode: '',
            personalInfoResultMsg: resultMsg,
            requestingAuth: false
          });

          my.alert({
            title: 'Autorización rechazada',
            content: resultMsg
          });
        } else {
          const resultMsg = apiRes.resultMsg || 'Ocurrió un error en la autorización.';

          app.globalData.personalInfoAuthorized = false;
          app.globalData.personalInfoAuthCode = '';
          app.globalData.personalInfoResultMsg = resultMsg;

          this.setData({
            personalInfoAuthorized: false,
            personalInfoAuthCode: '',
            personalInfoResultMsg: resultMsg,
            requestingAuth: false
          });

          my.alert({
            title: 'apiRes ERROR',
            content: JSON.stringify(apiRes)
          });
        }
      },

      fail: (res) => {
        console.log('getUserPersonalInformationAuthCode fail:', res);

        this.setData({
          requestingAuth: false
        });

        let mensaje = 'No se pudo solicitar la autorización en este entorno.';

        if (res && res.errorMessage) {
          if (
            res.errorMessage.includes('暂不支持') ||
            res.errorMessage.includes('真机调试')
          ) {
            mensaje = 'Esta función no está disponible en el simulador. Pruébala en un dispositivo real dentro de Toka.';
          }
        }

        my.alert({
          title: 'Prueba en dispositivo real',
          content: mensaje
        });
      }
    });
  },

  autenticarUsuario(authCode) {
    return new Promise((resolve, reject) => {
      const appId = app.globalData.appId;
      const apiBaseUrl = app.globalData.apiBaseUrl;

      if (!appId || appId === 'PON_AQUI_TU_APP_ID') {
        reject(new Error('Falta configurar app.globalData.appId con el App ID real.'));
        return;
      }

      my.request({
        url: `${apiBaseUrl}/v1/user/authenticate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': appId
        },
        data: {
          authcode: authCode
        },
        success: (res) => {
          console.log('authenticate response:', res);

          const body = res.data || {};

          if (body.success && body.data) {
            app.globalData.userId = body.data.userId || '';
            app.globalData.accessToken = body.data.accessToken || '';
            app.globalData.tokenType = body.data.tokenType || 'Bearer';
            app.globalData.expiresIn = body.data.expiresIn || 0;

            resolve(body.data);
          } else {
            reject(new Error(body.message || 'Falló la autenticación del usuario.'));
          }
        },
        fail: (err) => {
          console.log('authenticate fail:', err);
          reject(new Error('No se pudo llamar /v1/user/authenticate'));
        }
      });
    });
  },

  obtenerInformacionUsuario() {
    return new Promise((resolve, reject) => {
      const appId = app.globalData.appId;
      const apiBaseUrl = app.globalData.apiBaseUrl;
      const accessToken = app.globalData.accessToken;
      const authCode = app.globalData.personalInfoAuthCode;

      if (!accessToken) {
        reject(new Error('No existe accessToken para consultar la información del usuario.'));
        return;
      }

      if (!authCode) {
        reject(new Error('No existe authCode personal para consultar la información del usuario.'));
        return;
      }

      my.request({
        url: `${apiBaseUrl}/v1/user/info`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': appId,
          'Authorization': `Bearer ${accessToken}`
        },
        data: {
          authCodes: [authCode]
        },
        success: (res) => {
          console.log('user info response:', res);

          const body = res.data || {};

          if (body.success && body.data) {
            app.globalData.userInfo = body.data;

            if (body.data.fullName) {
              app.globalData.usuario = body.data.fullName;
            } else if (body.data.firstName) {
              app.globalData.usuario = body.data.firstName;
            }

            resolve(body.data);
          } else {
            reject(new Error(body.message || 'No se pudo obtener la información del usuario.'));
          }
        },
        fail: (err) => {
          console.log('user info fail:', err);
          reject(new Error('No se pudo llamar /v1/user/info'));
        }
      });
    });
  },

  limpiarAutorizacionPersonal() {
    app.globalData.personalInfoAuthorized = false;
    app.globalData.personalInfoAuthCode = '';
    app.globalData.personalInfoResultMsg = '';
    app.globalData.userId = '';
    app.globalData.accessToken = '';
    app.globalData.tokenType = 'Bearer';
    app.globalData.expiresIn = 0;
    app.globalData.userInfo = null;

    this.setData({
      personalInfoAuthorized: false,
      personalInfoAuthCode: '',
      personalInfoResultMsg: '',
      userId: '',
      accessToken: '',
      userInfo: null
    });

    my.showToast({
      content: 'Autorización limpiada'
    });
  }
});