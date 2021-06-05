package configuration

import "fmt"

func Validate(config *Configuration) []error {
	errors := make([]error, 0)

	if config.secret.value != "" && config.secret.file != "" {
		errors = append(errors, fmt.Errorf("The secret value and secret file are mutually exclusive"))
	}

	secret, err := config.Secret()
	if err != nil {
		errors = append(errors, fmt.Errorf("Unable to read secret: %v", err))
	} else {
		if len(secret) < 32 {
			errors = append(errors, fmt.Errorf("The size of the secret must not be less then 32 bytes"))
		}
	}

	return errors
}