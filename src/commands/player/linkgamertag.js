const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('linkgamertag').setDescription('Link your Xbox gamertag to Discord'),
  async execute(interaction) {
    await interaction.reply(createEmbed('Link Gamertag', 'Enter your Xbox gamertag:', [], '#00FF00', [
      { id: 'linkgamertag_form', label: 'Link Now' }
    ]));
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('linkgamertag_form')
      .setTitle('Link Gamertag')
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('gamertag').setLabel('Xbox Gamertag').setStyle(TextInputStyle.Short).setRequired(true)
      ));
  },
  async handleModal(interaction, db) {
    const gamertag = interaction.fields.getTextInputValue('gamertag');
    await db.query('INSERT INTO linked_accounts (discord_id, gamertag, platform) VALUES ($1, $2, $3) ON CONFLICT (discord_id) DO UPDATE SET gamertag = $2, platform = $3', 
      [interaction.user.id, gamertag, 'Xbox']);
    await interaction.reply(createEmbed('Gamertag Linked', `${gamertag} linked successfully!`));
  }
};