package commands

import (
	"github.com/urfave/cli/v2"
)

// Commands contains all commands of the application
var Commands = []*cli.Command{
	{
		Name:   "version",
		Usage:  "Show the application's version",
		Action: versionCommand,
	},
	{
		Name:   "serve",
		Usage:  "Serve the application",
		Action: serveCommand,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "config",
				Aliases: []string{"c"},
				Usage:   "Path to config file",
				Value:   "config.yml",
			},
		},
	},
	{
		Name:   "token",
		Usage:  "Create an admin token",
		Action: tokenCommand,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "config",
				Aliases: []string{"c"},
				Usage:   "Path to config file",
				Value:   "config.yml",
			},
			&cli.UintFlag{
				Name:  "lifetime",
				Usage: "Lifetime of the token in seconds",
				Value: 3600,
			},
		},
	},
	{
		Name:   "decrypt",
		Usage:  "Decrypt a file",
		Action: decryptCommand,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "config",
				Aliases: []string{"c"},
				Usage:   "Path to config file",
				Value:   "config.yml",
			},
			&cli.StringFlag{
				Name:     "secret",
				Usage:    "Secret used to encrypt the file",
				Required: true,
			},
			&cli.StringFlag{
				Name:     "archive",
				Usage:    "Archive id",
				Required: true,
			},
			&cli.StringFlag{
				Name:     "file",
				Usage:    "File id",
				Required: true,
			},
			&cli.StringFlag{
				Name:    "output",
				Aliases: []string{"o"},
				Usage:   "Path to output file. The file is written to stdout if not specified",
			},
		},
	},
}
