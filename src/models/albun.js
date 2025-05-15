class Albun {
  constructor(id, title, artistId) {
    this.id = id;
    this.title = title;
    this.artistId = artistId;
  }

  // Method to display album details
  getDetails() {
    return `Album ID: ${this.id}, Title: ${this.title}, Artist ID: ${this.artistId}`;
  }
}

export default Albun;
