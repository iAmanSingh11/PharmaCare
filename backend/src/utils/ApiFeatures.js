/**
 * Wraps a Mongoose Query to apply common list-endpoint features from
 * req.query in a consistent way across controllers.
 *
 * Supported query params:
 *   ?search=paracetamol        -> text search
 *   ?category=Pain Relief      -> exact-match filters (whitelisted per use)
 *   ?sort=-createdAt,price     -> comma separated, "-" prefix = descending
 *   ?page=2&limit=20           -> pagination
 *   ?fields=name,price         -> field projection
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(searchableFallback = []) {
    if (this.queryString.search) {
      this.query = this.query.find({ $text: { $search: this.queryString.search } });
    }
    return this;
  }

  filter(allowedFields = []) {
    const filters = {};
    allowedFields.forEach((field) => {
      if (this.queryString[field] !== undefined) {
        filters[field] = this.queryString[field];
      }
    });

    if (this.queryString.minPrice || this.queryString.maxPrice) {
      filters.sellingPrice = {};
      if (this.queryString.minPrice) filters.sellingPrice.$gte = Number(this.queryString.minPrice);
      if (this.queryString.maxPrice) filters.sellingPrice.$lte = Number(this.queryString.maxPrice);
    }

    this.query = this.query.find(filters);
    return this;
  }

  sort(defaultSort = '-createdAt') {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : defaultSort;
    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

module.exports = ApiFeatures;
