package auth

import (
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

type AdminTokenClaims struct {
	jwt.StandardClaims
}

func CreateAdminToken(secret []byte, lifetime int) (string, string, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return "", "", fmt.Errorf("Failed to generate token id: %s", err.Error())
	}

	claims := AdminTokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Unix() + int64(lifetime),
			Id:        id.String(),
			Issuer:    "drop",
			Subject:   "admin",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secret)
	if err != nil {
		return "", "", fmt.Errorf("Failed to sign token: %s", err.Error())
	}

	return signedToken, id.String(), nil
}

func ValidateAdminToken(secret []byte, bearerToken string) (*AdminTokenClaims, error) {
	claims := &AdminTokenClaims{}
	token, err := jwt.ParseWithClaims(bearerToken, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("Failed to parse and validate token: %s", err.Error())
	}

	if token.Method.Alg() != "HS256" {
		return nil, fmt.Errorf("Signing method must be HS256, was '%s'", token.Method.Alg())
	}

	if claims.Subject != "admin" {
		return nil, fmt.Errorf("Token subject must be 'admin', was '%s'", claims.Subject)
	}

	return claims, nil
}
