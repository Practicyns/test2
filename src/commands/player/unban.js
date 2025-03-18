const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a player by gamertag')
    .addStringOption(option => option.setName('gamertag').setDescription('Player gamertag').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const result = await nitrado.unbanPlayer(serverId, gamertag);
      if (result.status !== 'success') throw new Error('Unban failed');
      await db.query('DELETE FROM bans WHERE gamertag = $1 AND server_id = $2', [gamertag, serverId]);
      const embed = createFancyEmbed('Player Unbanned', `${gamertag} unbanned on ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to unban player!', ephemeral: true });
    }
  },
};