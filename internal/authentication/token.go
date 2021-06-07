package authentication

import (
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

type TokenClaims struct {
	ArchiveId        string `json:"arc"`
	MaximumFileCount int    `json:"mfc"`
	MaximumFileSize  int    `json:"mfs"`
	MaximumSize      int    `json:"ms"`
	jwt.StandardClaims
}

func CreateToken(secret []byte, archiveId string, name string, lifetime int, maximumFileCount int, maximumFileSize int, maximumSize int) (string, string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		log.Error("Failed to generate token id", err.Error())
		return "", "", fmt.Errorf(TokenCreationFailedError)
	}

	claims := TokenClaims{
		archiveId,
		maximumFileCount,
		maximumFileSize,
		maximumSize,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Unix() + int64(lifetime),
			Id:        id.String(),
			Issuer:    "drop",
			Subject:   name,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secret)
	if err != nil {
		log.Error("Failed to sign token: ", err.Error())
		return "", "", fmt.Errorf(TokenCreationFailedError)
	}

	return signedToken, id.String(), nil
}

func ValidateToken(secret []byte, bearerToken string) (*TokenClaims, error) {
	claims := &TokenClaims{}
	token, err := jwt.ParseWithClaims(bearerToken, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		log.Error("Failed to parse and validate token: ", err)
		return nil, fmt.Errorf(TokenValidationError)
	}

	if token.Method.Alg() != "HS256" {
		log.Errorf("Signing method must be HS256, was %s", token.Method.Alg())
		return nil, fmt.Errorf(TokenValidationError)
	}

	return claims, nil
}
