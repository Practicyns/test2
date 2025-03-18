const { SlashCommandBuilder } = require('discord.js');
const { createFancyEmbed } = require('../../utils/embeds');
const NitradoAPI = require('../../utils/nitrado');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder().setName('lookup').setDescription('Look up ARK servers'),
  async execute(interaction, db) {
    const config = JSON.parse(fs.readFileSync('./config.json'));
    const nitrado = new NitradoAPI(config.nitradoToken);
    const servers = await Promise.all(config.serverIds.map(async id => {
      const data = await nitrado.getServerStatus(id);
      return { name: id, value: data.data.gameserver.status };
    }));
    const embed = createFancyEmbed('Server Lookup', 'Linked servers:', servers);
    interaction.reply({ embeds: [embed] });
  },
};