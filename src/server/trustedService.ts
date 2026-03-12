import { createServerFn } from "@tanstack/react-start";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";

export interface TrustedService extends RowDataPacket {
  ID: number;
  SERVICE_NAME: string;
  SERVICE_HOST: string;
  STATUS: number;
  service_secret: number;
}

export const getTrustedServices = createServerFn().handler(async () => {
  const [rows] = await db.query<TrustedService[]>(
    "SELECT * FROM TRUSTED_SERVICE ORDER BY ID",
  );
  return rows;
});

export const createTrustedService = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { SERVICE_NAME: string; SERVICE_HOST: string; STATUS: number }) =>
      data,
  )
  .handler(async ({ data }) => {
    await db.execute(
      "INSERT INTO TRUSTED_SERVICE (SERVICE_NAME, SERVICE_HOST, STATUS, service_secret) VALUES (?, ?, ?, 1)",
      [data.SERVICE_NAME, data.SERVICE_HOST, data.STATUS],
    );
  });

export const updateTrustedService = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      ID: number;
      SERVICE_NAME: string;
      SERVICE_HOST: string;
      STATUS: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    await db.execute(
      "UPDATE TRUSTED_SERVICE SET SERVICE_NAME = ?, SERVICE_HOST = ?, STATUS = ? WHERE ID = ?",
      [data.SERVICE_NAME, data.SERVICE_HOST, data.STATUS, data.ID],
    );
  });

export const updateTrustedServiceStatus = createServerFn({ method: "POST" })
  .inputValidator((data: { ID: number; STATUS: number }) => data)
  .handler(async ({ data }) => {
    await db.execute("UPDATE TRUSTED_SERVICE SET STATUS = ? WHERE ID = ?", [
      data.STATUS,
      data.ID,
    ]);
  });
