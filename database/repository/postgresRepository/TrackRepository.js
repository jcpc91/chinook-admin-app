const BaseRepository = require("./BaseRepository");

class TrackRepository extends BaseRepository {
    constructor() {
        super("traks", "../../catalogos/knexfile.js");
    }
}

module.exports = TrackRepository;
