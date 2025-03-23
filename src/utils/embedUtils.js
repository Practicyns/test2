const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { TIPS } = require('./constants');

function createProgressBar(value, max, length = 10) {
  const filled = Math.round((value / max) * length);
  return `[${'█'.repeat(filled)}${'-'.repeat(length - filled)}] ${Math.round((value / max) * 100)}%`;
}

function createEmbed(title, description, fields = [], color = '#00FF00', buttons = [], ephemeral = false) {
  const embed = new EmbedBuilder()
    .setTitle(`ASE Management | ${title}`)
    .setDescription(description)
    .setColor(color)
    .addFields(fields)
    .setTimestamp()
    .setFooter({ text: TIPS[Math.floor(Math.random() * TIPS.length)] });

  const components = buttons.length ? [new ActionRowBuilder().addComponents(
    buttons.map(btn => new ButtonBuilder()
      .setCustomId(btn.id)
      .setLabel(btn.label)
      .setStyle(btn.style || ButtonStyle.Primary)
      .setURL(btn.url || null))
  )] : [];

  return { embeds: [embed], components, ephemeral };
}

module.exports = { createEmbed, createProgressBar };