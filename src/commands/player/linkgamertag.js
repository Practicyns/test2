const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkgamertag')
    .setDescription('Link a gamertag to your Discord account')
    .addStringOption(option => option.setName('gamertag').setDescription('Your gamertag').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    try {
      await db.query(
        'INSERT INTO linked_accounts (discord_id, gamertag) VALUES ($1, $2) ON CONFLICT (discord_id) DO UPDATE SET gamertag = $2',
        [interaction.user.id, gamertag]
      );
      const embed = createFancyEmbed('Gamertag Linked', `${gamertag} linked to your account!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error linking gamertag!', ephemeral: true });
    }
  },
};