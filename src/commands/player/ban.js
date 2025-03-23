const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');
const NitradoAPI = require('../../utils/nitrado');

module.exports = {
  data: new SlashCommandBuilder().setName('ban').setDescription('Ban a player from a server'),
  adminOnly: true,
  async execute(interaction) {
    await interaction.reply(createEmbed('Ban Player', 'Ban a player from your server:', [], '#FF0000', [
      { id: 'ban_form', label: 'Ban Now' }
    ]));
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('ban_form')
      .setTitle('Ban Player')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('gamertag').setLabel('Gamertag').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('serverid').setLabel('Server ID').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('duration').setLabel('Duration (minutes)').setStyle(TextInputStyle.Short).setRequired(true))
      );
  },
  async handleModal(interaction, db) {
    const gamertag = interaction.fields.getTextInputValue('gamertag');
    const serverId = interaction.fields.getTextInputValue('serverid');
    const duration = parseInt(interaction.fields.getTextInputValue('duration'));
    const { rows } = await db.query('SELECT nitrado_token, cluster_id FROM servers WHERE server_id = $1', [serverId]);
    if (!rows.length) return await interaction.reply(createEmbed('Error', 'Server not found!', [], '#FF0000', [], true));
    const nitrado = new NitradoAPI(rows[0].nitrado_token, db);
    await nitrado.banPlayer(serverId, gamertag, duration);
    await db.query('INSERT INTO bans (gamertag, duration, timestamp, server_id, cluster_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (gamertag) DO UPDATE SET duration = $2, timestamp = $3, server_id = $4, cluster_id = $5', 
      [gamertag, duration, Date.now(), serverId, rows[0].cluster_id]);
    
    // Automatic Cross-Ban Sync
    const { rows: clusterServers } = await db.query('SELECT server_id, nitrado_token FROM servers WHERE cluster_id = $1 AND server_id != $2', [rows[0].cluster_id, serverId]);
    for (const server of clusterServers) {
      const clusterNitrado = new NitradoAPI(server.nitrado_token, db);
      await clusterNitrado.banPlayer(server.server_id, gamertag, duration);
    }
    const banChannel = interaction.guild.channels.cache.find(c => c.name === 'ban-logs');
    if (banChannel && clusterServers.length) {
      await banChannel.send(createEmbed('Cross-Ban Sync', `${gamertag} banned for ${duration} minutes across ${clusterServers.length + 1} servers in cluster ${rows[0].cluster_id}`));
    }

    await interaction.reply(createEmbed('Ban Success', `${gamertag} banned from ${serverId} for ${duration} minutes!${clusterServers.length ? ' Synced to cluster.' : ''}`));
  }
};