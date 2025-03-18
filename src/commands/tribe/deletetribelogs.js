const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletetribelogs')
    .setDescription('Delete tribe logs by tribe ID')
    .addStringOption(option => option.setName('tribeid').setDescription('Tribe ID').setRequired(true)),
  async execute(interaction, db) {
    const tribeId = interaction.options.getString('tribeid');
    try {
      await db.query('DELETE FROM tribe_logs WHERE tribe_id = $1', [tribeId]);
      const embed = createFancyEmbed('Tribe Logs Deleted', `Logs for tribe ${tribeId} deleted!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error deleting logs!', ephemeral: true });
    }
  },
};