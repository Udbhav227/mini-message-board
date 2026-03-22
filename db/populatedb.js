require("dotenv").config();
const { Client } = require("pg");

const SQL = `
DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  text TEXT NOT NULL,
  "user" VARCHAR(255) NOT NULL,
  likes INTEGER DEFAULT 0,
  flags INTEGER DEFAULT 0,
  added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO messages (text, "user", likes, flags) 
VALUES
  ('Hi there!', 'Amando', 5, 0),
  ('Hello World!', 'Charles', 2, 1),
  ('PostgreSQL makes this so much better.', 'Ash', 10, 0),
  ('Spam message that people are reporting.', 'Spammer99', 0, 4);
`;

async function main() {
  console.log("Seeding database...");

  const client = new Client({
    connectionString: process.env.DB_URL,
  });

  try {
    await client.connect();
    await client.query(SQL);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.end();
  }
}

main();
