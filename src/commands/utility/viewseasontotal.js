const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('viewseasontotal').setDescription('View your season total'),
  async execute(interaction, db) {
    try {
      const { rows } = await db.query('SELECT SUM(amount) AS total FROM payments WHERE discord_id = $1', [interaction.user.id]);
      const total = rows[0].total || 0;
      const embed = createFancyEmbed('Season Total', `Your total: $${total}`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error fetching total!', ephemeral: true });
    }
  },
};