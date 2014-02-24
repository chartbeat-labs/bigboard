NODE-WEBKIT-URL = https://s3.amazonaws.com/node-webkit/v0.9.1/node-webkit-v0.9.1-osx-ia32.zip
NODE-WEBKIT = tmp/node-webkit.app
APP-NAME = Chartbeat-Big-Board.app
BUILT-WEB-ARCHIVE = app.nw
BUILT-APP = build/$(APP-NAME)

.PHONY: init
init: $(APP-NAME) $(BUILT-APP)

$(APP-NAME): $(NODE-WEBKIT) tmp
	cp -r $< $@
	cp -r app-contents/ $@/Contents/

$(BUILT-APP): $(BUILT-WEB-ARCHIVE) $(NODE-WEBKIT) build tmp
	cp -r $(NODE-WEBKIT) $@
	cp -r app-contents/ $@/Contents/
	cp -r $< $@/Contents/Resources/

$(BUILT-WEB-ARCHIVE):
	zip -r $@ package.json app

$(NODE-WEBKIT): tmp
	wget --output-document=$(@:.app=.zip) $(NODE-WEBKIT-URL)
	unzip $(@:.app=.zip) -d $<

build:
	mkdir -p $@

tmp:
	mkdir -p $@

.PHONY: clean
clean:
	-rm -rf $(APP-NAME) $(BUILT-WEB-ARCHIVE) tmp/ build/
