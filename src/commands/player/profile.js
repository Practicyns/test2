const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, createProgressBar } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('View your linked gamertag profile'),
  async execute(interaction, db) {
    const { rows } = await db.query('SELECT gamertag, platform, playtime, kills FROM linked_accounts WHERE discord_id = $1', [interaction.user.id]);
    if (!rows.length) return await interaction.reply(createEmbed('No Profile', 'Link your gamertag with /linkgamertag!', [], '#FF0000', [], true));
    const { gamertag, platform, playtime, kills } = rows[0];
    await interaction.reply(createEmbed('Profile', `${gamertag}'s stats:`, [
      { name: 'Platform', value: platform, inline: true },
      { name: 'Playtime', value: `${playtime} hours (${createProgressBar(playtime, 1000)})`, inline: true },
      { name: 'Kills', value: kills.toString(), inline: true }
    ]));
  }
};