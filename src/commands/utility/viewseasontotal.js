const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('viewseasontotal').setDescription('View your season total'),
  async execute(interaction, db) {
    db.all(`SELECT amount FROM payments WHERE discord_id = ?`, [interaction.user.id], (err, rows) => {
      if (err) return interaction.reply({ content: 'Error fetching total!', ephemeral: true });
      const total = rows.reduce((sum, row) => sum + row.amount, 0);
      const embed = createFancyEmbed('Season Total', `Your total: $${total}`);
      interaction.reply({ embeds: [embed] });
    });
  },
};