const BaseRepository = require("./BaseRepository");

class TrackRepository extends BaseRepository {
    constructor() {
        super("tracks");
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
            this.db.get(`SELECT t.*, a.title as albumTitle,
                m.title as mediatype, m.id as mediatypeId,
                g.title as genero, g.id as generoId
                FROM ${this.tableName} t
                inner join albums a on t.albumid = a.id
                inner join mediatypes m on t.mediatype = m.id
                inner join generos g on t.genero = g.id
                WHERE t.id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    async create(entity) {
        const result = await super.create(entity);
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
