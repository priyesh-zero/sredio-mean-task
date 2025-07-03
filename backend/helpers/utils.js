const { default: mongoose } = require("mongoose");

// Utility method for delays
exports.sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Recursively retrieves all field paths from a Mongoose schema, including nested
 * fields and fields within sub-schemas or arrays of sub-documents.
 *
 * @param {mongoose.Schema} schema - The Mongoose schema to extract paths from.
 * @param {string} [prefix=""] - (Optional) A prefix used for recursion to build full paths.
 * @returns {string[]} An array of full dot-notated field paths in the schema.
 *
 * @example
 * const schema = new mongoose.Schema({
 *   name: String,
 *   genre: [{ id: String, name: String }],
 *   metadata: { altTitle: String }
 * });
 *
 * const paths = getAllSchemaPaths(schema);
 * // Result: ['name', 'genre.id', 'genre.name', 'metadata.altTitle', '_id', '__v']
 */
const getAllSchemaPaths = (schema, prefix = "") => {
  const paths = [];

  schema.eachPath((path, type) => {
    const fullPath = prefix ? `${prefix}.${path}` : path;

    if (
      type instanceof mongoose.Schema.Types.DocumentArray ||
      type.constructor.name === "DocumentArrayPath"
    ) {
      // Recurse into embedded document/array schemas
      const subSchema = type.schema;
      paths.push(...getAllSchemaPaths(subSchema, fullPath));
    } else if (type.schema) {
      // Recurse into sub-schema
      paths.push(...getAllSchemaPaths(type.schema, fullPath));
    } else {
      paths.push(fullPath);
    }
  });

  return paths;
};

exports.getAllSchemaPaths = getAllSchemaPaths;
