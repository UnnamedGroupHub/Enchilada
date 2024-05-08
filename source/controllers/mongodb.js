import { MongoClient } from "mongodb";

/**
 * Connects to the database.
 * This is called automatically by other functions.
 * You should not need to call this manually.
 *
 * @returns {Promise<MongoClient>} The connected MongoDB client
 */
export async function connect() {
  const mongo = new MongoClient(process.env.MONGODB_URL, {
    retryWrites: true,
    writeConcern: "majority",
  });

  await mongo.connect();

  return mongo;
}

/**
 * Inserts an object into the database.
 *
 * @param {string} table The table to insert into
 * @param {object | object[]} objects The object(s) to insert
 *
 * @returns {Promise<object>} The inserted object(s)
 *
 * @example insert("users", { id: "123", name: "Bob" });
 */
export async function insert(table, objects) {
  const mongo = await connect();

  // if the object is not an array, make it an array
  if (!Array.isArray(objects)) objects = [objects];

  const data = await mongo
    .db(process.env.ENVIRONMENT)
    .collection(table)
    .insertMany(objects);

  await mongo.close();

  return data;
}

/**
 * Replace an object in the database, or inserts it if it doesn't exist.
 *
 * @param {string} table The table to replace
 * @param {object} filter The filter to use
 * @param {object} object The object to replace with
 *
 * @returns {Promise<object>} The replaced object
 *
 * @example replace("users", { id: "123" }, { id: "123", name: "Bob" });
 */
export async function replace(table, filter, object) {
  const mongo = await connect();

  const data = await mongo
    .db(process.env.ENVIRONMENT)
    .collection(table)
    .updateMany(filter, { $set: object }, { upsert: true });

  await mongo.close();

  return data;
}

/**
 * Updates an object in the database, or inserts it if it doesn't exist.
 *
 * @param {string} table The table to update
 * @param {object} filter The filter to use
 *
 * @returns {Promise<object>} The updated object
 *
 * @example update("users", { id: "123" }, { name: "Bob" });
 */
export async function upsert(table, filter, object) {
  const mongo = await connect();

  const data = await mongo
    .db(process.env.ENVIRONMENT)
    .collection(table)
    .updateMany(filter, object, { upsert: true });

  await mongo.close();

  return data;
}

/**
 * Finds objects in the database that match the filter.
 * If no filter is provided, it will return all objects.
 *
 * @param {string} table The table to find from
 * @param {object} filter The filter to use
 *
 * @returns {Promise<object[]>} The found objects
 *
 * @example find("users", { id: "123" });
 */
export async function find(table, filter) {
  const mongo = await connect();

  const data = await mongo
    .db(process.env.ENVIRONMENT)
    .collection(table)
    .find(filter)
    .toArray();

  await mongo.close();

  return data || [];
}

/**
 * Deletes objects in the database that match the filter.
 * If no filter is provided, it will delete all objects.
 *
 * @param {string} table The table to delete from
 * @param {object} filter The filter to use
 *
 * @returns {Promise<object>} The deleted objects
 *
 * @example remove("users", { id: "123" });
 */
export async function remove(table, filter) {
  const mongo = await connect();

  const data = await mongo
    .db(process.env.ENVIRONMENT)
    .collection(table)
    .deleteMany(filter);

  await mongo.close();

  return data;
}

export default { connect, insert, replace, upsert, find, remove };
