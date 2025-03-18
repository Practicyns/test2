const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servermanagement')
    .setDescription('Manage server settings')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
    .addStringOption(option => option.setName('action').setDescription('Action (restart/add)').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const action = interaction.options.getString('action').toLowerCase();
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    if (action === 'restart') {
      const result = await nitrado.restartServer(serverId);
      if (result.status !== 'success') return interaction.reply({ content: 'Failed to restart!', ephemeral: true });
      const embed = createFancyEmbed('Server Restarted', `Server ${serverId} restarted!`);
      interaction.reply({ embeds: [embed] });
    } else if (action === 'add') {
      if (!config.serverIds.includes(serverId)) config.serverIds.push(serverId);
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      const embed = createFancyEmbed('Server Added', `Server ${serverId} added to config!`);
      interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({ content: 'Invalid action! Use "restart" or "add".', ephemeral: true });
    }
  },
};