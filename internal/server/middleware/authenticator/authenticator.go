package authenticator

import (
	"strings"

	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/gofiber/fiber/v2"
)

func New(secret []byte) func(ctx *fiber.Ctx) error {
	return func(ctx *fiber.Ctx) error {
		bearerToken := ctx.Get("Authorization")
		bearerToken = strings.TrimPrefix(bearerToken, "Bearer ")

		if bearerToken != "" {
			claims, err := authentication.ValidateToken(secret, bearerToken)
			if err == nil {
				ctx.Locals("claims", claims)
			}
		}

		return ctx.Next()
	}
}
