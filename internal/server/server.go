package server

import (
	"fmt"
	"net/http"

	"github.com/AlexGustafsson/drop/internal/data"
	"github.com/AlexGustafsson/drop/internal/server/wrappers"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/AlexGustafsson/drop/internal/web"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	log "github.com/sirupsen/logrus"
)

type Server struct {
	stateStore state.Store
	dataStore  data.Store
	ChunkSize  int
}

func NewServer(stateStore state.Store, dataStore data.Store) *Server {
	return &Server{
		stateStore: stateStore,
		dataStore:  dataStore,
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

	app.Get("/api/v1/files", handle(server.handleAllFileList))
	app.Get("/api/v1/archives/:archiveId/files", handle(server.handleFileList))
	app.Post("/api/v1/archives/:archiveId/files", handle(server.handleFileCreate))
	app.Get("/api/v1/archives/:archiveId/files/:fileId", handle(server.handleFileGet))
	app.Get("/api/v1/archives/:archiveId/files/:fileId/content", handle(server.handleFileDownload))
	app.Post("/api/v1/archives/:archiveId/files/:fileId/content", handle(server.handleFileUpload))

	app.Get("/api/*", func(ctx *fiber.Ctx) error {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	})

	// TODO: Doesn't quite seem to work with SPA? For example, /upload or /archive doesn't serve index.html
	app.Use("/", filesystem.New(filesystem.Config{
		Root:         http.FS(web.Static),
		PathPrefix:   "static",
		Index:        "index.html",
		NotFoundFile: "index.html",
	}))

	log.Infof("Starting server on %s:%d", address, port)
	return app.Listen(fmt.Sprintf("%s:%d", address, port))
}
