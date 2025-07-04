const normalizePath = (path) => {
  return path.replace(/\[(\d+)\]/g, ".$1");
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.parseSorting = (sortingString) => {
  if (!sortingString) {
    return [];
  }

  const sortingData = JSON.parse(sortingString);

  if (sortingData.length <= 0) {
    return [];
  }

  const sort = Object.fromEntries(
    sortingData.map((sortObject) => {
      const normalizeKey = normalizePath(sortObject.colId);
      return [normalizeKey, sortObject.sort === "asc" ? 1 : -1];
    }),
  );

  return [
    {
      $sort: sort,
    },
  ];
};

const filterTypeToQuery = (key, filter) => {
  switch (filter.type) {
    case "contains":
      return {
        [key]: {
          $regex: new RegExp(escapeRegExp(filter.filter), "i"),
        },
      };
    case "notContains":
      return {
        [key]: {
          $regex: new RegExp(`^(?!.*${escapeRegExp(filter.filter)}).*$`, "i"),
        },
      };
    case "equals":
      return {
        [key]: filter.filter,
      };
    case "notEqual":
      return {
        [key]: {
          $ne: filter.filter,
        },
      };
    case "startsWith": {
      return {
        [key]: {
          $regex: new RegExp(`^${escapeRegExp(filter.filter)}`, "i"),
        },
      };
    }
    case "endsWith": {
      return {
        [key]: {
          $regex: new RegExp(`${escapeRegExp(filter.filter)}$`, "i"),
        },
      };
    }
    case "blank": {
      return {
        $or: [{ [key]: { $exists: false } }, { [key]: null }, { [key]: "" }],
      };
    }
    case "notBlank":
      return {
        [key]: { $exists: true, $nin: [null, ""] },
      };
    default:
      throw new Error("Not Implemented");
  }
};

exports.parseColumnFilters = (filterString) => {
  if (!filterString) {
    return [];
  }

  const filterData = JSON.parse(filterString);

  if (Object.keys(filterData).length <= 0) {
    return [];
  }

  const columnFilterQuery = Object.entries(filterData).flatMap(
    ([key, filter]) => {
      if (filter.operator) {
        if (filter.operator === "AND") {
          return filter.conditions.map((cond) => filterTypeToQuery(key, cond));
        }
        return {
          $or: filter.conditions.map((cond) => filterTypeToQuery(key, cond)),
        };
      }
      return filterTypeToQuery(key, filter);
    },
  );

  return columnFilterQuery;
};
