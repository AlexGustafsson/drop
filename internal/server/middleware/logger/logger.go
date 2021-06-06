package logger

import (
	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

func New() func(ctx *fiber.Ctx) error {
	return func(ctx *fiber.Ctx) error {
		// Wait for other handlers to finish
		err := ctx.Next()
		if err != nil {
			return err
		}

		fields := log.Fields{
			"method": ctx.Method(),
			"path":   ctx.Path(),
			"status": ctx.Response().StatusCode(),
		}

		if claimsLocal := ctx.Locals("claims"); claimsLocal != nil {
			claims := claimsLocal.(*authentication.TokenClaims)
			fields["token"] = claims.Id
		}

		log.WithFields(fields).Info("Handling request")

		return nil
	}
}
