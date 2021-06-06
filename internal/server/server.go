package server

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/server/middleware/authenticator"
	"github.com/AlexGustafsson/drop/internal/server/middleware/logger"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

type Server struct {
	secret []byte
}

func NewServer(secret []byte) *Server {
	return &Server{
		secret: secret,
	}
}

func (server *Server) Start(address string, port uint16) error {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})
	app.Use(authenticator.New(server.secret))
	app.Use(logger.New())

	app.Post("/api/v1/archive", server.handleArchiveCreation)
	app.Post("/api/v1/archive/:archiveId/file", server.handleFileCreation)
	app.Post("/api/v1/archive/:archiveId/file/:fileId", server.handleFileUpload)

	log.Infof("Starting server on %s:%d", address, port)
	return app.Listen(fmt.Sprintf("%s:%d", address, port))
}
