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
    cargandoUsuario: false
  },

  onShow() {
    this.setData({
      puntos: app.globalData.puntos,
      usuario: app.globalData.usuario || 'Jugador_01'
    });

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }

    this.cargarNombreUsuario(false);
  },

  onTapOpcion(e) {
    const label = e.currentTarget.dataset.label;
    console.log(`Abriendo sección: ${label}`);
    my.showToast({
      content: `Abriendo: ${label}`
    });
  },

  onTapPerfilHeader() {
    // Reintento manual discreto, sin botones de prueba
    this.cargarNombreUsuario(true);
  },

  async cargarNombreUsuario(mostrarErrores) {
    if (this.data.cargandoUsuario) return;

    // Si ya tenemos nombre real, no repetimos flujo
    if (
      app.globalData.usuario &&
      app.globalData.usuario !== 'Jugador_01' &&
      app.globalData.userInfo
    ) {
      this.setData({
        usuario: app.globalData.usuario
      });
      return;
    }

    this.setData({
      cargandoUsuario: true
    });

    try {
      const authCode = await this.obtenerAuthCodePersonal();
      await this.autenticarUsuario(authCode);
      await this.obtenerInformacionUsuario();

      this.setData({
        usuario: app.globalData.usuario || 'Jugador_01',
        cargandoUsuario: false
      });

      console.log('Nombre cargado correctamente:', app.globalData.usuario);
    } catch (error) {
      console.log('Error al cargar nombre de usuario:', error);

      this.setData({
        cargandoUsuario: false,
        usuario: app.globalData.usuario || 'Jugador_01'
      });

      if (mostrarErrores) {
        my.alert({
          title: 'No se pudo cargar tu nombre',
          content: error.message || 'No fue posible obtener la información del usuario.'
        });
      }
    }
  },

  obtenerAuthCodePersonal() {
    return new Promise((resolve, reject) => {
      my.call('getUserPersonalInformationAuthCode', {
        usage: 'Autorizar datos personales para mostrar el nombre del usuario en TokArcade',
        scopes: app.globalData.personalInfoScopes,
        success: (apiRes) => {
          console.log('getUserPersonalInformationAuthCode success:', apiRes);

          const resultCode = Number(apiRes.resultCode);

          if (resultCode === 10000) {
            const authCode = apiRes.result || '';
            const resultMsg = apiRes.resultMsg || 'Autorización exitosa';

            app.globalData.personalInfoAuthorized = true;
            app.globalData.personalInfoAuthCode = authCode;
            app.globalData.personalInfoResultMsg = resultMsg;

            resolve(authCode);
          } else if (resultCode === 10006) {
            reject(new Error(apiRes.resultMsg || 'El usuario rechazó la autorización.'));
          } else {
            reject(new Error(apiRes.resultMsg || 'No se pudo obtener el authCode personal.'));
          }
        },
        fail: (res) => {
          console.log('getUserPersonalInformationAuthCode fail:', res);

          let mensaje = 'No se pudo solicitar la autorización en este entorno.';

          if (res && res.errorMessage) {
            if (
              res.errorMessage.includes('暂不支持') ||
              res.errorMessage.includes('真机调试')
            ) {
              mensaje = 'Esta función no está disponible en el simulador. Pruébala en un dispositivo real dentro de Toka.';
            } else {
              mensaje = res.errorMessage;
            }
          }

          reject(new Error(mensaje));
        }
      });
    });
  },

  autenticarUsuario(authCode) {
    return new Promise((resolve, reject) => {
      my.request({
        url: `${app.globalData.apiBaseUrl}/v1/user/authenticate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': app.globalData.appId
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
          console.log('authenticate fail completo:', JSON.stringify(err));
  
          const serverMessage =
            err &&
            err.data &&
            err.data.message
              ? err.data.message
              : '';
  
          const serverBody =
            err &&
            err.data
              ? JSON.stringify(err.data)
              : '';
  
          const statusText =
            err && err.errorMessage
              ? err.errorMessage
              : 'HTTP error en /v1/user/authenticate';
  
          reject(
            new Error(
              serverMessage || serverBody || statusText || 'Error desconocido en authenticate'
            )
          );
        }
      });
    });
  },

  obtenerInformacionUsuario() {
    return new Promise((resolve, reject) => {
      const accessToken = app.globalData.accessToken;
      const authCode = app.globalData.personalInfoAuthCode;

      if (!accessToken) {
        reject(new Error('No existe accessToken para consultar la información del usuario.'));
        return;
      }

      if (!authCode) {
        reject(new Error('No existe authCode para consultar la información del usuario.'));
        return;
      }

      my.request({
        url: `${app.globalData.apiBaseUrl}/v1/user/info`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': app.globalData.appId,
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
            app.globalData.usuario = this.obtenerNombreMostrable(body.data);

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

  obtenerNombreMostrable(userInfo) {
    if (!userInfo) return 'Jugador_01';

    if (userInfo.fullName && String(userInfo.fullName).trim()) {
      return String(userInfo.fullName).trim();
    }

    const partes = [
      userInfo.firstName,
      userInfo.secondName,
      userInfo.lastName
    ]
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean);

    if (partes.length > 0) {
      return partes.join(' ');
    }

    return 'Jugador_01';
  }
});