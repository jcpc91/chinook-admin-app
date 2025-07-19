const BaseRepository = require('./BaseRepository');

class MediaTypeRepository extends BaseRepository {
    constructor() {
        super('media_types');
    }
}

module.exports = MediaTypeRepository;
