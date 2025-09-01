const BaseRepository = require("./BaseRepository");

class MediaTypeRepository extends BaseRepository {
    constructor() {
        super("mediatypes", "../../catalogos/knexfile.js");
    }
}

module.exports = MediaTypeRepository;
