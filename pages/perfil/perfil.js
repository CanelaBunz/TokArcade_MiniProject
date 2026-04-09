import { HttpClient } from '../../src/core/infrastructure/http/HttpClient';
import { AlipayUserRepository } from '../../src/core/infrastructure/alipay/AlipayUserRepository';
import { AuthenticateUseCase } from '../../src/core/application/user/AuthenticateUseCase';
import { GetUserInfoUseCase } from '../../src/core/application/user/GetUserInfoUseCase';

const app = getApp();

// Inyección de dependencias manual
const httpClient = new HttpClient(app.globalData.apiBaseUrl, app.globalData.appId);
const userRepository = new AlipayUserRepository(httpClient);
const authenticateUseCase = new AuthenticateUseCase(userRepository);
const getUserInfoUseCase = new GetUserInfoUseCase(userRepository);

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
      this.getTabBar().setData({ selected: 2 });
    }

    // Cargar automáticamente si no hay datos reales aún
    this.handleCargarUsuario(false);
  },

  onTapOpcion(e) {
    const label = e.currentTarget.dataset.label;
    my.showToast({ content: `Abriendo: ${label}` });
  },

  onTapPerfilHeader() {
    this.handleCargarUsuario(true);
  },

  /**
   * Ejecuta el flujo de carga usando el esquema Clean Architecture
   */
  async handleCargarUsuario(mostrarErrores) {
    if (this.data.cargandoUsuario) return;

    // Si ya tenemos datos, no repetir
    if (app.globalData.usuario && app.globalData.usuario !== 'Jugador_01') {
      this.setData({ usuario: app.globalData.usuario });
      return;
    }

    this.setData({ cargandoUsuario: true });

    try {
      // 1. Ejecutar caso de uso de autenticación
      const authData = await authenticateUseCase.execute(app.globalData.personalInfoScopes);
      
      // Guardar tokens en globalData para persistencia durante la sesión
      app.globalData.accessToken = authData.accessToken;
      app.globalData.personalInfoAuthCode = authData.authCode;

      // 2. Ejecutar caso de uso para obtener info detallada
      const user = await getUserInfoUseCase.execute(authData.accessToken, authData.authCode);
      
      // 3. Actualizar estado global y local
      app.globalData.userInfo = user;
      app.globalData.usuario = user.displayName;

      this.setData({
        usuario: user.displayName,
        cargandoUsuario: false
      });

      console.log('Usuario cargado vía Clean Architecture:', user);
    } catch (error) {
      console.error('Error en el flujo Clean Architecture:', error);
      
      this.setData({
        cargandoUsuario: false,
        usuario: app.globalData.usuario || 'Jugador_01'
      });

      if (mostrarErrores) {
        my.alert({
          title: 'Error de Perfil',
          content: error.message || 'No se pudo sincronizar con Toka.'
        });
      }
    }
  }
});