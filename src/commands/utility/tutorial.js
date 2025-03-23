const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, createProgressBar } = require('../../utils/embedUtils');

module.exports = {
  data: new SlashCommandBuilder().setName('tutorial').setDescription('Interactive tutorial for ASE Management'),
  async execute(interaction) {
    const steps = [
      'Link your gamertag with /linkgamertag.',
      'Check your profile with /profile.',
      'View server population with /serverpop.',
      'Connect your tribe bot with /connecttribebot.',
      'Explore all commands with /help!'
    ];
    await interaction.reply(createEmbed('Tutorial - Step 1', steps[0], [{ name: 'Progress', value: createProgressBar(1, steps.length) }], '#00FF00', [
      { id: 'tutorial_next_0', label: 'Next' }
    ]));
  },
  async handleButton(interaction) {
    const [_, action, step] = interaction.customId.split('_');
    const steps = [
      'Link your gamertag with /linkgamertag.',
      'Check your profile with /profile.',
      'View server population with /serverpop.',
      'Connect your tribe bot with /connecttribebot.',
      'Explore all commands with /help!'
    ];
    const currentStep = parseInt(step);
    if (action === 'next' && currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      await interaction.update(createEmbed(`Tutorial - Step ${nextStep + 1}`, steps[nextStep], [{ name: 'Progress', value: createProgressBar(nextStep + 1, steps.length) }], '#00FF00', [
        nextStep < steps.length - 1 ? { id: `tutorial_next_${nextStep}`, label: 'Next' } : { id: 'tutorial_finish', label: 'Finish' },
        { id: `tutorial_back_${nextStep}`, label: 'Back' }
      ]));
    } else if (action === 'back' && currentStep > 0) {
      const prevStep = currentStep - 1;
      await interaction.update(createEmbed(`Tutorial - Step ${prevStep + 1}`, steps[prevStep], [{ name: 'Progress', value: createProgressBar(prevStep + 1, steps.length) }], '#00FF00', [
        { id: `tutorial_next_${prevStep}`, label: 'Next' },
        prevStep > 0 ? { id: `tutorial_back_${prevStep}`, label: 'Back' } : null
      ].filter(Boolean)));
    } else if (action === 'finish') {
      await interaction.update(createEmbed('Tutorial Complete', 'You’re ready to use ASE Management!', []));
    }
  }
};