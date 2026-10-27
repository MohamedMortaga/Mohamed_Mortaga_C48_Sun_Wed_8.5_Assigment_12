export async function findOneDoc({ model, filter = {}, projection } = {}) {
  return await model.findOne(filter, projection);
}

export async function findByIdDoc({ model, id, projection } = {}) {
  return await model.findById(id, projection);
}

export async function createDoc({ model, insertedData, options } = {}) {
  return await model.create([insertedData], options);
}

export async function deleteDoc({ model, filter = {} } = {}) {
  return await model.deleteOne(filter);
}

export async function findAllDoc({
  model,
  filter = {},
  projection,
  pagination = { limit: 5, page: 1 },
  populate = "",
} = {}) {
  const query = model.find(filter, projection);

  if (populate) {
    query.populate(populate);
  }

  if (pagination) {
    const { limit, page } = pagination;

    const skip = (page - 1) * limit;

    query.skip(skip);
    query.limit(limit);
  }

  return await query.exec();
}