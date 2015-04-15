run: build
	liquidluck server

build:
	liquidluck build

clean:
	rm -rf deploy

upload:
	aws s3 sync --storage-class REDUCED_REDUNDANCY deploy/ s3://www.jeffhui.net/
