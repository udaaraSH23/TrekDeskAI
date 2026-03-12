exports.up = (pgm) => {
  pgm.createTable("bookings", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    tenant_id: {
      type: "uuid",
      notNull: true,
      references: '"tenants"', // Assuming 'tenants' table exists, adjust if needed based on actual schema
      onDelete: "CASCADE",
    },
    trek_id: {
      type: "uuid",
      notNull: true,
      references: '"treks"',
      onDelete: "CASCADE",
    },
    session_id: {
      type: "varchar(255)", // To link back to verbal session logs
      notNull: false,
    },
    customer_name: {
      type: "varchar(255)",
      notNull: true,
    },
    customer_email: {
      type: "varchar(255)",
      notNull: false, // Optional for MVP voice interaction
    },
    customer_phone: {
      type: "varchar(50)",
      notNull: true, // Specifically requested to secure bookings via WhatsApp
    },
    pax: {
      type: "integer",
      notNull: true,
    },
    target_date: {
      type: "date",
      notNull: true,
    },
    status: {
      type: "varchar(50)",
      notNull: true,
      default: "pending", // e.g., pending, payment_required, confirmed, cancelled
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Adding indexes for performance on frequent queries
  pgm.createIndex("bookings", "tenant_id");
  pgm.createIndex("bookings", "trek_id");
  pgm.createIndex("bookings", "status");
  pgm.createIndex("bookings", "target_date");
};

exports.down = (pgm) => {
  pgm.dropTable("bookings");
};
