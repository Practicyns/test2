const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, createProgressBar } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('setup').setDescription('Setup wizard for ASE Management'),
  async execute(interaction, db) {
    const steps = [
      { title: 'Step 1: Link Gamertag', desc: 'Run /linkgamertag to connect your Xbox account.', button: 'linkgamertag_form' },
      { title: 'Step 2: Setup Cluster', desc: 'Admins: Use /servermanagement to configure your cluster.', button: 'servermanagement_setup' },
      { title: 'Step 3: Features', desc: 'Toggle features below:', toggles: [
        { id: 'toggle_anticheat', label: 'Anti-Cheat' },
        { id: 'toggle_tribelog', label: 'Tribe Logging' },
        { id: 'toggle_leaderboards', label: 'Leaderboards' }
      ] },
      { title: 'Step 4: Explore', desc: 'Check out /help for all commands!' }
    ];
    await interaction.reply(createEmbed(steps[0].title, steps[0].desc, [{ name: 'Progress', value: createProgressBar(1, steps.length) }], '#00FF00', [
      steps[0].button ? { id: `${steps[0].button}_0`, label: 'Start' } : null,
      { id: 'setup_next_0', label: 'Next' }
    ].filter(Boolean)));
  },
  async handleButton(interaction, db, client) {
    const [_, action, step] = interaction.customId.split('_');
    const steps = [
      { title: 'Step 1: Link Gamertag', desc: 'Run /linkgamertag to connect your Xbox account.', button: 'linkgamertag_form' },
      { title: 'Step 2: Setup Cluster', desc: 'Admins: Use /servermanagement to configure your cluster.', button: 'servermanagement_setup' },
      { title: 'Step 3: Features', desc: 'Toggle features below:', toggles: [
        { id: 'toggle_anticheat', label: 'Anti-Cheat' },
        { id: 'toggle_tribelog', label: 'Tribe Logging' },
        { id: 'toggle_leaderboards', label: 'Leaderboards' }
      ] },
      { title: 'Step 4: Explore', desc: 'Check out /help for all commands!' }
    ];
    const currentStep = parseInt(step);
    if (action === 'next' && currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      const buttons = steps[nextStep].button ? [{ id: `${steps[nextStep].button}_${nextStep}`, label: 'Start' }] : 
        steps[nextStep].toggles ? steps[nextStep].toggles : [];
      buttons.push({ id: `setup_next_${nextStep}`, label: 'Next' }, { id: `setup_back_${nextStep}`, label: 'Back' });
      if (nextStep === steps.length - 1) buttons[buttons.length - 2] = { id: 'setup_finish', label: 'Finish' };
      await interaction.update(createEmbed(steps[nextStep].title, steps[nextStep].desc, [{ name: 'Progress', value: createProgressBar(nextStep + 1, steps.length) }], '#00FF00', buttons));
    } else if (action === 'back' && currentStep > 0) {
      const prevStep = currentStep - 1;
      const buttons = steps[prevStep].button ? [{ id: `${steps[prevStep].button}_${prevStep}`, label: 'Start' }] : 
        steps[prevStep].toggles ? steps[prevStep].toggles : [];
      buttons.push({ id: `setup_next_${prevStep}`, label: 'Next' });
      if (prevStep > 0) buttons.push({ id: `setup_back_${prevStep}`, label: 'Back' });
      await interaction.update(createEmbed(steps[prevStep].title, steps[prevStep].desc, [{ name: 'Progress', value: createProgressBar(prevStep + 1, steps.length) }], '#00FF00', buttons));
    } else if (action === 'finish') {
      await db.query('INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', ['setup_complete_' + interaction.guild.id, 'true']);
      await interaction.update(createEmbed('Setup Complete', 'Welcome to ASE Management!', []));
    } else if (action.startsWith('toggle')) {
      const feature = action.split('_')[1];
      const enabled = await db.query('SELECT value FROM config WHERE key = $1', [`${feature}_${interaction.guild.id}`]);
      const newValue = enabled.rows[0]?.value === 'true' ? 'false' : 'true';
      await db.query('INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [`${feature}_${interaction.guild.id}`, newValue]);
      await interaction.reply(createEmbed('Feature Toggled', `${feature} is now ${newValue === 'true' ? 'enabled' : 'disabled'}`, [], '#00FF00', [], true));
    } else {
      const command = client.commands.get(action.split('_')[0]);
      if (command) await command.execute(interaction, db, client);
    }
  }
};