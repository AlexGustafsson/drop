package server

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/data"
	"github.com/AlexGustafsson/drop/internal/server/wrappers"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	log "github.com/sirupsen/logrus"
)

type Server struct {
	stateStore state.Store
	dataStore  data.Store
	frontend   string
	ChunkSize  int
}

func NewServer(stateStore state.Store, dataStore data.Store, frontend string) *Server {
	return &Server{
		stateStore: stateStore,
		dataStore:  dataStore,
		frontend:   frontend,
		ChunkSize:  1024 * 1024, // 1MiB
	}
}

func (server *Server) Start(address string, port uint16) error {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})
	app.Server().StreamRequestBody = true
	app.Use(cors.New())

	handle := wrappers.NewHandle(server.stateStore)

	app.Get("/api/v1/archives", handle(server.handleArchiveList))
	app.Post("/api/v1/archives", handle(server.handleArchiveCreate))
	app.Get("/api/v1/archives/:archiveId", handle(server.handleArchiveGet))
	app.Delete("/api/v1/archives/:archiveId", handle(server.handleArchiveDelete))

	app.Get("/api/v1/archives/:archiveId/tokens", handle(server.handleTokenList))
	app.Post("/api/v1/archives/:archiveId/tokens", handle(server.handleTokenCreate))
	app.Get("/api/v1/archives/:archiveId/tokens/:tokenId", handle(server.handleTokenGet))
	app.Delete("/api/v1/archives/:archiveId/tokens/:tokenId", handle(server.handleTokenDelete))

	app.Get("/api/v1/archives/:archiveId/files", handle(server.handleFileList))
	app.Post("/api/v1/archives/:archiveId/files", handle(server.handleFileCreate))
	app.Get("/api/v1/archives/:archiveId/files/:fileId", handle(server.handleFileGet))
	app.Get("/api/v1/archives/:archiveId/files/:fileId/content", handle(server.handleFileDownload))
	app.Post("/api/v1/archives/:archiveId/files/:fileId/content", handle(server.handleFileUpload))

	app.Static("/", server.frontend)
	app.Get("/api/*", func(ctx *fiber.Ctx) error {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	})
	app.Get("*", func(ctx *fiber.Ctx) error {
		return ctx.SendFile(fmt.Sprintf("%s/index.html", server.frontend))
	})

	log.Infof("Starting server on %s:%d", address, port)
	return app.Listen(fmt.Sprintf("%s:%d", address, port))
}
