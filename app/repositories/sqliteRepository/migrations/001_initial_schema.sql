-- Migration from JSON schema to SQL
--This is a comment
--This is a comment
CREATE TABLE albums (
    AlbumId INTEGER PRIMARY KEY,
    Title NVARCHAR(160) NOT NULL,
    ArtistId INTEGER NOT NULL,
    FOREIGN KEY (ArtistId) REFERENCES artists(ArtistId)
);
--This is a comment
CREATE TABLE artists (
    ArtistId INTEGER PRIMARY KEY,
    Name NVARCHAR(120)
);
--This is a comment
CREATE TABLE employees (
    EmployeeId INTEGER PRIMARY KEY,
    LastName NVARCHAR(20) NOT NULL,
    FirstName NVARCHAR(20) NOT NULL,
    Title NVARCHAR(30),
    ReportsTo INTEGER,
    BirthDate DATETIME,
    HireDate DATETIME,
    Address NVARCHAR(70),
    City NVARCHAR(40),
    State NVARCHAR(40),
    Country NVARCHAR(40),
    PostalCode NVARCHAR(10),
    Phone NVARCHAR(24),
    Fax NVARCHAR(24),
    Email NVARCHAR(60),
    FOREIGN KEY (ReportsTo) REFERENCES employees(EmployeeId)
);
--This is a comment
CREATE TABLE genres (
    GenreId INTEGER PRIMARY KEY,
    Name NVARCHAR(120)
);
--This is a comment
CREATE TABLE media_types (
    MediaTypeId INTEGER PRIMARY KEY,
    Name NVARCHAR(120)
);
--This is a comment
CREATE TABLE tracks (
    TrackId INTEGER PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    AlbumId INTEGER,
    MediaTypeId INTEGER NOT NULL,
    GenreId INTEGER,
    Composer NVARCHAR(220),
    Milliseconds INTEGER NOT NULL,
    Bytes INTEGER,
    UnitPrice NUMERIC(10, 2) NOT NULL,
    FOREIGN KEY (AlbumId) REFERENCES albums(AlbumId),
    FOREIGN KEY (GenreId) REFERENCES genres(GenreId),
    FOREIGN KEY (MediaTypeId) REFERENCES media_types(MediaTypeId)
);
--This is a comment
CREATE TABLE "customers" (
    "CustomerId" INTEGER,
    "FirstName" TEXT,
    "LastName" TEXT,
    "Company" TEXT,
    "Address" TEXT,
    "City" TEXT,
    "State" TEXT,
    "Country" TEXT,
    "PostalCode" TEXT,
    "Phone" TEXT,
    "Fax" TEXT,
    "Email" TEXT,
    "SupportRepId" INTEGER,
    PRIMARY KEY ("CustomerId")
);
--This is a comment
CREATE TABLE "invoices" (
    "InvoiceId" INTEGER,
    "CustomerId" INTEGER,
    "InvoiceDate" TEXT,
    "BillingAddress" TEXT,
    "BillingCity" TEXT,
    "BillingState" TEXT,
    "BillingCountry" TEXT,
    "BillingPostalCode" TEXT,
    "Total" REAL,
    PRIMARY KEY ("InvoiceId")
);
--This is a comment
CREATE TABLE "invoice_items" (
    "InvoiceLineId" INTEGER,
    "InvoiceId" INTEGER,
    "TrackId" INTEGER,
    "UnitPrice" REAL,
    "Quantity" INTEGER,
    PRIMARY KEY ("InvoiceLineId")
);
--This is a comment
CREATE TABLE "playlists" (
    "PlaylistId" INTEGER,
    "Name" TEXT,
    PRIMARY KEY ("PlaylistId")
);
--This is a comment
CREATE TABLE "playlist_track" (
    "PlaylistId" INTEGER,
    "TrackId" INTEGER,
    PRIMARY KEY ("PlaylistId", "TrackId")
);
