package commands

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/configuration"
	"github.com/AlexGustafsson/drop/internal/server"
	log "github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

func serveCommand(context *cli.Context) error {
	configPath := context.String("config")

	config, err := configuration.Load(configPath)
	if err != nil {
		return err
	}

	errors := configuration.Validate(config)
	if len(errors) != 0 {
		for _, err := range errors {
			log.Error(err)
		}
		return fmt.Errorf("Failed to validate the configuration")
	}

	if config.LogAsJSON {
		log.SetFormatter(&log.JSONFormatter{})
	}

	secret, err := config.ConfiguredSecret()
	if err != nil {
		return err
	}

	server := server.NewServer(secret)
	err = server.Start(config.Address, config.Port)
	if err != nil {
		return err
	}

	return nil
}
