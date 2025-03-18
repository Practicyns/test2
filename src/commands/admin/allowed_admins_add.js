const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allowed_admins_add')
    .setDescription('Add a gamertag to the allowed admins list')
    .addStringOption(option => option.setName('gamertag').setDescription('The gamertag to add').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    try {
      await db.query('INSERT INTO admins (gamertag) VALUES ($1) ON CONFLICT DO NOTHING', [gamertag]);
      const embed = createFancyEmbed('Admin Added', `${gamertag} added to allowed admins!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error adding admin!', ephemeral: true });
    }
  },
};