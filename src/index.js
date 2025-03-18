const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Client: PgClient } = require('pg');
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

const db = new PgClient({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to Postgres:', err.message);
  } else {
    console.log('Connected to Postgres database.');
  }
});

db.query(`
  CREATE TABLE IF NOT EXISTS admins (
    gamertag TEXT PRIMARY KEY
  );
  CREATE TABLE IF NOT EXISTS linked_accounts (
    discord_id TEXT PRIMARY KEY,
    gamertag TEXT
  );
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS bans (
    gamertag TEXT PRIMARY KEY,
    duration INTEGER,
    timestamp INTEGER,
    server_id TEXT
  );
  CREATE TABLE IF NOT EXISTS tribe_logs (
    tribe_id TEXT,
    log TEXT,
    timestamp INTEGER
  );
  CREATE TABLE IF NOT EXISTS payments (
    discord_id TEXT,
    amount REAL,
    timestamp INTEGER
  );
`).catch(err => console.error('Error creating tables:', err.message));

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