export class VerifyGamePaymentUseCase {
  constructor(paymentRepository, statsRepository) {
    this.paymentRepository = paymentRepository;
    this.statsRepository = statsRepository;
  }

  /**
   * Verifica el estado del pago y lo guarda en el historial si fue exitoso
   * @param {Object} params - { paymentId, accessToken, gameId, amount }
   * @returns {Promise<boolean>} - true si el pago fue exitoso
   */
  async execute({ paymentId, accessToken, gameId, amount = 0.01 }) {

    const response = await this.paymentRepository.inquiryPayment(paymentId, accessToken);

    if (response.success && response.data) {
      const isSuccess = response.data.paymentStatus === 'SUCCESS';
      
      if (isSuccess) {
        // Guardar la transacción confirmada localmente
        this.statsRepository.saveTransaction({
          paymentId,
          amount,
          gameId,
          status: 'SUCCESS'
        });
        return true;
      }
    }

    // Si el estado no es SUCCESS, o hubo un fallo en el inquiry (por ejemplo "FAILED", "PENDING")
    // Se podría manejar de distintas formas, aquí simplemente retornamos false.
    return false;
  }
}
