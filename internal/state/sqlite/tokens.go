package sqlite

type SqliteArchiveToken struct {
	id      string
	created int64
	expires int64
}

func (token *SqliteArchiveToken) Id() string {
	return token.id
}

func (token *SqliteArchiveToken) IssuedAt() int64 {
	return token.created
}

func (token *SqliteArchiveToken) ExpiresAt() int64 {
	return token.expires
}

type SqliteAdminToken struct {
	id      string
	created int64
	expires int64
}

func (token *SqliteAdminToken) Id() string {
	return token.id
}

func (token *SqliteAdminToken) IssuedAt() int64 {
	return token.created
}

func (token *SqliteAdminToken) ExpiresAt() int64 {
	return token.expires
}
