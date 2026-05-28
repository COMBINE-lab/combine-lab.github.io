#!/usr/bin/env bash
set -euo pipefail

if [ -d /opt/homebrew/opt/ruby@3.3/bin ]; then
  export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
fi

python ./_data/build-research.py
ruby ./_data/build-resources.rb
