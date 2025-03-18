const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createpayment')
    .setDescription('Log a payment via Overseer')
    .addNumberOption(option => option.setName('amount').setDescription('Payment amount').setRequired(true)),
  async execute(interaction, db) {
    const amount = interaction.options.getNumber('amount');
    db.run(`INSERT INTO payments (discord_id, amount, timestamp) VALUES (?, ?, ?)`, 
      [interaction.user.id, amount, Date.now()], (err) => {
        if (err) return interaction.reply({ content: 'Error logging payment!', ephemeral: true });
        const embed = createFancyEmbed('Payment Logged', `Logged $${amount} payment!`);
        interaction.reply({ embeds: [embed] });
      });
  },
};