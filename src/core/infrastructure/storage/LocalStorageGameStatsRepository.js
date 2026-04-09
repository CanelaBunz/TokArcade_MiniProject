export class LocalStorageGameStatsRepository {
  saveTokens(amount) {
    const app = getApp();
    app.globalData.puntos = (app.globalData.puntos || 0) + amount;
    
    // Also persist for redundancy
    my.setStorageSync({ 
      key: 'user_tokens', 
      data: app.globalData.puntos 
    });
  }

  getTokens() {
    const app = getApp();
    if (app.globalData.puntos !== undefined) {
      return app.globalData.puntos;
    }
    const res = my.getStorageSync({ key: 'user_tokens' });
    return res.data || 0;
  }

  saveHighScore(gameId, score) {
    const highScores = my.getStorageSync({ key: 'high_scores' }).data || {};
    if (!highScores[gameId] || score > highScores[gameId]) {
      highScores[gameId] = score;
      my.setStorageSync({ key: 'high_scores', data: highScores });
    }
  }

  getHighScore(gameId) {
    const highScores = my.getStorageSync({ key: 'high_scores' }).data || {};
    return highScores[gameId] || 0;
  }

  saveTransaction(transaction) {
    const transactions = my.getStorageSync({ key: 'user_transactions' }).data || [];
    transactions.push({
      ...transaction,
      timestamp: new Date().toISOString()
    });
    my.setStorageSync({ key: 'user_transactions', data: transactions });
  }
}

