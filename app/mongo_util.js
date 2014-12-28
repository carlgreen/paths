exports.demongofy_ids = function(data) {
  if (!Array.isArray(data)) {
    return data;
  }
  for (var i = 0; i < data.length; i++) {
    if ('_id' in data[i]) {
      data[i].id = data[i]._id;
      delete data[i]._id;
    }
  }
  return data;
};
