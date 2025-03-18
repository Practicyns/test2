const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletetribelogs')
    .setDescription('Delete tribe logs by tribe ID')
    .addStringOption(option => option.setName('tribeid').setDescription('Tribe ID').setRequired(true)),
  async execute(interaction, db) {
    const tribeId = interaction.options.getString('tribeid');
    db.run(`DELETE FROM tribe_logs WHERE tribe_id = ?`, [tribeId], (err) => {
      if (err) return interaction.reply({ content: 'Error deleting logs!', ephemeral: true });
      const embed = createFancyEmbed('Tribe Logs Deleted', `Logs for tribe ${tribeId} deleted!`);
      interaction.reply({ embeds: [embed] });
    });
  },
};