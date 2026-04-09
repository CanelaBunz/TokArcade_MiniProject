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
    personalInfoScopes: {
      USER_NAME: true,
      USER_FIRST_SURNAME: true,
      USER_SECOND_SURNAME: true,
      USER_GENDER: true,
      USER_BIRTHDAY: true,
      USER_STATE_OF_BIRTH: true,
      USER_NATIONALITY: true
    },


    userId: '',
    accessToken: '',
    tokenType: 'Bearer',
    expiresIn: 0,

    userInfo: null
  }
});