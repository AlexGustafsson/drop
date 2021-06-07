package server

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/server/middleware/authenticator"
	"github.com/AlexGustafsson/drop/internal/server/middleware/logger"
	"github.com/AlexGustafsson/drop/internal/store"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

type Server struct {
	store     store.Store
	ChunkSize int
}

func NewServer(store store.Store) *Server {
	return &Server{
		store:     store,
		ChunkSize: 1024 * 1024, // 1MiB
	}
}

func (server *Server) Start(address string, port uint16) error {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})
	app.Server().StreamRequestBody = true
	app.Use(authenticator.New(server.store.Secret()))
	app.Use(logger.New())

	app.Post("/api/v1/archive", server.handleArchiveCreation)
	app.Post("/api/v1/archive/:archiveId/token", server.handleArchiveTokenCreation)
	app.Post("/api/v1/archive/:archiveId/file", server.handleFileCreation)
	app.Post("/api/v1/archive/:archiveId/file/:fileId", server.handleFileUpload)

	log.Infof("Starting server on %s:%d", address, port)
	return app.Listen(fmt.Sprintf("%s:%d", address, port))
}
