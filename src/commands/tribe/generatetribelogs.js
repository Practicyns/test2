const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('generatetribelogs')
    .setDescription('Generate tribe logs for a tribe')
    .addStringOption(option => option.setName('tribeid').setDescription('Tribe ID').setRequired(true))
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true)),
  async execute(interaction, db) {
    const tribeId = interaction.options.getString('tribeid');
    const serverId = interaction.options.getString('serverid');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      const logs = await nitrado.downloadFile(serverId, 'arkse/ShooterGame/Saved/Logs/TribeLogs.txt');
      await db.query(
        'INSERT INTO tribe_logs (tribe_id, log, timestamp) VALUES ($1, $2, $3)',
        [tribeId, logs || 'No logs found', Date.now()]
      );
      const embed = createFancyEmbed('Tribe Logs Generated', `Logs generated for tribe ${tribeId} on ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error generating logs!', ephemeral: true });
    }
  },
};