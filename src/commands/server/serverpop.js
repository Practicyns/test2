const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder().setName('serverpop').setDescription('Get total player population across servers'),
  async execute(interaction, db) {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const total = await Promise.all(config.serverIds.map(async id => {
        const players = await nitrado.getPlayerList(id);
        return players.length;
      }));
      const sum = total.reduce((a, b) => a + b, 0);
      const embed = createFancyEmbed('Server Population', `Total players across ${config.serverIds.length} servers: ${sum}`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error fetching population!', ephemeral: true });
    }
  },
};