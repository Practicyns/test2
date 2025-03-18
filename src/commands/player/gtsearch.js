const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gtsearch')
    .setDescription('Search for player info by gamertag')
    .addStringOption(option => option.setName('gamertag').setDescription('Player gamertag').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    const players = await nitrado.getPlayerList(serverId);
    const player = players.find(p => p.toLowerCase() === gamertag.toLowerCase());
    const embed = createFancyEmbed('Player Search', player ? `${gamertag} is online on ${serverId}` : `${gamertag} not found`);
    interaction.reply({ embeds: [embed] });
  },
};