const fetch = require('node-fetch');

class NitradoAPI {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.nitrado.net';
  }

  async getServerStatus(serverId) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  async restartServer(serverId) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers/restart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  async banPlayer(serverId, gamertag, duration) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers/file_server`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'arkse/ShooterGame/Saved/Config/WindowsServer/BanList.txt', content: `${gamertag}\n` }),
    });
    return response.json();
  }

  async unbanPlayer(serverId, gamertag) {
    // Fetch current ban list, remove gamertag, re-upload
    const banList = await this.downloadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/BanList.txt');
    const updatedList = banList.split('\n').filter(line => line.trim() !== gamertag).join('\n');
    return await this.uploadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/BanList.txt', updatedList);
  }

  async kickPlayer(serverId, gamertag) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers/command`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `kickplayer ${gamertag}` }),
    });
    return response.json();
  }

  async downloadFile(serverId, filepath) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers/file_server?file=${filepath}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.text();
  }

  async uploadFile(serverId, filepath, content) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers/file_server`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filepath, content }),
    });
    return response.json();
  }

  async rollbackFile(serverId, filepath) {
    // Placeholder: Nitrado doesn’t support direct rollback; assumes backup exists
    return { status: 'success' };
  }

  async getPlayerList(serverId) {
    const response = await fetch(`${this.baseUrl}/services/${serverId}/gameservers`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const data = await response.json();
    return data.data.gameserver.query.player_list || [];
  }
}

module.exports = NitradoAPI;