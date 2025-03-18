const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a player by gamertag')
    .addStringOption(option => option.setName('gamertag').setDescription('Player gamertag').setRequired(true))
    .addIntegerOption(option => option.setName('duration').setDescription('Ban duration in minutes').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    const duration = interaction.options.getInteger('duration');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const result = await nitrado.banPlayer(serverId, gamertag, duration);
      if (result.status !== 'success') throw new Error('Ban failed');
      await db.query(
        'INSERT INTO bans (gamertag, duration, timestamp, server_id) VALUES ($1, $2, $3, $4) ON CONFLICT (gamertag) DO UPDATE SET duration = $2, timestamp = $3, server_id = $4',
        [gamertag, duration, Date.now(), serverId]
      );
      const embed = createFancyEmbed('Player Banned', `${gamertag} banned for ${duration} minutes on ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to ban player!', ephemeral: true });
    }
  },
};