package blog

import (
	"embed"
	"fmt"
	"io/fs"
)

//go:embed resources/*
var resources embed.FS

var (
	Templates fs.FS
	Static    fs.FS
)

func init() {
	var err error
	Static, err = fs.Sub(resources, "resources/static")
	if err != nil {
		panic(err)
	}
	Templates, err = fs.Sub(resources, "resources/templates")
	if err != nil {
		panic(err)
	}

	f, err := Static.Open(".")
	if err != nil {
		panic(err)
	}
	d, ok := f.(fs.ReadDirFile)
	if ok {
		entries, err := d.ReadDir(0)
		if err != nil {
			panic(err)
		}
		for _, ent := range entries {
			fmt.Printf(" - %s\n", ent.Name())
		}
	}
}
