package authentication

import (
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

type ArchiveTokenClaims struct {
	ArchiveId        string `json:"ari"`
	ArchiveName      string `json:"arn"`
	MaximumFileCount int    `json:"mfc"`
	MaximumFileSize  int    `json:"mfs"`
	MaximumSize      int    `json:"ms"`
	jwt.StandardClaims
}

func CreateArchiveToken(secret []byte, archiveId string, name string, lifetime int, maximumFileCount int, maximumFileSize int, maximumSize int) (string, string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return "", "", fmt.Errorf("Failed to generate token id: %s", err.Error())
	}

	claims := ArchiveTokenClaims{
		archiveId,
		name,
		maximumFileCount,
		maximumFileSize,
		maximumSize,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Unix() + int64(lifetime),
			Id:        id.String(),
			Issuer:    "drop",
			Subject:   "archive",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secret)
	if err != nil {
		return "", "", fmt.Errorf("Failed to sign token: %s", err.Error())
	}

	return signedToken, id.String(), nil
}

func ValidateArchiveToken(secret []byte, bearerToken string) (*ArchiveTokenClaims, error) {
	claims := &ArchiveTokenClaims{}
	token, err := jwt.ParseWithClaims(bearerToken, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to parse and validate token: %s", err.Error())
	}

	if token.Method.Alg() != "HS256" {
		return nil, fmt.Errorf("Signing method must be HS256, was '%s'", token.Method.Alg())
	}

	if claims.Subject != "archive" {
		return nil, fmt.Errorf("Token subject must be 'archive', was '%s'", claims.Subject)
	}

	return claims, nil
}
