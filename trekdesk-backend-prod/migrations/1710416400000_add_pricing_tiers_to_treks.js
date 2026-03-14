exports.up = (pgm) => {
  pgm.addColumn("treks", {
    pricing_tiers: {
      type: "jsonb",
      notNull: false,
      default: "[]",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("treks", "pricing_tiers");
};
