package commands

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/AlexGustafsson/drop/internal/authentication"

	"github.com/urfave/cli/v2"
)

func tokenCommand(context *cli.Context) error {
	name := context.String("name")
	lifetime := context.Uint("lifetime")
	maximumFileCount := context.Uint("maximumFileCount")
	maximumFileSize := context.Uint("maximumFileSize")
	maximumSize := context.Uint("maximumSize")
	share := context.Bool("share")
	includeSecret := context.Bool("includeSecret")

	secret := make([]byte, 32)
	rand.Read(secret)

	token, _, err := authentication.CreateToken(secret, name, int(lifetime), int(maximumFileCount), int(maximumFileSize), int(maximumSize))
	if err != nil {
		return err
	}

	if share {
		if includeSecret {
			passwordBytes := make([]byte, 32)
			rand.Read(passwordBytes)
			password := hex.EncodeToString(passwordBytes)

			fmt.Printf("http://localhost:8080?token=%s&secret=%s\n", token, password)
		} else {
			fmt.Printf("http://localhost:8080?token=%s\n", token)
		}
	} else {
		fmt.Println(token)
	}

	return nil
}
