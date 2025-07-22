const BaseRepository = require("./BaseRepository");

class GenreRepository extends BaseRepository {
    constructor() {
        super("generos");
    }
}

module.exports = GenreRepository;
