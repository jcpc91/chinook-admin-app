const BaseRepository = require('./BaseRepository');

class AlbumRepository extends BaseRepository {
    constructor() {
        super('albums');
    }
}

module.exports = AlbumRepository;
