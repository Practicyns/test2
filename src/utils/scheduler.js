const cron = require('node-cron');
const NitradoAPI = require('./nitrado');
const { createEmbed, createProgressBar } = require('./embedUtils');

async function scheduleTasks(client, db) {
  // Server Status Board
  cron.schedule('*/5 * * * *', async () => {
    const { rows: servers } = await db.query('SELECT server_id, nitrado_token FROM servers');
    for (const guild of client.guilds.cache.values()) {
      const channel = guild.channels.cache.find(c => c.name === 'server-status');
      if (channel) {
        const fields = await Promise.all(servers.map(async s => {
          const nitrado = new NitradoAPI(s.nitrado_token, db);
          const status = await nitrado.getServerStatus(s.server_id);
          const players = await nitrado.getPlayerList(s.server_id);
          return { name: s.server_id, value: `${status.data.gameserver.status} - ${createProgressBar(players.length, 32)}`, inline: true };
        }));
        await channel.messages.fetch({ limit: 1 }).then(messages => {
          const lastMessage = messages.first();
          if (lastMessage) lastMessage.edit(createEmbed('Server Status', 'Current server statuses:', fields));
          else channel.send(createEmbed('Server Status', 'Current server statuses:', fields));
        });
      }
    }
  });

  // Leaderboards
  cron.schedule('*/5 * * * *', async () => {
    const { rows: accounts } = await db.query('SELECT gamertag, playtime, kills FROM linked_accounts ORDER BY playtime DESC LIMIT 5');
    const { rows: kills } = await db.query('SELECT gamertag, kills FROM linked_accounts ORDER BY kills DESC LIMIT 5');
    for (const guild of client.guilds.cache.values()) {
      const channel = guild.channels.cache.find(c => c.name === 'leaderboards');
      if (channel) {
        await channel.messages.fetch({ limit: 2 }).then(async messages => {
          const playtimeEmbed = createEmbed('Top Playtime', 'Most active players:', accounts.map((a, i) => ({ name: `${i + 1}. ${a.gamertag}`, value: `${a.playtime} hours`, inline: true })));
          const killsEmbed = createEmbed('Top Kills', 'Deadliest players:', kills.map((k, i) => ({ name: `${i + 1}. ${k.gamertag}`, value: `${k.kills} kills`, inline: true })));
          if (messages.size === 2) {
            const [playtimeMsg, killsMsg] = messages.values();
            await playtimeMsg.edit(playtimeEmbed);
            await killsMsg.edit(killsEmbed);
          } else {
            await channel.send(playtimeEmbed);
            await channel.send(killsEmbed);
          }
        });
      }
    }
  });

  // Player Lists
  cron.schedule('*/5 * * * *', async () => {
    const { rows: servers } = await db.query('SELECT server_id, nitrado_token FROM servers');
    for (const guild of client.guilds.cache.values()) {
      for (const server of servers) {
        const channel = guild.channels.cache.find(c => c.topic === `Player list for ${server.server_id}`);
        if (channel) {
          const nitrado = new NitradoAPI(server.nitrado_token, db);
          const players = await nitrado.getPlayerList(server.server_id);
          await channel.messages.fetch({ limit: 1 }).then(messages => {
            const lastMessage = messages.first();
            const embed = createEmbed(`Online Players - ${server.server_id}`, `${players.length} online`, players.map(p => ({ name: p, value: 'Online', inline: true })));
            if (lastMessage) lastMessage.edit(embed);
            else channel.send(embed);
          });
        }
      }
    }
  });

  // Anti-Cheat
  cron.schedule('*/10 * * * *', async () => {
    const { rows: servers } = await db.query('SELECT server_id, nitrado_token FROM servers');
    for (const guild of client.guilds.cache.values()) {
      const channel = guild.channels.cache.find(c => c.name === 'anti-cheat-logs');
      if (channel) {
        for (const server of servers) {
          const nitrado = new NitradoAPI(server.nitrado_token, db);
          const logs = await nitrado.downloadFile(server.server_id, 'arkse/ShooterGame/Saved/Logs/TribeLogs.txt');
          if (logs.match(/(\b\d+\b).*?\1/)) {
            await db.query('INSERT INTO detections (type, gamertag, timestamp) VALUES ($1, $2, $3)', ['Dupe', 'Unknown', Date.now()]);
            await channel.send(createEmbed('Dupe Detected', 'Possible item duplication found on ' + server.server_id, [], '#FF0000'));
          }
          // Alt/Spoof detection would require more server-side data; placeholder for now
        }
      }
    }
  });

  // Cross-Ban Sync
  cron.schedule('*/10 * * * *', async () => {
    const { rows: bans } = await db.query('SELECT gamertag, duration, cluster_id FROM bans WHERE timestamp > $1', [Date.now() - 10 * 60 * 1000]);
    for (const ban of bans) {
      const { rows: servers } = await db.query('SELECT server_id, nitrado_token FROM servers WHERE cluster_id = $1', [ban.cluster_id]);
      for (const server of servers) {
        const nitrado = new NitradoAPI(server.nitrado_token, db);
        await nitrado.banPlayer(server.server_id, ban.gamertag, ban.duration);
      }
    }
  });

  // Rate Limit Warnings
  cron.schedule('*/1 * * * *', async () => {
    const today = new Date().toDateString();
    const { rows } = await db.query('SELECT count FROM api_usage WHERE date = $1', [today]);
    const count = rows[0]?.count || 0;
    for (const guild of client.guilds.cache.values()) {
      const channel = guild.channels.cache.find(c => c.name === 'rate-limit-log');
      if (channel && count >= 80) {
        await channel.send(createEmbed('Rate Limit Warning', `${createProgressBar(count, 100)} used today`, [], '#FF0000'));
      }
    }
  });
}

module.exports = { scheduleTasks };