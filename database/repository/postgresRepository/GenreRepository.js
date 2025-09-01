const BaseRepository = require("./BaseRepository");

class GenreRepository extends BaseRepository {
    constructor() {
        super("generos", "../../catalogos/knexfile.js");
    }
}

module.exports = GenreRepository;
