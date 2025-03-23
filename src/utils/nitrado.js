const axios = require('axios');

class NitradoAPI {
  constructor(token, db) {
    this.token = token;
    this.db = db;
    this.baseUrl = 'https://api.nitrado.net/services';
  }

  async request(method, endpoint, data = null) {
    const today = new Date().toDateString();
    const { rows } = await this.db.query('SELECT count FROM api_usage WHERE date = $1', [today]);
    let count = rows[0]?.count || 0;
    if (count >= 100) throw new Error('Rate limit reached! Try again later.');
    
    const config = { method, url: `${this.baseUrl}${endpoint}`, headers: { Authorization: `Bearer ${this.token}` } };
    if (data) config.data = data;
    try {
      const response = await axios(config);
      if (response.status === 200) {
        await this.db.query('INSERT INTO api_usage (date, count) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET count = $2', [today, count + 1]);
        return response.data;
      }
      throw new Error(`API error: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('Rate limit hit, retrying after 5s...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.request(method, endpoint, data);
      }
      throw error;
    }
  }

  async getServerStatus(serverId) { return this.request('GET', `/${serverId}/gameservers`); }
  async restartServer(serverId) { return this.request('POST', `/${serverId}/gameservers/restart`); }
  async getClusterServers(clusterId) {
    const data = await this.request('GET', '?type=gameserver');
    return data.data.services.filter(s => s.type === 'gameserver' && s.details.cluster_id === clusterId && s.details.game === 'arkse');
  }
  async getPlayerList(serverId) {
    const data = await this.request('GET', `/${serverId}/gameservers`);
    return data.data.gameserver.query.player_list || [];
  }
  async banPlayer(serverId, gamertag, duration) {
    return this.request('PUT', `/${serverId}/gameservers/file_server`, {
      path: 'arkse/ShooterGame/Saved/Config/WindowsServer/BanList.txt',
      content: `${gamertag}\n`,
    });
  }
  async unbanPlayer(serverId, gamertag) {
    const banList = await this.downloadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/BanList.txt');
    const updatedList = banList.split('\n').filter(line => line.trim() !== gamertag).join('\n');
    return this.uploadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/BanList.txt', updatedList);
  }
  async kickPlayer(serverId, gamertag) {
    return this.request('POST', `/${serverId}/gameservers/command`, { command: `kickplayer ${gamertag}` });
  }
  async downloadFile(serverId, filepath) {
    const data = await this.request('GET', `/${serverId}/gameservers/file_server?file=${filepath}`);
    return data.content || '';
  }
  async uploadFile(serverId, filepath, content) {
    return this.request('PUT', `/${serverId}/gameservers/file_server`, { path: filepath, content });
  }
  async getServerConfig(serverId) {
    return this.downloadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini');
  }
  async updateServerConfig(serverId, config) {
    return this.uploadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini', config);
  }
}

module.exports = NitradoAPI;