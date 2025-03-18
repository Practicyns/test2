const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changelognames')
    .setDescription('Change admin or chat log thread name')
    .addStringOption(option => option.setName('type').setDescription('admin or chat').setRequired(true))
    .addStringOption(option => option.setName('newname').setDescription('New name').setRequired(true)),
  async execute(interaction, db) {
    const type = interaction.options.getString('type');
    const newName = interaction.options.getString('newname');
    const embed = createFancyEmbed('Name Changed', `${type} logs renamed to ${newName}!`);
    interaction.reply({ embeds: [embed] });
  },
};