const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletepayment')
    .setDescription('Delete a logged payment')
    .addIntegerOption(option => option.setName('id').setDescription('Payment ID').setRequired(true)),
  async execute(interaction, db) {
    const id = interaction.options.getInteger('id');
    db.run(`DELETE FROM payments WHERE rowid = ? AND discord_id = ?`, [id, interaction.user.id], (err) => {
      if (err) return interaction.reply({ content: 'Error deleting payment!', ephemeral: true });
      const embed = createFancyEmbed('Payment Deleted', `Payment #${id} deleted!`);
      interaction.reply({ embeds: [embed] });
    });
  },
};