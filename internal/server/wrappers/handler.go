package wrappers

import (
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

func NewHandle(stateStore state.Store) func(handler func(ctx *Context)) func(ctx *fiber.Ctx) error {
	return func(handler func(ctx *Context)) func(ctx *fiber.Ctx) error {
		return func(ctx *fiber.Ctx) error {
			context := NewContext(ctx, stateStore)

			err := context.Parse()
			if err != nil {
				log.Error("Failed to parse context: ", err.Error())
				return nil
			}

			logBefore(context)
			handler(context)
			logAfter(context)
			return nil
		}
	}
}
