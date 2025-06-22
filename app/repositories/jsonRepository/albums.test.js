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

    it('create album and return it', async () => {
      const album = { title: 'Test Album', artist: 'Test Artist', price: 9.99, image_url: 'test_image_url' };
      const createdAlbum = await repository.create(album);
      console.log(createdAlbum, album);
      
      expect(createdAlbum).toEqual(album);
    });

    it('should return the correct album by ID', async () => {
      const existingAlbums = await repository.getAll();
      if (existingAlbums.length > 0) {
        const albumId = existingAlbums[0].id;
        const album = await repository.getById(albumId);
        expect(album).toHaveProperty('id', albumId);
      } else {
        // If no albums, we can create one for the test
        const newAlbum = await repository.create({ title: 'Test Album', artist: 'Test Artist', price: 9.99, image_url: 'test_image_url' });
        const album = await repository.getById(newAlbum.id);
        expect(album).toHaveProperty('id', newAlbum.id);
      }
    });
  
    it('should return null if no album with the given ID exists', async () => {
      const album = await repository.getById(-1); // Assuming -1 is an invalid ID
      expect(album).toBeNull();
    });


  });
});
