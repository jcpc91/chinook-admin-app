const BaseRepository = require("./BaseRepository");

class MediaTypeRepository extends BaseRepository {
    constructor() {
        super("mediatypes");
    }
}

module.exports = MediaTypeRepository;
