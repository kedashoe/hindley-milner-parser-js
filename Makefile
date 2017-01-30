XYZ = node_modules/.bin/xyz
BABEL = node_modules/.bin/babel

SRC = src/hm-parser.js
DST = dist/hm-parser.js

all: $(DST)

$(DST): $(SRC)
	$(BABEL) $< -o $@

test: all
	node test/test.js

.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@$(XYZ) --increment $(@:release-%=%) --publish-command "./bin/publish.sh"

