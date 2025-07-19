const BaseRepository = require('./BaseRepository');

class GenreRepository extends BaseRepository {
    constructor() {
        super('genres');
    }
}

module.exports = GenreRepository;
