const BaseRepository = require("./BaseRepository");

class AlbumRepository extends BaseRepository {
    constructor() {
        super("albunes", "../../catalogos/knexfile.js");
    }
}

module.exports = AlbumRepository;
