package server

import (
	"fmt"
	"regexp"
	"strconv"
)

func parseContentRange(header string) (string, uint64, uint64, uint64, error) {
	// bytes 0-1024/2048
	expression, err := regexp.Compile(`^([a-z]+) ([0-9]+)-([0-9]+)/([0-9]+)$`)
	if err != nil {
		return "", 0, 0, 0, err
	}

	matches := expression.FindStringSubmatch(header)
	if matches == nil {
		return "", 0, 0, 0, fmt.Errorf("Bad header")
	}

	unit := matches[1]

	start, err := strconv.ParseUint(matches[2], 10, 64)
	if err != nil {
		return "", 0, 0, 0, err
	}

	stop, err := strconv.ParseUint(matches[3], 10, 64)
	if err != nil {
		return "", 0, 0, 0, err
	}

	size, err := strconv.ParseUint(matches[4], 10, 64)
	if err != nil {
		return "", 0, 0, 0, err
	}

	if start > stop || stop > size {
		return "", 0, 0, 0, fmt.Errorf("Incorrect range")
	}

	return unit, start, stop, size, nil
}
