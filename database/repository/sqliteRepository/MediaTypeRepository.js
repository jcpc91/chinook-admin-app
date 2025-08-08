const BaseRepository = require("./BaseRepository");
const path = require("path")

class MediaTypeRepository extends BaseRepository {
    constructor() {
        super("mediatypes", path.resolve(__dirname, "../../../.db/catalogos.sqlite3"));
    }
}

module.exports = MediaTypeRepository;
