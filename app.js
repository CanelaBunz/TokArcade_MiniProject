App({
  onLaunch() {
    console.log('TokArcade Mini App lanzada');
  },

  onShow() {
    console.log('TokArcade visible');
  },

  globalData: {
    puntos: 0,
    usuario: 'Jugador_01',

    apiBaseUrl: 'https://talentland-toka.eastus2.cloudapp.azure.com',
    appId: '3500020265482079',

    personalInfoAuthorized: false,
    personalInfoAuthCode: '',
    personalInfoResultMsg: '',

    // Mejor alineado con la guía de desarrollo
    personalInfoScopes: [
      'USER_NAME',
      'USER_FIRST_SURNAME',
      'USER_SECOND_SURNAME',
      'USER_GENDER',
      'USER_BIRTHDAY',
      'USER_STATE_OF_BIRTH',
      'USER_NATIONALITY'
    ],

    userId: '',
    accessToken: '',
    tokenType: 'Bearer',
    expiresIn: 0,

    userInfo: null
  }
});