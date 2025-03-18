const fs = require('fs');
const { createFancyEmbed } = require('./embeds');

async function setupBot(client, db) {
  const configPath = './config.json';
  const config = JSON.parse(fs.readFileSync(configPath));
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
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      db.run(`INSERT OR REPLACE INTO config (key, value) VALUES ('nitradoToken', ?)`, [token]);
      await channel.send('Configuration saved! Add server IDs next using `/servermanagement`.');
      collector.stop();
    });
  }
}

module.exports = { setupBot };