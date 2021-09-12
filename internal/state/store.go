package state

// File is a
type File interface {
	Id() string
	ArchiveId() string
	Name() string
	LastModified() int64
	Size() int
	Mime() string
	Created() int64
}

// AdminToken is an admin token
type AdminToken interface {
	Id() string
	IssuedAt() int64
	ExpiresAt() int64
}

// ArchiveToken is a token for an archive
type ArchiveToken interface {
	Id() string
	IssuedAt() int64
	ExpiresAt() int64
}

// Archive is an archive of files
type Archive interface {
	Id() string
	Name() string
	Created() int64
	MaximumFileCount() int
	MaximumFileSize() int
	MaximumSize() int
	File(id string) (File, bool, error)
	Files() ([]File, error)
	Token(id string) (ArchiveToken, bool, error)
	DeleteToken(id string) (bool, error)
	Tokens() ([]ArchiveToken, error)
	// CreateToken creates a token for an archive
	CreateToken(lifetime int) (ArchiveToken, string, error)
	// CreateFile creates a file in an archive
	CreateFile(name string, lastModified int64, size int, mime string) (File, error)
	DeleteFile(id string) (bool, error)
}

// Store represents a central state store
type Store interface {
	// Secret returns the secret in use by the store
	Secret() []byte
	// CreateArchive creates an archive
	CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (Archive, error)
	// Archive returns an archive by id
	Archive(id string) (Archive, bool, error)
	Archives() ([]Archive, error)
	DeleteArchive(id string) (bool, error)
	// CreateAdminToken creates an admin token
	CreateAdminToken(lifetime int) (AdminToken, string, error)
	AdminToken(id string) (AdminToken, bool, error)
	AdminTokens() ([]AdminToken, error)
	DeleteAdminToken(id string) (bool, error)
	Files() ([]File, error)
}
