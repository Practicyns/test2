const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a player by gamertag')
    .addStringOption(option => option.setName('gamertag').setDescription('Player gamertag').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    const result = await nitrado.unbanPlayer(serverId, gamertag);
    if (result.status !== 'success') return interaction.reply({ content: 'Failed to unban player!', ephemeral: true });
    db.run(`DELETE FROM bans WHERE gamertag = ? AND server_id = ?`, [gamertag, serverId]);
    const embed = createFancyEmbed('Player Unbanned', `${gamertag} unbanned on ${serverId}!`);
    interaction.reply({ embeds: [embed] });
  },
};