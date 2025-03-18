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
    const result = await nitrado.banPlayer(serverId, gamertag, duration);
    if (result.status !== 'success') return interaction.reply({ content: 'Failed to ban player!', ephemeral: true });
    db.run(`INSERT OR REPLACE INTO bans (gamertag, duration, timestamp, server_id) VALUES (?, ?, ?, ?)`, 
      [gamertag, duration, Date.now(), serverId]);
    const embed = createFancyEmbed('Player Banned', `${gamertag} banned for ${duration} minutes on ${serverId}!`);
    interaction.reply({ embeds: [embed] });
  },
};