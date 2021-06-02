package commands

import (
	"crypto/rand"

	"github.com/AlexGustafsson/drop/internal/server"
	"github.com/urfave/cli/v2"
)

func serveCommand(context *cli.Context) error {
	address := context.String("address")
	port := uint16(context.Uint("port"))

	secret := make([]byte, 32)
	rand.Read(secret)
	server := server.NewServer(secret)
	err := server.Start(address, port)
	if err != nil {
		return err
	}

	return nil
}
