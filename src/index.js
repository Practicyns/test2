const { Client, GatewayIntentBits, Collection, PermissionsBitField, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Client: PgClient } = require('pg');
require('dotenv').config();
const { scheduleTasks } = require('./utils/scheduler');
const { createEmbed } = require('./utils/embedUtils');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();
const OWNER_ID = process.env.OWNER_ID;

// Load Commands
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

// Database Setup
const db = new PgClient({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
db.connect(err => {
  if (err) console.error('Error connecting to Postgres:', err.message);
  else console.log('Connected to Postgres database.');
});

db.query(`
  CREATE TABLE IF NOT EXISTS admins (gamertag TEXT PRIMARY KEY);
  CREATE TABLE IF NOT EXISTS linked_accounts (discord_id TEXT PRIMARY KEY, gamertag TEXT, platform TEXT, playtime INTEGER DEFAULT 0, kills INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);
  CREATE TABLE IF NOT EXISTS bans (gamertag TEXT PRIMARY KEY, duration INTEGER, timestamp INTEGER, server_id TEXT, cluster_id TEXT);
  CREATE TABLE IF NOT EXISTS tribe_logs (tribe_id TEXT, log TEXT, timestamp INTEGER, discord_id TEXT);
  CREATE TABLE IF NOT EXISTS payments (discord_id TEXT, amount REAL, timestamp INTEGER);
  CREATE TABLE IF NOT EXISTS premium_users (discord_id TEXT PRIMARY KEY, tier TEXT, expiry BIGINT);
  CREATE TABLE IF NOT EXISTS servers (server_id TEXT PRIMARY KEY, nitrado_token TEXT, beacon_key TEXT, owner_id TEXT, cluster_id TEXT, guild_id TEXT);
  CREATE TABLE IF NOT EXISTS detections (type TEXT, gamertag TEXT, timestamp INTEGER);
  CREATE TABLE IF NOT EXISTS tribe_connections (token TEXT PRIMARY KEY, tribe_id TEXT, server_id TEXT);
  CREATE TABLE IF NOT EXISTS api_usage (date TEXT PRIMARY KEY, count INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS logs (id SERIAL PRIMARY KEY, user_id TEXT, command TEXT, timestamp BIGINT, details TEXT);
`).catch(err => console.error('Error creating tables:', err.message));

// Bot Ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  const { REST, Routes } = require('discord.js');
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const commands = client.commands.map(cmd => cmd.data.toJSON());
  await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
  console.log('Slash commands registered!');

  // Animated Status
  const statusMessages = [
    () => `Managing ${client.guilds.cache.size} servers`,
    async () => `Players: ${(await db.query('SELECT COUNT(*) FROM linked_accounts')).rows[0].count} online`,
    () => 'ASE Management v1.0'
  ];
  let statusIndex = 0;
  setInterval(async () => {
    const msg = await statusMessages[statusIndex]();
    client.user.setActivity(msg, { type: ActivityType.Playing });
    statusIndex = (statusIndex + 1) % statusMessages.length;
  }, 30000);

  scheduleTasks(client, db);
});

// Guild Join Setup
client.on('guildCreate', async guild => {
  const aseRole = await guild.roles.create({ name: 'ASE', color: '#00FF00', permissions: [PermissionsBitField.Flags.Administrator], reason: 'ASE Management role' });
  await guild.channels.create({ name: 'server-status', type: 0, permissionOverwrites: [{ id: guild.id, allow: ['ViewChannel'], deny: ['SendMessages'] }] });
  await guild.channels.create({ name: 'leaderboards', type: 0, permissionOverwrites: [{ id: guild.id, allow: ['ViewChannel'], deny: ['SendMessages'] }] });
  await guild.channels.create({ name: 'command-logs', type: 0, permissionOverwrites: [{ id: guild.id, deny: ['ViewChannel'] }, { id: aseRole.id, allow: ['ViewChannel'] }] });
  await guild.channels.create({ name: 'anti-cheat-logs', type: 0, permissionOverwrites: [{ id: guild.id, deny: ['ViewChannel'] }, { id: aseRole.id, allow: ['ViewChannel'] }] });
  await guild.channels.create({ name: 'rate-limit-log', type: 0, permissionOverwrites: [{ id: guild.id, deny: ['ViewChannel'] }, { id: aseRole.id, allow: ['ViewChannel'] }] });
  await guild.channels.create({ name: 'ban-logs', type: 0, permissionOverwrites: [{ id: guild.id, deny: ['ViewChannel'] }, { id: aseRole.id, allow: ['ViewChannel'] }] });
  console.log(`Joined ${guild.name} and set up channels`);
});

// Interaction Handler
client.on('interactionCreate', async interaction => {
  if (!interaction.inGuild()) {
    if (interaction.isCommand()) await interaction.reply(createEmbed('Error', 'Commands only work in servers!', [], '#FF0000', [], true));
    return;
  }

  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const aseRole = interaction.guild.roles.cache.find(r => r.name === 'ASE');
    const isAdmin = interaction.member.roles.cache.has(aseRole?.id) || interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isOwner = interaction.user.id === OWNER_ID;
    const { rows: premium } = await db.query('SELECT tier, expiry FROM premium_users WHERE discord_id = $1 AND expiry > $2', [interaction.user.id, Date.now()]);
    const isPremium = premium.length > 0;

    if (command.ownerOnly && !isOwner) return await interaction.reply(createEmbed('Permission Denied', 'Bot owner only!', [], '#FF0000', [], true));
    if (command.adminOnly && !isAdmin && !isOwner) return await interaction.reply(createEmbed('Permission Denied', 'Requires ASE role or admin!', [], '#FF0000', [], true));
    if (command.premiumOnly && !isPremium && !isOwner) return await interaction.reply(createEmbed('Premium Required', 'Subscribe for access!', [], '#FF0000', [], true));

    try {
      await db.query('INSERT INTO logs (user_id, command, timestamp, details) VALUES ($1, $2, $3, $4)', 
        [interaction.user.id, interaction.commandName, Date.now(), JSON.stringify(interaction.options.data)]);
      await command.execute(interaction, db, client);
      const logChannel = interaction.guild.channels.cache.find(c => c.name === 'command-logs');
      if (logChannel) await logChannel.send(createEmbed('Command Log', `${interaction.user.tag} ran /${interaction.commandName}`, [
        { name: 'Options', value: interaction.options.data.length ? interaction.options.data.map(o => `${o.name}: ${o.value}`).join('\n') : 'None' }
      ]));
    } catch (error) {
      console.error(error);
      await interaction.reply(createEmbed('Error', error.message || 'Command failed!', [], '#FF0000', [], true));
    }
  } else if (interaction.isButton() || interaction.isModalSubmit()) {
    const [cmd, action, ...rest] = interaction.customId.split('_');
    const command = client.commands.get(cmd);
    if (command) {
      if (interaction.isButton()) await command.handleButton?.(interaction, db, client);
      if (interaction.isModalSubmit()) await command.handleModal?.(interaction, db, client);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);