const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changeadminpassword')
    .setDescription('Change admin password on a server')
    .addStringOption(option => option.setName('serverid').setDescription('Server ID').setRequired(true))
    .addStringOption(option => option.setName('password').setDescription('New password').setRequired(true)),
  async execute(interaction, db) {
    const serverId = interaction.options.getString('serverid');
    const password = interaction.options.getString('password');
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    try {
      await nitrado.uploadFile(serverId, 'arkse/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini',
        `[ServerSettings]\nServerAdminPassword=${password}`);
      const embed = createFancyEmbed('Password Changed', `Admin password updated on server ${serverId}!`);
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: 'Error changing password!', ephemeral: true });
    }
  },
};