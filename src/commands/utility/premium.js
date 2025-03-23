const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed, createProgressBar } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('premium').setDescription('Manage your premium subscription'),
  async execute(interaction, db) {
    const { rows } = await db.query('SELECT tier, expiry FROM premium_users WHERE discord_id = $1', [interaction.user.id]);
    const expiry = rows[0]?.expiry ? new Date(rows[0].expiry).toLocaleDateString() : 'Not subscribed';
    const daysLeft = rows[0]?.expiry ? Math.max(0, Math.ceil((rows[0].expiry - Date.now()) / (24 * 60 * 60 * 1000))) : 0;
    await interaction.reply(createEmbed('Premium Status', `Tier: ${rows[0]?.tier || 'None'}\nExpires: ${expiry}`, [
      { name: 'Days Left', value: createProgressBar(daysLeft, 30) }
    ], '#00FF00', [
      { id: 'premium_subscribe', label: 'Subscribe' },
      { id: 'premium_renew', label: 'Renew', url: 'https://your-payment-link.com' }
    ]));
  },
  handleButton(interaction) {
    if (interaction.customId === 'premium_subscribe') {
      interaction.showModal(this.getModal());
    }
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('premium_subscribe')
      .setTitle('Subscribe to Premium')
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('tier').setLabel('Tier (basic/pro)').setStyle(TextInputStyle.Short).setRequired(true)
      ));
  },
  async handleModal(interaction, db) {
    const tier = interaction.fields.getTextInputValue('tier').toLowerCase();
    await interaction.reply(createEmbed('Subscription Pending', `Please complete payment for ${tier} at [your-payment-link.com](https://your-payment-link.com). Use /addpremium for instant activation by the owner.`));
  }
};