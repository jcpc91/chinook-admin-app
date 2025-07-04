class TraksService {
  /**
   * @param {import('../IBaseRepository')} baseRepoository
   */
  constructor(baseRepoository) {
    this.baseRepoository = baseRepoository;
  }

  getTraks() {
    return this.baseRepoository.getAll();
  }
  getTrakById(id) {
    return this.baseRepoository.getById(id);
  }

  getTrakByIdAlbum(id) {
    return this.baseRepoository.getByIdAlbum(id);
  }
  createTrak(trakData) {
    return this.baseRepoository.create(trakData);
  }
}
module.exports = TraksService;