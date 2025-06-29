const clientMap = new Map();

/***
 * isolating sync response to enforce proper standard
 * @param {Response} response this is the response object
 * @param {Object} stats all the sync values
 * @param {number} stats.commit the amount of commit synced
 * @param {string} message the final overview message
 * @param {boolean} [isSyncing=true] syncing status
 * @returns {void} no returns
 */
const respond = (response, stats, message, isSyncing = true) => {
  response.write(JSON.stringify({ isSyncing, stats, message }) + "\n");
  if (!isSyncing) {
    response.end();
  }
};

/**
 * add a new client to the client map
 * @param {String} userId defines the uniquenes of the client
 * @param {Response} response the response object for the client
 * @returns {void} no returns
 */
exports.addClient = (userId, response) => {
  clientMap.set(userId, { response, stats: {} });
  respond(response, {}, "Client connected successfully!");
};

/**
 * remove client from the client map
 * @param {String} userId defines the uniqueness of the client
 * @returns {void} no returns
 */
exports.removeClient = (userId) => {
  clientMap.delete(userId);
};

/**
 * send update to the client
 * @param {String} userId the userdId to identify in case of multiple connections
 * @param {Object.<string, number>} update the individual increments in syncing status
 * @param {boolean} [=false] completed is syncing complete
 * @returns {void} no returns
 */
exports.sentToClient = (userId, update, completed = false) => {
  if (!clientMap.has(userId)) {
    return;
  }
  const { response, stats } = clientMap.get(userId);
  const message = "";
  for (key in update) {
    stats[key] = stats[key] ? stats[key] + update[key] : update[key];
    message = message + ` ${stats[key]} ${key}`;
  }
  clientMap.set(userId, { response, stats });
  respond(response, stats, `Syncing! ${message} synced already`, !completed);
};
