#!/usr/bin/env bash
main() {
    ZOLA_VERSION=0.19.2

    curl -sLJO "https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz"
    tar -xf zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz

    git submodule update --init --recursive

    if [ "${WORKERS_CI_BRANCH:-main}" = main ]; then
        ./zola build
    else
        ./zola build --base-url /
    fi
}

set -euo pipefail
main "$@"
