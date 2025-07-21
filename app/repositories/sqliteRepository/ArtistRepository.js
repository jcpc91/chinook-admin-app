const BaseRepository = require("./BaseRepository");

class ArtistRepository extends BaseRepository {
    constructor() {
        super("artistas");
    }
}

module.exports = ArtistRepository;
