const BaseRepository = require("./BaseRepository");
const path = require("path");

class GenreRepository extends BaseRepository {
    constructor() {
        super("generos", path.resolve(__dirname, "../../../.db/catalogos.sqlite3"));
    }
}

module.exports = GenreRepository;
