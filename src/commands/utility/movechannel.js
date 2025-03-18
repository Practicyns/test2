const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('movechannel')
    .setDescription('Move a channel to another category')
    .addChannelOption(option => option.setName('channel').setDescription('Channel to move').setRequired(true))
    .addChannelOption(option => option.setName('category').setDescription('Target category').setRequired(true)),
  async execute(interaction, db) {
    const channel = interaction.options.getChannel('channel');
    const category = interaction.options.getChannel('category');
    try {
      await channel.setParent(category.id);
      const embed = createFancyEmbed('Channel Moved', `${channel.name} moved to ${category.name}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error moving channel!', ephemeral: true });
    }
  },
};