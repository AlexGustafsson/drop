package sqlite

type SqliteFile struct {
	id           string
	name         string
	lastModified int64
	size         int
	mime         string
	created      int64
}

func (file *SqliteFile) Id() string {
	return file.id
}

func (file *SqliteFile) Name() string {
	return file.name
}

func (file *SqliteFile) LastModified() int64 {
	return file.lastModified
}

func (file *SqliteFile) Size() int {
	return file.size
}

func (file *SqliteFile) Mime() string {
	return file.mime
}

func (file *SqliteFile) Created() int64 {
	return file.created
}
