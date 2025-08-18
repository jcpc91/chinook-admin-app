const BaseRepository = require("./BaseRepository");
const path = require("path");

class TrackRepository extends BaseRepository {
    constructor() {
        super("tracks", path.resolve(__dirname, "../../../.db/catalogos.sqlite3"));
    }

    async getByIdAlbum(idAlbum) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT t.*, a.title as albumTitle,
                m.title as mediatype, m.id as mediatypeId,
                g.title as genero, g.id as generoId
                from ${this.tableName} t
                inner join albums a on t.albumid = a.id
                inner join mediatypes m on t.mediatype = m.id
                inner join generos g on t.genero = g.id
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

    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                `SELECT t.*, a.title as albumTitle,
                m.title as mediatype, m.id as mediatypeId,
                g.title as genero, g.id as generoId
                FROM ${this.tableName} t
                inner join albums a on t.albumid = a.id
                inner join mediatypes m on t.mediatype = m.id
                inner join generos g on t.genero = g.id
                WHERE t.id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row);
                },
            );
        });
    }

    /**
     * CREATE TABLE `tracks` (`id` integer not null primary key autoincrement,
     * `nombre` varchar(255),
     * `albumId` varchar(255),
     * `compositores` varchar(255),
     * `mediatype` varchar(255),
     * `genero` varchar(255),
     * `precio` varchar(255),
     * foreign key(`albumId`) references `albums`(`id`),
     * foreign key(`mediatype`) references `mediatypes`(`id`),
     * foreign key(`genero`) references `generos`(`id`));
     * {"albumId":"1753743030174","nombre":"Eiusmod ipsum elementum tellus nisi.","compositores":"Jane Smith",
     * "mediatypeId":"1753742915094","generoId":"1753742940863","precio":"5"}
     */
    async create(entity) {
        const data = {};
        data.nombre = entity.nombre;
        data.albumid = entity.albumId;
        data.compositores = entity.compositores;
        data.mediatype = entity.mediatypeId;
        data.genero = entity.generoId;
        const result = await super.create(data);
        return await this.getById(result.id);
    }

    async update(id, entity) {
        const data = {};
        data.nombre = entity.nombre;
        data.compositores = entity.compositores;
        data.mediatype = entity.mediatypeId;
        data.genero = entity.generoId;
        data.precio = entity.precio;

        const result = await super.update(id, data);
        return await this.getById(result.id);
    }
}

module.exports = TrackRepository;
