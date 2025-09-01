const BaseRepository = require("./BaseRepository");

class ArtistRepository extends BaseRepository {
    constructor() {
        super("artistas", "../../catalogos/knexfile.js");
    }
}

module.exports = ArtistRepository;
