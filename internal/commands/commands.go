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
		Usage:  "Create a token",
		Action: tokenCommand,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "config",
				Aliases: []string{"c"},
				Usage:   "Path to config file",
				Value:   "config.yml",
			},
			&cli.StringFlag{
				Name:  "name",
				Usage: "Name of the collection",
				Value: "",
			},
			&cli.UintFlag{
				Name:  "lifetime",
				Usage: "Lifetime of the token in seconds",
				Value: 3600,
			},
			&cli.UintFlag{
				Name:  "maximumFileCount",
				Usage: "Maximum number of files allowed",
				Value: 0,
			},
			&cli.UintFlag{
				Name:  "maximumFileSize",
				Usage: "Maximum number of files allowed in bytes",
				Value: 5242880,
			},
			&cli.UintFlag{
				Name:  "maximumSize",
				Usage: "Total maximum size in bytes",
				Value: 5242880,
			},
			&cli.BoolFlag{
				Name:  "share",
				Usage: "Whether or not to output a shareable link",
				Value: false,
			},
			&cli.BoolFlag{
				Name:  "includeSecret",
				Usage: "Whether or not to include the secret in the share link",
				Value: false,
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
