package auth

import "github.com/dgrijalva/jwt-go"

type TokenType int

const (
	AdminTokenType TokenType = iota
	ArchiveTokenType
	UnknownTokenType
	InvalidTokenType
)

func ExtractTokenType(token string) (TokenType, error) {
	parser := jwt.Parser{
		SkipClaimsValidation: false,
	}
	var claims jwt.StandardClaims
	_, _, err := parser.ParseUnverified(token, &claims)
	if err != nil {
		return InvalidTokenType, err
	}

	switch claims.Subject {
	case "admin":
		return AdminTokenType, nil
	case "archive":
		return ArchiveTokenType, nil
	default:
		return UnknownTokenType, nil
	}
}
