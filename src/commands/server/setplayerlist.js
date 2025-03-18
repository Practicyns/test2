const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setplayerlist')
    .setDescription('Set a channel to display online players')
    .addChannelOption(option => option.setName('channel').setDescription('Target channel').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const channel = interaction.options.getChannel('channel');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    const players = await nitrado.getPlayerList(serverId);
    const embed = createFancyEmbed('Online Players', `Players on ${serverId}`, 
      players.map(p => ({ name: p, value: 'Online', inline: true })));
    await channel.send({ embeds: [embed] });
    const replyEmbed = createFancyEmbed('Player List Set', `Player list set in ${channel.name} for ${serverId}!`);
    interaction.reply({ embeds: [replyEmbed] });
  },
};