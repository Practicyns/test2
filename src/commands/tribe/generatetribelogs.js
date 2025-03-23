const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');
const NitradoAPI = require('../../utils/nitrado');

module.exports = {
  data: new SlashCommandBuilder().setName('generatetribelogs').setDescription('Generate tribe logs for external bot use'),
  adminOnly: true,
  async execute(interaction) {
    await interaction.reply(createEmbed('Generate Tribe Logs', 'Generate logs for your tribe:', [], '#00FF00', [
      { id: 'generatetribelogs_form', label: 'Generate Now' }
    ]));
  },
  getModal() {
    return new ModalBuilder()
      .setCustomId('generatetribelogs_form')
      .setTitle('Generate Tribe Logs')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('tribeid').setLabel('Tribe ID').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('serverid').setLabel('Server ID').setStyle(TextInputStyle.Short).setRequired(true))
      );
  },
  async handleModal(interaction, db) {
    const tribeId = interaction.fields.getTextInputValue('tribeid');
    const serverId = interaction.fields.getTextInputValue('serverid');
    const { rows } = await db.query('SELECT nitrado_token FROM servers WHERE server_id = $1', [serverId]);
    if (!rows.length) return await interaction.reply(createEmbed('Error', 'Server not configured!', [], '#FF0000', [], true));
    const nitrado = new NitradoAPI(rows[0].nitrado_token, db);
    const logs = await nitrado.downloadFile(serverId, 'arkse/ShooterGame/Saved/Logs/TribeLogs.txt');
    const tribeLogs = logs.split('\n').filter(line => line.includes(tribeId)).join('\n');
    await db.query('INSERT INTO tribe_logs (tribe_id, log, timestamp, discord_id) VALUES ($1, $2, $3, $4)', 
      [tribeId, tribeLogs || 'No logs found', Date.now(), interaction.user.id]);
    await interaction.reply(createEmbed('Tribe Logs Generated', `Logs for tribe ${tribeId} on ${serverId} saved! Use your external bot with your linked gamertag.`));
  }
};