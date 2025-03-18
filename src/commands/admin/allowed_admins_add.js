const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allowed_admins_add')
    .setDescription('Add a gamertag to the allowed admins list')
    .addStringOption(option => option.setName('gamertag').setDescription('The gamertag to add').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    db.run(`INSERT INTO admins (gamertag) VALUES (?)`, [gamertag], (err) => {
      if (err) return interaction.reply({ content: 'Error adding admin!', ephemeral: true });
      const embed = createFancyEmbed('Admin Added', `${gamertag} added to allowed admins!`);
      interaction.reply({ embeds: [embed] });
    });
  },
};