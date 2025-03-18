const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletepayment')
    .setDescription('Delete a logged payment')
    .addIntegerOption(option => option.setName('id').setDescription('Payment ID').setRequired(true)),
  async execute(interaction, db) {
    const id = interaction.options.getInteger('id');
    try {
      // Note: Original used rowid, but we'll assume an implicit ID or adjust schema if needed
      await db.query('DELETE FROM payments WHERE discord_id = $1 AND timestamp = (SELECT timestamp FROM payments WHERE discord_id = $1 LIMIT 1 OFFSET $2)', [interaction.user.id, id - 1]);
      const embed = createFancyEmbed('Payment Deleted', `Payment #${id} deleted!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error deleting payment!', ephemeral: true });
    }
  },
};