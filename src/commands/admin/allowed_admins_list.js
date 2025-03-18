const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('allowed_admins_list').setDescription('List all allowed admins'),
  async execute(interaction, db) {
    try {
      const { rows } = await db.query('SELECT gamertag FROM admins');
      const embed = createFancyEmbed(
        'Allowed Admins',
        rows.length ? 'Current admins:' : 'No admins found',
        rows.map(row => ({ name: row.gamertag, value: 'Admin', inline: true }))
      );
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error fetching admins!', ephemeral: true });
    }
  },
};