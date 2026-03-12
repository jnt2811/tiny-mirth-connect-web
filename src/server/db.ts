import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env["MYSQL_HOST"] ?? "192.168.1.184",
  port: Number(process.env["MYSQL_PORT"] ?? 3306),
  user: process.env["MYSQL_USER"] ?? "root",
  password: process.env["MYSQL_PASSWORD"] ?? "12345",
  database: process.env["SIMPLE_MIRTH_DB_NAME"] ?? "mirth_meta_data",
  waitForConnections: true,
  connectionLimit: 10,
});
