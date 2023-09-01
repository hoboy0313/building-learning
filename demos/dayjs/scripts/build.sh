#!/bin/sh

pnpm clean;

start_time=`date +%s`

cross-env BABEL_ENV=build node build

npm run size

end_time=`date +%s`

echo "总耗时：$[$end_time - $start_time]s"
