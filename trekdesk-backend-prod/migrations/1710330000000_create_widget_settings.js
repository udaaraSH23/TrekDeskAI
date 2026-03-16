
module.exports.shorthands = undefined;

module.exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS widget_settings (
        tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
        primary_color VARCHAR(7) DEFAULT '#10b981',
        position VARCHAR(10) DEFAULT 'right',
        initial_message TEXT DEFAULT 'Hi! Ready for a GuideTours adventure?',
        allowed_origins TEXT[] DEFAULT '{}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Seed Initial Widget Settings for Kandy Treks
    INSERT INTO widget_settings (tenant_id) 
    VALUES ('00000000-0000-0000-0000-000000000001')
    ON CONFLICT (tenant_id) DO NOTHING;
  `);
};

module.exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS widget_settings;
  `);
};
