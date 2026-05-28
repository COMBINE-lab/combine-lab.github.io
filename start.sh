#!/usr/bin/env bash
set -euo pipefail

if [ -d /opt/homebrew/opt/ruby@3.3/bin ]; then
  export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
fi

bundle
bundle exec jekyll serve --open-url --trace
