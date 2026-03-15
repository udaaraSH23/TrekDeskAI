
module.exports.up = (pgm) => {
  pgm.addColumns('ai_settings', {
    assistant_name: { type: 'string', length: 100, default: 'TrekDesk Assistant' }
  });
};

module.exports.down = (pgm) => {
  pgm.dropColumns('ai_settings', 'assistant_name');
};
