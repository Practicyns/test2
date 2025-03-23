const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('addpremium').setDescription('Add premium subscription to a user'),
  ownerOnly: true,
  async execute(interaction) {
    await interaction.reply(createEmbed('Add Premium', 'Add a premium subscription:', [], '#00FF00', [
      { id: 'addpremium_form', label: 'Add Now' }
    ]));
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('addpremium_form')
      .setTitle('Add Premium')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('user_id').setLabel('User ID').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tier').setLabel('Tier (basic/pro)').setStyle(TextInputStyle.Short).setRequired(true))
      );
  },
  async handleModal(interaction, db) {
    const userId = interaction.fields.getTextInputValue('user_id');
    const tier = interaction.fields.getTextInputValue('tier').toLowerCase();
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    await db.query('INSERT INTO premium_users (discord_id, tier, expiry) VALUES ($1, $2, $3) ON CONFLICT (discord_id) DO UPDATE SET tier = $2, expiry = $3', 
      [userId, tier, expiry]);
    await interaction.reply(createEmbed('Premium Added', `<@${userId}> now has ${tier} premium until ${new Date(expiry).toLocaleDateString()}!`));
  }
};