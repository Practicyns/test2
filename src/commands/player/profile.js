const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('View your linked gamertag profile'),
  async execute(interaction, db) {
    db.get(`SELECT gamertag FROM linked_accounts WHERE discord_id = ?`, [interaction.user.id], (err, row) => {
      if (err || !row) return interaction.reply({ content: 'Link your gamertag first!', ephemeral: true });
      const embed = createFancyEmbed('Profile', `${row.gamertag}`, [{ name: 'Status', value: 'Online time TBD' }]);
      interaction.reply({ embeds: [embed] });
    });
  },
};