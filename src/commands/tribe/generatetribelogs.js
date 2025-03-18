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
    const logs = await nitrado.downloadFile(serverId, 'arkse/ShooterGame/Saved/Logs/TribeLogs.txt');
    db.run(`INSERT INTO tribe_logs (tribe_id, log, timestamp) VALUES (?, ?, ?)`, 
      [tribeId, logs || 'No logs found', Date.now()]);
    const embed = createFancyEmbed('Tribe Logs Generated', `Logs generated for tribe ${tribeId} on ${serverId}!`);
    interaction.reply({ embeds: [embed] });
  },
};