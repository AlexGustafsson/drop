package main

import (
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/AlexGustafsson/drop/internal/version"
	log "github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

var appHelpTemplate = `Usage: {{.Name}} [global options] command [command options] [arguments]

{{.Usage}}

Version: {{.Version}}

Options:
  {{range .Flags}}{{.}}
  {{end}}
Commands:
  {{range .Commands}}{{.Name}}{{ "\t" }}{{.Usage}}
  {{end}}
Run '{{.Name}} help command' for more information on a command.
`

var commandHelpTemplate = `Usage: drop {{.Name}} [options] {{if .ArgsUsage}}{{.ArgsUsage}}{{end}}

{{.Usage}}{{if .Description}}

Description:
   {{.Description}}{{end}}{{if .Flags}}

Options:{{range .Flags}}
   {{.}}{{end}}{{end}}
`

func setDebugOutputLevel() {
	for _, flag := range os.Args {
		if flag == "-v" || flag == "--verbose" {
			log.SetLevel(log.DebugLevel)
		}
	}
}

func commandNotFound(context *cli.Context, command string) {
	log.Errorf(
		"%s: '%s' is not a %s command. See '%s help'.",
		context.App.Name,
		command,
		context.App.Name,
		os.Args[0],
	)
	os.Exit(1)
}

func main() {
	setDebugOutputLevel()

	cli.AppHelpTemplate = appHelpTemplate
	cli.CommandHelpTemplate = commandHelpTemplate

	app := cli.NewApp()
	app.Name = filepath.Base(os.Args[0])
	app.Usage = "A service for securely transferring files"
	app.Version = version.FullVersion()
	app.CommandNotFound = commandNotFound
	app.EnableBashCompletion = true
	app.Commands = []*cli.Command{
		{
			Name:   "version",
			Usage:  "Show the application's version",
			Action: VersionAction,
		},
		{
			Name:   "serve",
			Usage:  "Serve the application",
			Action: ServeAction,
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
			Action: TokenAction,
			Flags: []cli.Flag{
				&cli.StringFlag{
					Name:    "config",
					Aliases: []string{"c"},
					Usage:   "Path to config file",
					Value:   "config.yml",
				},
				&cli.DurationFlag{
					Name:  "lifetime",
					Usage: "Lifetime of the token",
					Value: 1 * time.Hour,
				},
			},
		},
		{
			Name:   "decrypt",
			Usage:  "Decrypt a file",
			Action: DecryptAction,
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
	app.HideVersion = true
	app.Flags = []cli.Flag{
		&cli.BoolFlag{
			Name:  "verbose, v",
			Usage: "Enable verbose logging",
		},
	}

	sort.Sort(cli.FlagsByName(app.Flags))
	sort.Sort(cli.CommandsByName(app.Commands))

	err := app.Run(os.Args)
	if err != nil {
		log.Fatal(err)
	}
}
