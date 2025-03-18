const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Leave a review for Overseer')
    .addStringOption(option => option.setName('review').setDescription('Your review').setRequired(true)),
  async execute(interaction, db) {
    const review = interaction.options.getString('review');
    const embed = createFancyEmbed('Review Submitted', `Thank you for your review: "${review}"`);
    interaction.reply({ embeds: [embed] });
  },
};