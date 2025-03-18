const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('download-file')
    .setDescription('Download a file from a Nitrado server')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
    .addStringOption(option => option.setName('filepath').setDescription('File path').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const filepath = interaction.options.getString('filepath');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    const content = await nitrado.downloadFile(serverId, filepath);
    const embed = createFancyEmbed('File Downloaded', `Downloaded ${filepath} from ${serverId}`, 
      [{ name: 'Content Preview', value: content.substring(0, 100) + '...' }]);
    interaction.reply({ embeds: [embed] });
  },
};