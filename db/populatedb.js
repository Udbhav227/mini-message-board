require("dotenv").config();
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text TEXT NOT NULL,
  "user" VARCHAR(255) NOT NULL,
  added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO messages (text, "user") 
VALUES
  ('Hi there!', 'Amando'),
  ('Hello World!', 'Charles'),
  ('PostgreSQL makes this so much better.', 'Ash');
`;

async function main() {
  console.log("Seeding db...");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    await client.query(SQL);
    console.log("Db seeded successfully!");
  } catch (error) {
    console.error("Error seeding db:", error);
  } finally {
    await client.end();
  }
}

main();