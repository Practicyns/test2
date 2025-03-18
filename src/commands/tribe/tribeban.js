const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tribeban')
    .setDescription('Ban an entire tribe')
    .addStringOption(option => option.setName('tribeid').setDescription('Tribe ID').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const tribeId = interaction.options.getString('tribeid');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      // Placeholder: Ban tribe members (requires tribe member list)
      const embed = createFancyEmbed('Tribe Banned', `Tribe ${tribeId} banned on ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error banning tribe!', ephemeral: true });
    }
  },
};