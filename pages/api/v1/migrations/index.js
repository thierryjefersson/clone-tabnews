import controller from "infra/controller";
import database from "infra/database";
import { createRouter } from "next-connect";
import migrationsRunner from "node-pg-migrate";
import { resolve } from "node:path";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dir: resolve("infra", "migration"),
  direction: "up",
  verbose: true,
  dryRun: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationsRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient?.end();
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationsRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient,
    });

    if (migratedMigrations.length > 0)
      return response.status(201).json(migratedMigrations);

    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient?.end();
  }
}
