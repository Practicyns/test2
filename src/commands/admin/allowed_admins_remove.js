const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allowed_admins_remove')
    .setDescription('Remove a gamertag from the allowed admins list')
    .addStringOption(option => option.setName('gamertag').setDescription('The gamertag to remove').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    try {
      await db.query('DELETE FROM admins WHERE gamertag = $1', [gamertag]);
      const embed = createFancyEmbed('Admin Removed', `${gamertag} removed from allowed admins!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error removing admin!', ephemeral: true });
    }
  },
};