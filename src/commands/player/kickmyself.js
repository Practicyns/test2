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
    try {
      const { rows } = await db.query('SELECT gamertag FROM linked_accounts WHERE discord_id = $1', [interaction.user.id]);
      if (!rows.length) throw new Error('No linked gamertag');
      const gamertag = rows[0].gamertag;
      const result = await nitrado.kickPlayer(serverId, gamertag);
      if (result.status !== 'success') throw new Error('Kick failed');
      const embed = createFancyEmbed('Self Kick', `${gamertag} kicked from ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: err.message === 'No linked gamertag' ? 'Link your gamertag first!' : 'Failed to kick!', ephemeral: true });
    }
  },
};