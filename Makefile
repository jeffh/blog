.PHONY: run
run: build
	cd v2 && hugo server -D

.PHONY: build
build:
	cd v2 && hugo

.PHONY: clean
clean:
	rm -rf deploy
	rm -rf v2/public

.PHONY: deploy
deploy: clean build
	cd v2 && aws s3 sync --exclude '*.DS_Store' --storage-class REDUCED_REDUNDANCY public s3://www.jeffhui.net/

.PHONY: invalidate
invalidate:
	aws cloudfront create-invalidation --distribution-id E2B6KCHXFPTEGA --paths '/*'
