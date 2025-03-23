const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('review').setDescription('Submit a review of the bot'),
  async execute(interaction) {
    await interaction.reply(createEmbed('Submit Review', 'Share your feedback:', [], '#00FF00', [
      { id: 'review_form', label: 'Submit' }
    ]));
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('review_form')
      .setTitle('Submit Review')
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('review').setLabel('Your Review').setStyle(TextInputStyle.Paragraph).setRequired(true)
      ));
  },
  async handleModal(interaction) {
    const review = interaction.fields.getTextInputValue('review');
    await interaction.reply(createEmbed('Review Submitted', `Thanks for your feedback: "${review}"`));
  }
};