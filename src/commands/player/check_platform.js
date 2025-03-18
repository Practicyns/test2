const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check_platform')
    .setDescription('Check a user\'s platform')
    .addStringOption(option => option.setName('gamertag').setDescription('Player gamertag').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const players = await nitrado.getPlayerList(serverId);
      const player = players.find(p => p.toLowerCase() === gamertag.toLowerCase());
      const platform = player ? 'Online (Platform TBD)' : 'Not Online';
      const embed = createFancyEmbed('Platform Check', `Platform for ${gamertag}: ${platform}`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error checking platform!', ephemeral: true });
    }
  },
};