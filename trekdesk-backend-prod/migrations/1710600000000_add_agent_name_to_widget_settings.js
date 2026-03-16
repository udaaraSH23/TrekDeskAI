
module.exports.shorthands = undefined;

module.exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE widget_settings 
    ADD COLUMN IF NOT EXISTS agent_name VARCHAR(100) DEFAULT 'TrekDesk AI';
  `);
};

module.exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE widget_settings 
    DROP COLUMN IF EXISTS agent_name;
  `);
};
