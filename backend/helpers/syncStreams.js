const clients = new Map();

exports.addClient = (id, res) => {
  clients.set(id, res);
};

exports.removeClient = (id) => {
  clients.delete(id);
};

exports.sendToClient = (id, data) => {
  const res = clients.get(id);
  if (res) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};
