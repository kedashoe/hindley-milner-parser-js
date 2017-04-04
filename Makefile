XYZ = node_modules/.bin/xyz
BABEL = node_modules/.bin/babel
NEARLEY = node_modules/.bin/nearleyc

all: dist/grammar.js dist/post-process.js dist/index.js

dist/grammar.js: src/grammar.ne src/util.ne
	$(NEARLEY) $< > $@

dist/%.js: src/%.js
	$(BABEL) $< -o $@

.PHONY: test
test: all
	node test/test.js

.PHONY: release-major release-minor release-patch
release-major release-minor release-patch:
	@$(XYZ) --increment $(@:release-%=%) --publish-command "./bin/publish.sh"

