class NDJSON {
  static stringify (object) {
    return JSON.stringify(object) + '\n'
  }
}

module.exports = NDJSON
