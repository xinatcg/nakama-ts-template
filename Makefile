.PHONY: local
# initial launch the local env
local:
	npm run build && docker-compose up -d

# when ts file is changed, update the local env (runtime module)
local-update:
	npm run build && docker-compose restart nakama

local-update-dev:
	npm run build-dev && docker-compose restart nakama

# Rollup Configuration
rollup-setting:
	npm install rollup-plugin-replace --save-dev
	npm install rollup-plugin-replace --save-dev

local-log:
	tail -f data/logfile.log