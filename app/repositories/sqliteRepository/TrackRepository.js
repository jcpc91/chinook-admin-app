const BaseRepository = require('./BaseRepository');

class TrackRepository extends BaseRepository {
    constructor() {
        super('tracks');
    }
}

module.exports = TrackRepository;
