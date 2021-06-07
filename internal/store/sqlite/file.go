package sqlite

type SqliteFile struct {
	id           string
	name         string
	lastModified int
	size         int
	mime         string
}

func (file *SqliteFile) Id() string {
	return file.id
}

func (file *SqliteFile) Name() string {
	return file.name
}

func (file *SqliteFile) LastModified() int {
	return file.lastModified
}

func (file *SqliteFile) Size() int {
	return file.size
}

func (file *SqliteFile) Mime() string {
	return file.mime
}