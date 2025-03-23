const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, createProgressBar } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('ratelimit').setDescription('View Nitrado API rate limit status'),
  adminOnly: true,
  async execute(interaction, db) {
    const { rows } = await db.query('SELECT count FROM api_usage WHERE date = $1', [new Date().toDateString()]);
    const count = rows[0]?.count || 0;
    await interaction.reply(createEmbed('Rate Limit Dashboard', 'Current API usage:', [
      { name: 'Calls Used', value: createProgressBar(count, 100) }
    ]));
  }
};