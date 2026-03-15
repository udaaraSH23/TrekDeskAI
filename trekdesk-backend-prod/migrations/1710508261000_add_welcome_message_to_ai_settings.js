
module.exports.up = (pgm) => {
  pgm.addColumns('ai_settings', {
    welcome_message: { type: 'text', nullable: true }
  });
};

module.exports.down = (pgm) => {
  pgm.dropColumns('ai_settings', 'welcome_message');
};
