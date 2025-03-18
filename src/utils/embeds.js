const { EmbedBuilder } = require('discord.js');

function createFancyEmbed(title, description, fields = [], color = '#00FF00') {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .addFields(fields)
    .setTimestamp()
    .setFooter({ text: 'ARK Management Bot' });
}

module.exports = { createFancyEmbed };