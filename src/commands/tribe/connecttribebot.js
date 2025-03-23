const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('connecttribebot').setDescription('Generate a token for tribe bot connection'),
  async execute(interaction) {
    await interaction.reply(createEmbed('Connect Tribe Bot', 'Generate a connection token:', [], '#00FF00', [
      { id: 'connecttribebot_form', label: 'Generate' }
    ]));
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('connecttribebot_form')
      .setTitle('Connect Tribe Bot')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tribeid').setLabel('Tribe ID').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('serverid').setLabel('Server ID').setStyle(TextInputStyle.Short).setRequired(true))
      );
  },
  async handleModal(interaction, db) {
    const tribeId = interaction.fields.getTextInputValue('tribeid');
    const serverId = interaction.fields.getTextInputValue('serverid');
    const token = Math.random().toString(36).substring(2, 15);
    await db.query('INSERT INTO tribe_connections (token, tribe_id, server_id) VALUES ($1, $2, $3)', [token, tribeId, serverId]);
    await interaction.reply(createEmbed('Tribe Bot Token', `Use this token in your external bot: \`${token}\``));
  }
};