const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlineplayers')
    .setDescription('Display online players on a server')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const players = await nitrado.getPlayerList(serverId);
      const embed = createFancyEmbed(
        'Online Players',
        `Players on ${serverId}`,
        players.map(p => ({ name: p, value: 'Online', inline: true }))
      );
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error fetching players!', ephemeral: true });
    }
  },
};