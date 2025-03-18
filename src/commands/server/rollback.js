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
    const result = await nitrado.rollbackFile(serverId, filepath);
    if (result.status !== 'success') return interaction.reply({ content: 'Failed to rollback!', ephemeral: true });
    const embed = createFancyEmbed('Rollback Complete', `Rolled back ${filepath} on ${serverId}!`);
    interaction.reply({ embeds: [embed] });
  },
};