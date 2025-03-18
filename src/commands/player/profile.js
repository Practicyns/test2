const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('View your linked gamertag profile'),
  async execute(interaction, db) {
    try {
      const { rows } = await db.query('SELECT gamertag FROM linked_accounts WHERE discord_id = $1', [interaction.user.id]);
      if (!rows.length) throw new Error('No linked gamertag');
      const embed = createFancyEmbed('Profile', `${rows[0].gamertag}`, [{ name: 'Status', value: 'Online time TBD' }]);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Link your gamertag first!', ephemeral: true });
    }
  },
};