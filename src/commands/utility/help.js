const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('View available commands'),
  async execute(interaction, db, client) {
    const isAdmin = interaction.member.roles.cache.has(interaction.guild.roles.cache.find(r => r.name === 'ASE')?.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isOwner = interaction.user.id === process.env.OWNER_ID;
    const commands = client.commands.map(cmd => ({
      name: cmd.data.name,
      value: cmd.data.description,
      inline: true,
      restricted: cmd.ownerOnly ? 'Owner' : cmd.adminOnly ? 'Admin' : 'Public'
    })).filter(cmd => !cmd.restricted || (cmd.restricted === 'Admin' && isAdmin) || (cmd.restricted === 'Owner' && isOwner));
    await interaction.reply(createEmbed('Help', 'Available commands:', commands));
  }
};