const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playersearch')
    .setDescription('Search for player by name or implant ID')
    .addStringOption(option => option.setName('query').setDescription('Name or implant ID').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const query = interaction.options.getString('query');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const players = await nitrado.getPlayerList(serverId);
      const player = players.find(p => p.toLowerCase().includes(query.toLowerCase()));
      const embed = createFancyEmbed('Player Search', player ? `${player} found on ${serverId}` : `${query} not found`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error searching player!', ephemeral: true });
    }
  },
};