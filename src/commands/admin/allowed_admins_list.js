const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('allowed_admins_list').setDescription('List all allowed admins'),
  async execute(interaction, db) {
    db.all(`SELECT gamertag FROM admins`, [], (err, rows) => {
      if (err) return interaction.reply({ content: 'Error fetching admins!', ephemeral: true });
      const embed = createFancyEmbed('Allowed Admins', rows.length ? 'Current admins:' : 'No admins found', 
        rows.map(row => ({ name: row.gamertag, value: 'Admin', inline: true })));
      interaction.reply({ embeds: [embed] });
    });
  },
};