// Parses page and limit from query, returns postgres skip/take + meta
const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, parseInt(query.limit) || 25);
  return {
    offset: (page - 1) * limit,
    limit: limit,
    page,
  };
};

module.exports = { getPagination };
