const BaseRepository = require("./BaseRepository");
const path = require("path");

class ArtistRepository extends BaseRepository {
    constructor() {
        super("artistas", path.resolve(__dirname, "../../../.db/catalogos.sqlite3"));
    }
}

module.exports = ArtistRepository;
