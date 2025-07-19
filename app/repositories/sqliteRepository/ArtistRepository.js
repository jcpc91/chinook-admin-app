const BaseRepository = require('./BaseRepository');

class ArtistRepository extends BaseRepository {
    constructor() {
        super('artists');
    }
}

module.exports = ArtistRepository;
