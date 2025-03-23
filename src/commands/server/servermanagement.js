const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { createEmbed, createProgressBar } = require('../../utils/embedUtils');
const NitradoAPI = require('../../utils/nitrado');

module.exports = {
  data: new SlashCommandBuilder().setName('servermanagement').setDescription('Manage AS:E servers, dashboard, and configs'),
  adminOnly: true,
  async execute(interaction, db) {
    const { rows: servers } = await db.query('SELECT server_id, cluster_id FROM servers WHERE owner_id = $1', [interaction.user.id]);
    const dashboardFields = servers.length ? [
      { name: 'Servers', value: `${servers.length} active`, inline: true },
      { name: 'Cluster ID', value: servers[0].cluster_id || 'None', inline: true }
    ] : [{ name: 'Status', value: 'No servers configured' }];
    await interaction.reply(createEmbed('Server Management', 'Manage your AS:E cluster:', dashboardFields, '#00FF00', [
      { id: 'servermanagement_setup', label: 'Setup Cluster' },
      { id: 'servermanagement_dashboard', label: 'View Dashboard' },
      { id: 'servermanagement_config', label: 'Edit Config' }
    ]));
  },
  handleButton(interaction, db) {
    if (interaction.customId === 'servermanagement_setup') {
      interaction.showModal(this.getSetupModal());
    } else if (interaction.customId === 'servermanagement_dashboard') {
      this.showDashboard(interaction, db);
    } else if (interaction.customId === 'servermanagement_config') {
      interaction.showModal(this.getConfigModal());
    }
  },
  getSetupModal() {
    return new ModalBuilder()
      .setCustomId('servermanagement_setup')
      .setTitle('Setup Cluster')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nitrado_token').setLabel('Nitrado API Token').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('beacon_key').setLabel('Beacon API Key').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cluster_id').setLabel('Cluster ID').setStyle(TextInputStyle.Short).setRequired(true))
      );
  },
  getConfigModal() {
    return new ModalBuilder()
      .setCustomId('servermanagement_config')
      .setTitle('Edit Server Config')
      .addComponents(
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('serverid').setLabel('Server ID').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('xp_multiplier').setLabel('XP Multiplier').setStyle(TextInputStyle.Short).setRequired(true)),
        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('taming_speed').setLabel('Taming Speed').setStyle(TextInputStyle.Short).setRequired(true))
      );
  },
  async handleModal(interaction, db) {
    if (interaction.customId === 'servermanagement_setup') {
      const nitradoToken = interaction.fields.getTextInputValue('nitrado_token');
      const beaconKey = interaction.fields.getTextInputValue('beacon_key');
      const clusterId = interaction.fields.getTextInputValue('cluster_id');
      const nitrado = new NitradoAPI(nitradoToken, db);
      const servers = await nitrado.getClusterServers(clusterId);
      for (const server of servers) {
        await db.query('INSERT INTO servers (server_id, nitrado_token, beacon_key, owner_id, cluster_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (server_id) DO UPDATE SET nitrado_token = $2, beacon_key = $3, owner_id = $4, cluster_id = $5', 
          [server.id, nitradoToken, beaconKey, interaction.user.id, clusterId]);
      }
      await interaction.reply(createEmbed('Cluster Setup', `Configured ${servers.length} servers in cluster ${clusterId}!`));
    } else if (interaction.customId === 'servermanagement_config') {
      const serverId = interaction.fields.getTextInputValue('serverid');
      const xp = interaction.fields.getTextInputValue('xp_multiplier');
      const taming = interaction.fields.getTextInputValue('taming_speed');
      const { rows } = await db.query('SELECT nitrado_token FROM servers WHERE server_id = $1', [serverId]);
      if (!rows.length) return await interaction.reply(createEmbed('Error', 'Server not found!', [], '#FF0000', [], true));
      const nitrado = new NitradoAPI(rows[0].nitrado_token, db);
      const config = await nitrado.getServerConfig(serverId);
      const updatedConfig = config.replace(/XPMultiplier=.*/g, `XPMultiplier=${xp}`).replace(/TamingSpeedMultiplier=.*/g, `TamingSpeedMultiplier=${taming}`);
      await nitrado.updateServerConfig(serverId, updatedConfig);
      await interaction.reply(createEmbed('Config Updated', `Updated ${serverId}: XP=${xp}, Taming=${taming}`));
    }
  },
  async showDashboard(interaction, db) {
    const { rows: servers } = await db.query('SELECT server_id, nitrado_token FROM servers WHERE owner_id = $1', [interaction.user.id]);
    const { rows: usage } = await db.query('SELECT count FROM api_usage WHERE date = $1', [new Date().toDateString()]);
    const fields = [
      { name: 'Servers', value: servers.length.toString(), inline: true },
      { name: 'API Usage', value: createProgressBar(usage[0]?.count || 0, 100), inline: true }
    ];
    await interaction.reply(createEmbed('Dashboard', 'Your AS:E Management stats:', fields));
  }
};