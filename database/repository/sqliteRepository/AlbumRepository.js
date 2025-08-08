const BaseRepository = require("./BaseRepository");
const path = require("path")

class AlbumRepository extends BaseRepository {
    constructor() {
        super("albums", path.resolve(__dirname, "../../.db/catalogos.sqlite3"));
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
