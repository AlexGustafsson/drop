package main

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/version"
	"github.com/urfave/cli/v2"
)

func VersionAction(context *cli.Context) error {
	fmt.Println(version.FullVersion())

	return nil
}
