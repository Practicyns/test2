const fs = require('fs');
const { createFancyEmbed } = require('./embeds');

async function setupBot(client, db) {
  const configPath = './config.json';
  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath));
  } catch (e) {
    config = { nitradoToken: '', serverIds: [] };
  }

  if (!config.nitradoToken) {
    const channel = client.channels.cache.find(ch => ch.type === 'GUILD_TEXT');
    if (!channel) return;

    const embed = createFancyEmbed(
      'Initial Setup',
      'Please provide your Nitrado API token to get started!',
      [],
      '#FFD700'
    );

    const message = await channel.send({ embeds: [embed] });
    const filter = m => m.author.id === channel.guild.ownerId;
    const collector = channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async m => {
      const token = m.content.trim();
      config.nitradoToken = token;
      try {
        await db.query('INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', ['nitradoToken', token]);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); // Still write locally as fallback
        await channel.send('Configuration saved! Add server IDs next using `/servermanagement`.');
      } catch (err) {
        console.error(err);
        await channel.send('Error saving configuration!');
      }
      collector.stop();
    });
  } else {
    // Load token from DB if file is empty but DB has it
    const { rows } = await db.query('SELECT value FROM config WHERE key = $1', ['nitradoToken']);
    if (rows.length && !config.nitradoToken) {
      config.nitradoToken = rows[0].value;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  }
}

module.exports = { setupBot };