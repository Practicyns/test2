const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kickmyself')
    .setDescription('Kick yourself from the server')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    db.get(`SELECT gamertag FROM linked_accounts WHERE discord_id = ?`, [interaction.user.id], async (err, row) => {
      if (err || !row) return interaction.reply({ content: 'Link your gamertag first!', ephemeral: true });
      const result = await nitrado.kickPlayer(serverId, row.gamertag);
      if (result.status !== 'success') return interaction.reply({ content: 'Failed to kick!', ephemeral: true });
      const embed = createFancyEmbed('Self Kick', `${row.gamertag} kicked from ${serverId}!`);
      interaction.reply({ embeds: [embed] });
    });
  },
};