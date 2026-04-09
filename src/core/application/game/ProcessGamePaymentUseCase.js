export class ProcessGamePaymentUseCase {
  constructor(paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  /**
   * Procesa la creación de un pago para continuar el juego
   * @param {Object} params - { userId, gameId, amount }
   * @returns {Promise<Object>} - { paymentUrl, paymentId }
   */
  async execute({ userId, accessToken, gameId, amount = 0.01 }) {
    try {
      const orderTitle = `Continuar Juego: ${gameId}`;
      
      // Llamada al repositorio para crear la orden en el backend de Toka
      const response = await this.paymentRepository.createPayment({
        userId,
        accessToken,
        orderTitle,
        value: amount,
        currency: 'MXN'
      });

      if (response.success && response.data && response.data.paymentUrl) {
        return { 
          paymentUrl: response.data.paymentUrl,
          paymentId: response.data.paymentId
        };
      }

      // Si la respuesta no tiene paymentUrl, devolver demo
      console.warn('[Demo Mode] Respuesta sin paymentUrl, usando demo');
      return this._demoPayment(gameId);
    } catch (error) {
      console.warn('[Demo Mode] ProcessPayment fallback activado:', error.message);
      return this._demoPayment(gameId);
    }
  }

  _demoPayment(gameId) {
    return {
      paymentUrl: `demo://pay/${gameId}/${Date.now()}`,
      paymentId: `demo_pay_${Date.now()}`
    };
  }
}

