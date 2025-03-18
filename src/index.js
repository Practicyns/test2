const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const { setupBot } = require('./utils/setup');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.data.name, command);
  }
}

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to SQLite database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS admins (gamertag TEXT PRIMARY KEY)`);
  db.run(`CREATE TABLE IF NOT EXISTS linked_accounts (discord_id TEXT PRIMARY KEY, gamertag TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS bans (gamertag TEXT PRIMARY KEY, duration INTEGER, timestamp INTEGER, server_id TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS tribe_logs (tribe_id TEXT, log TEXT, timestamp INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (discord_id TEXT, amount REAL, timestamp INTEGER)`);
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await setupBot(client, db);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, db);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Error executing command!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);