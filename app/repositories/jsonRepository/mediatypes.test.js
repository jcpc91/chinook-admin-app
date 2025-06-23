const JsonFileMediaTypeRepository = require('./mediatypes');

describe('JsonFileMediaTypeRepository', () => {
    let repository;

    beforeEach(() => {
        repository = new JsonFileMediaTypeRepository();
    });

    it('should return an array of mediatypes', async () => {
        const mediatypes = await repository.getAll();
        expect(Array.isArray(mediatypes)).toBe(true);
    });

    it('add media type', async () => {
        const newMediaType = {
            "title": "Protected AAC audio file"
        };
        const addedMediaType = await repository.create(newMediaType);
        expect(addedMediaType).toEqual(newMediaType);
    });

    it("update media type id 2", async () => {
        const newMediaType = {
            "title": "Protected AAC audio file"
        };
        const updatedMediaType = await repository.update(2, newMediaType);
        expect(updatedMediaType).toEqual(newMediaType);
    });
});