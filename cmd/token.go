package main

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/configuration"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/AlexGustafsson/drop/internal/state/sqlite"
	log "github.com/sirupsen/logrus"

	"github.com/urfave/cli/v2"
)

func TokenAction(context *cli.Context) error {
	configPath := context.String("config")
	lifetime := context.Duration("lifetime")

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

	secret, err := config.ConfiguredSecret()
	if err != nil {
		return err
	}

	var stateStore state.Store
	if config.Store.Adapter == "sqlite" {
		sqliteStore := sqlite.New(secret)
		err = sqliteStore.Connect(config.Store.ConnectionString)
		if err != nil {
			return err
		}
		defer sqliteStore.Disconnect()
		stateStore = sqliteStore
	}

	_, token, err := stateStore.CreateAdminToken(lifetime)
	if err != nil {
		return err
	}

	fmt.Println(token)

	return nil
}
