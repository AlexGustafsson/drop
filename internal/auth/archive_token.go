package auth

import (
	"fmt"
	"time"

	jwt "github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

type ArchiveTokenClaims struct {
	ArchiveId        string `json:"ari"`
	ArchiveName      string `json:"arn"`
	MaximumFileCount int    `json:"mfc"`
	MaximumFileSize  int    `json:"mfs"`
	MaximumSize      int    `json:"ms"`
	jwt.RegisteredClaims
}

func CreateArchiveToken(secret []byte, archiveId string, name string, lifetime time.Duration, maximumFileCount int, maximumFileSize int, maximumSize int) (string, *ArchiveTokenClaims, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate token id: %s", err.Error())
	}

	now := time.Now()
	claims := ArchiveTokenClaims{
		archiveId,
		name,
		maximumFileCount,
		maximumFileSize,
		maximumSize,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(lifetime)),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        id.String(),
			Issuer:    "drop",
			Subject:   "archive",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secret)
	if err != nil {
		return "", nil, fmt.Errorf("failed to sign token: %s", err.Error())
	}

	return signedToken, &claims, nil
}

func ValidateArchiveToken(secret []byte, bearerToken string) (*ArchiveTokenClaims, error) {
	claims := &ArchiveTokenClaims{}
	token, err := jwt.ParseWithClaims(bearerToken, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to parse and validate token: %s", err.Error())
	}

	if token.Method.Alg() != "HS256" {
		return nil, fmt.Errorf("signing method must be HS256, was '%s'", token.Method.Alg())
	}

	if claims.Subject != "archive" {
		return nil, fmt.Errorf("token subject must be 'archive', was '%s'", claims.Subject)
	}

	return claims, nil
}
