const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('invite').setDescription('Get the bot invite link'),
  async execute(interaction) {
    await interaction.reply(createEmbed('Invite ASE Management', 'Add me to your server!', [], '#00FF00', [
      { id: 'invite', label: 'Invite Now', style: ButtonStyle.Link, url: `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot&permissions=8` }
    ]));
  }
};