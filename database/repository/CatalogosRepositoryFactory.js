// SQLite Repositories
const SqliteGenreRepository = require("./sqliteRepository/GenreRepository");
const SqliteArtistRepository = require("./sqliteRepository/ArtistRepository");
const SqliteAlbumRepository = require("./sqliteRepository/AlbumRepository");
const SqliteMediaTypeRepository = require("./sqliteRepository/MediaTypeRepository");
const SqliteTrackRepository = require("./sqliteRepository/TrackRepository");

// PostgreSQL Repositories
// PostgreSQL Repositories
const PostgresGenreRepository = require("./postgresRepository/GenreRepository");
const PostgresArtistRepository = require("./postgresRepository/ArtistRepository");
const PostgresAlbumRepository = require("./postgresRepository/AlbumRepository");
const PostgresMediaTypeRepository = require("./postgresRepository/MediaTypeRepository");
const PostgresTrackRepository = require("./postgresRepository/TrackRepository");

class CatalogosRepositoryFactory {
    static createGenreRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating GenreRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresGenreRepository();
            case 'sqlite3':
            default:
                return new SqliteGenreRepository();
        }
    }

    static createArtistRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating ArtistRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresArtistRepository();
            case 'sqlite3':
            default:
                return new SqliteArtistRepository();
        }
    }

    static createAlbumRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating AlbumRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresAlbumRepository();
            case 'sqlite3':
            default:
                return new SqliteAlbumRepository();
        }
    }

    static createMediaTypeRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating MediaTypeRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresMediaTypeRepository();
            case 'sqlite3':
            default:
                return new SqliteMediaTypeRepository();
        }
    }

    static createTrackRepository() {
        const dbType = process.env.DB_TYPE || 'sqlite3';
        const environment = process.env.NODE_ENV || 'development';

        console.log(`Creating TrackRepository for ${dbType} in ${environment} environment`);

        switch (dbType) {
            case 'postgresql':
                return new PostgresTrackRepository();
            case 'sqlite3':
            default:
                return new SqliteTrackRepository();
        }
    }
}

module.exports = CatalogosRepositoryFactory;
