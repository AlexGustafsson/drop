package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

type AdminTokenClaims struct {
	jwt.RegisteredClaims
}

func CreateAdminToken(secret []byte, lifetime time.Duration) (string, *AdminTokenClaims, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate token id: %s", err.Error())
	}

	now := time.Now()
	claims := AdminTokenClaims{
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(lifetime * time.Second)),
			IssuedAt:  jwt.NewNumericDate(now),
			ID:        id.String(),
			Issuer:    "drop",
			Subject:   "admin",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secret)
	if err != nil {
		return "", nil, fmt.Errorf("failed to sign token: %s", err.Error())
	}

	return signedToken, &claims, nil
}

func ValidateAdminToken(secret []byte, bearerToken string) (*AdminTokenClaims, error) {
	claims := &AdminTokenClaims{}
	token, err := jwt.ParseWithClaims(bearerToken, claims, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to parse and validate token: %s", err.Error())
	}

	if token.Method.Alg() != "HS256" {
		return nil, fmt.Errorf("signing method must be HS256, was '%s'", token.Method.Alg())
	}

	if claims.Subject != "admin" {
		return nil, fmt.Errorf("token subject must be 'admin', was '%s'", claims.Subject)
	}

	return claims, nil
}
