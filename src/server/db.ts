import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env["DB_HOST"] ?? "10.8.0.184",
  port: Number(process.env["DB_PORT"] ?? 3306),
  user: process.env["DB_USER"] ?? "root",
  password: process.env["DB_PASSWORD"] ?? "12345",
  database: process.env["DB_NAME"] ?? "mirth_meta_data",
  waitForConnections: true,
  connectionLimit: 10,
});
