const { createRxDatabase, addRxPlugin } = require('rxdb');
const { getRxStorageMemory } = require('rxdb/plugins/storage-memory');
const { RxDBQueryBuilderPlugin } = require('rxdb/plugins/query-builder');

addRxPlugin(RxDBQueryBuilderPlugin);

const notificationSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id:         { type: 'string', maxLength: 100 },
    user_id:    { type: 'string' },
    type:       { type: 'string' },
    message:    { type: 'string' },
    read:       { type: 'boolean', default: false },
    created_at: { type: 'string' },
  },
  required: ['id', 'user_id', 'type', 'message', 'created_at'],
};

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await createRxDatabase({
      name: 'notificationsdb',
      storage: getRxStorageMemory(),
      ignoreDuplicate: true,
    });
    await dbInstance.addCollections({
      notifications: { schema: notificationSchema },
    });
    console.log('[ms-notifications] RxDB initialisée');
  }
  return dbInstance;
}

module.exports = { getDb };
