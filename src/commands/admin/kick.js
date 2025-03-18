const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a player off a server')
    .addStringOption(option => option.setName('gamertag').setDescription('Player gamertag').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    const result = await nitrado.kickPlayer(serverId, gamertag);
    if (result.status !== 'success') return interaction.reply({ content: 'Failed to kick player!', ephemeral: true });
    const embed = createFancyEmbed('Player Kicked', `${gamertag} kicked from server ${serverId}!`);
    interaction.reply({ embeds: [embed] });
  },
};