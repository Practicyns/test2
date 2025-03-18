const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allowed_admins_remove')
    .setDescription('Remove a gamertag from the allowed admins list')
    .addStringOption(option => option.setName('gamertag').setDescription('The gamertag to remove').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    db.run(`DELETE FROM admins WHERE gamertag = ?`, [gamertag], (err) => {
      if (err) return interaction.reply({ content: 'Error removing admin!', ephemeral: true });
      const embed = createFancyEmbed('Admin Removed', `${gamertag} removed from allowed admins!`);
      interaction.reply({ embeds: [embed] });
    });
  },
};