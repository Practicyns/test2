const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpayment')
    .setDescription('Log a payment via Overseer')
    .addNumberOption(option => option.setName('amount').setDescription('Payment amount').setRequired(true)),
  async execute(interaction, db) {
    const amount = interaction.options.getNumber('amount');
    try {
      await db.query(
        'INSERT INTO payments (discord_id, amount, timestamp) VALUES ($1, $2, $3)',
        [interaction.user.id, amount, Date.now()]
      );
      const embed = createFancyEmbed('Payment Logged', `Logged $${amount} payment!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error logging payment!', ephemeral: true });
    }
  },
};