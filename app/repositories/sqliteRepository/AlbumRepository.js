const BaseRepository = require("./BaseRepository");

class AlbumRepository extends BaseRepository {
    constructor() {
        super("albums");
    }

    getAlbumsByArtistId(artistId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM ${this.tableName} WHERE artistid = ?`,
                [artistId],
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

module.exports = AlbumRepository;
