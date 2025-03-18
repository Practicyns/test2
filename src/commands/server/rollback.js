const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rollback')
    .setDescription('Rollback a file on the server')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
    .addStringOption(option => option.setName('filepath').setDescription('File path').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const filepath = interaction.options.getString('filepath');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const result = await nitrado.rollbackFile(serverId, filepath);
      if (result.status !== 'success') throw new Error('Rollback failed');
      const embed = createFancyEmbed('Rollback Complete', `Rolled back ${filepath} on ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Failed to rollback!', ephemeral: true });
    }
  },
};