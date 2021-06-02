package authentication

import (
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

type TokenClaims struct {
	MaximumFileCount int `json:"mfc"`
	MaximumFileSize  int `json:"mfs"`
	MaximumSize      int `json:"ms"`
	jwt.StandardClaims
}

func CreateToken(secret []byte, name string, lifetime int, maximumFileCount int, maximumFileSize int, maximumSize int) (string, string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		log.Error("Failed to generate token id", err.Error())
		return "", "", fmt.Errorf(TokenCreationFailedError)
	}

	claims := TokenClaims{
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
		log.Error("Failed to sign token", err.Error())
		return "", "", fmt.Errorf(TokenCreationFailedError)
	}

	return signedToken, id.String(), nil
}
