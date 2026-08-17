#!/usr/bin/env bash
set -euo pipefail

if [ -d /Users/rob/.rubies/ruby-3.4.1/bin ]; then
  export PATH="/Users/rob/.rubies/ruby-3.4.1/bin/:$PATH"
fi

bundle
bundle exec jekyll serve --open-url --trace
