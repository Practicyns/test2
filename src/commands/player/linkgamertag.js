const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linkgamertag')
    .setDescription('Link a gamertag to your Discord account')
    .addStringOption(option => option.setName('gamertag').setDescription('Your gamertag').setRequired(true)),
  async execute(interaction, db) {
    const gamertag = interaction.options.getString('gamertag');
    db.run(`INSERT OR REPLACE INTO linked_accounts (discord_id, gamertag) VALUES (?, ?)`, 
      [interaction.user.id, gamertag], (err) => {
        if (err) return interaction.reply({ content: 'Error linking gamertag!', ephemeral: true });
        const embed = createFancyEmbed('Gamertag Linked', `${gamertag} linked to your account!`);
        interaction.reply({ embeds: [embed] });
      });
  },
};