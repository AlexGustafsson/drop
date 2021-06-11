package wrappers

import (
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

func NewHandle(stateStore state.Store) func(handler func(ctx *Context) error) func(ctx *fiber.Ctx) error {
	return func(handler func(ctx *Context) error) func(ctx *fiber.Ctx) error {
		return func(ctx *fiber.Ctx) error {
			context := NewContext(ctx, stateStore)

			err := context.Parse()
			if err != nil {
				log.Error("Failed to parse context: ", err.Error())
				return nil
			}

			logBefore(context)
			err = handler(context)
			if err != nil {
				log.Error("Handler failed: ", err.Error())
			}
			logAfter(context)
			return nil
		}
	}
}
