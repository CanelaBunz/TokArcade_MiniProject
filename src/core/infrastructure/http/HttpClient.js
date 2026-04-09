export class HttpClient {
  constructor(baseUrl, appId) {
    this.baseUrl = baseUrl;
    this.appId = appId;
  }

  request({ url, method = 'GET', headers = {}, data = {} }) {
    return new Promise((resolve, reject) => {
      my.request({
        url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-App-Id': this.appId,
          ...headers
        },
        data,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // Manejo de errores de negocio devueltos por la API de Toka
            const errorMessage = (res.data && res.data.message) || `Error HTTP: ${res.statusCode}`;
            reject(new Error(errorMessage));
          }
        },
        fail: (err) => {
          // Error de red o fallo en la llamada de la JSAPI
          const errorMessage = err.errorMessage || 'Error de red en la petición HTTP';
          reject(new Error(errorMessage));
        }
      });
    });
  }

  post(url, data, headers = {}) {
    return this.request({ url, method: 'POST', data, headers });
  }

  get(url, headers = {}) {
    return this.request({ url, method: 'GET', headers });
  }
}
