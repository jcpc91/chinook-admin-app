// Test suite for albums.js
const JsonFileAlbumRepository = require('./albums');

describe('JsonFileAlbumRepository tests', () => {
  let repository;

  beforeEach(() => {
    repository = new JsonFileAlbumRepository();
  });

  describe('getAll', () => {
    it('should return an array of albums', async () => {
      const albums = await repository.getAll();
      expect(Array.isArray(albums)).toBe(true);
    });

    it('should return albums with the correct properties if albums exist', async () => {
      // For this test to be robust, we might need to ensure some data exists
      // or mock the _readData method. For now, we'll check properties if albums are returned.
      const albums = await repository.getAll();
      if (albums.length > 0) {
        const album = albums[0];
        expect(album).toHaveProperty('id');
        expect(album).toHaveProperty('title');
        expect(album).toHaveProperty('artist');
        expect(album).toHaveProperty('price');
        expect(album).toHaveProperty('image_url');
      } else {
        // If no albums, this test can be considered passing as there's nothing to check.
        // Alternatively, we could seed data for the test.
        expect(albums).toEqual([]);
      }
    });
  });
});
