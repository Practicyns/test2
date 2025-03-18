const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tribesearch')
    .setDescription('Search for tribe info')
    .addStringOption(option => option.setName('tribeid').setDescription('Tribe ID').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const tribeId = interaction.options.getString('tribeid');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const logs = await nitrado.downloadFile(serverId, 'arkse/ShooterGame/Saved/Logs/TribeLogs.txt');
      const tribeInfo = logs.includes(tribeId) ? 'Active tribe' : 'No recent activity';
      const embed = createFancyEmbed('Tribe Search', `Info for tribe ${tribeId}: ${tribeInfo}`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error searching tribe!', ephemeral: true });
    }
  },
};