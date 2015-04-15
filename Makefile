run: build
	liquidluck server

build:
	liquidluck build

clean:
	rm -rf deploy

deploy: clean build
	aws s3 sync --storage-class REDUCED_REDUNDANCY deploy s3://www.jeffhui.net/
