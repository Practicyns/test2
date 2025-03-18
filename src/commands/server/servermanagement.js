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
    const actionRaw = interaction.options.getString('action');
    if (!actionRaw) {
      const embed = createFancyEmbed('Error', 'Action is required! Use "restart" or "add".', [], '#FF0000');
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    const action = actionRaw.toLowerCase();
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      if (action === 'restart') {
        const result = await nitrado.restartServer(serverId);
        if (result.status !== 'success') throw new Error('Restart failed');
        const embed = createFancyEmbed('Server Restarted', `Server ${serverId} restarted!`);
        await interaction.reply({ embeds: [embed] });
      } else if (action === 'add') {
        if (!config.serverIds.includes(serverId)) {
          config.serverIds.push(serverId);
          fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        }
        const embed = createFancyEmbed('Server Added', `Server ${serverId} added to config!`);
        await interaction.reply({ embeds: [embed] });
      } else {
        throw new Error('Invalid action');
      }
    } catch (err) {
      console.error(err);
      const embed = createFancyEmbed('Error', 'Invalid action! Use "restart" or "add".', [], '#FF0000');
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};