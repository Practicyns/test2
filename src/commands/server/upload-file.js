const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upload-file')
    .setDescription('Upload a file to a Nitrado server')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
    .addStringOption(option => option.setName('filepath').setDescription('File path').setRequired(true))
    .addStringOption(option => option.setName('content').setDescription('File content').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const filepath = interaction.options.getString('filepath');
    const content = interaction.options.getString('content');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const result = await nitrado.uploadFile(serverId, filepath, content);
      if (result.status !== 'success') throw new Error('Upload failed');
      const embed = createFancyEmbed('File Uploaded', `Uploaded ${filepath} to ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to upload file!', ephemeral: true });
    }
  },
};