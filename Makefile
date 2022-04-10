run: build
	liquidluck server

build:
	liquidluck build

clean:
	rm -rf deploy

deploy: clean build
	aws s3 sync --exclude '*.DS_Store' --storage-class REDUCED_REDUNDANCY deploy s3://www.jeffhui.net/

invalidate:
	aws cloudfront create-invalidation --distribution-id E2B6KCHXFPTEGA --paths '/*'

bin:
	mkdir bin

blog-server: bin
	go build -o bin/blog-server cmd/blog-server/main.go

blog-static: bin
	go build -o bin/blog-static cmd/blog-static/main.go
