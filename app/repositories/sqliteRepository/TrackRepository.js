const BaseRepository = require("./BaseRepository");

class TrackRepository extends BaseRepository {
    constructor() {
        super("tracks");
    }

    getByIdAlbum(idAlbum) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT t.*, a.title as albumTitle
                from ${this.tableName} t 
                inner join albums a on t.albumid = a.id 
                WHERE albumid = ?`,
                [idAlbum],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(rows);
                },
            );
        });
    }
}

module.exports = TrackRepository;
