#!/usr/bin/env bash

set -euo pipefail

readonly ACTIONLINT_VERSION="1.7.12"
readonly SHELLCHECK_VERSION="0.11.0"
readonly CACHE_ROOT="${XDG_CACHE_HOME:-${HOME}/.cache}/store-canary/workflow-lint"

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    readonly ACTIONLINT_PLATFORM="linux_amd64"
    readonly ACTIONLINT_SHA256="8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8"
    readonly SHELLCHECK_PLATFORM="linux.x86_64"
    readonly SHELLCHECK_SHA256="b7af85e41cc99489dcc21d66c6d5f3685138f06d34651e6d34b42ec6d54fe6f6"
    ;;
  Linux-aarch64 | Linux-arm64)
    readonly ACTIONLINT_PLATFORM="linux_arm64"
    readonly ACTIONLINT_SHA256="325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6"
    readonly SHELLCHECK_PLATFORM="linux.aarch64"
    readonly SHELLCHECK_SHA256="68a8133197a50beb8803f8d42f9908d1af1c5540d4bb05fdfca8c1fa47decefc"
    ;;
  Darwin-x86_64)
    readonly ACTIONLINT_PLATFORM="darwin_amd64"
    readonly ACTIONLINT_SHA256="5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644"
    readonly SHELLCHECK_PLATFORM="darwin.x86_64"
    readonly SHELLCHECK_SHA256="c2c15e08df0e8fbc374c335b230a7ee958c313fa5714817a59aa59f1aa594f51"
    ;;
  Darwin-arm64)
    readonly ACTIONLINT_PLATFORM="darwin_arm64"
    readonly ACTIONLINT_SHA256="aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f"
    readonly SHELLCHECK_PLATFORM="darwin.aarch64"
    readonly SHELLCHECK_SHA256="339b930feb1ea764467013cc1f72d09cd6b869ebf1013296ba9055ab2ffbd26f"
    ;;
  *)
    echo "Unsupported workflow-lint platform: $(uname -s) $(uname -m)" >&2
    exit 1
    ;;
esac

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{ print $1 }'
  else
    shasum -a 256 "$1" | awk '{ print $1 }'
  fi
}

download_and_verify() {
  local url="$1"
  local archive="$2"
  local expected_sha256="$3"

  curl --fail --silent --show-error --location --output "${archive}" "${url}"

  local actual_sha256
  actual_sha256="$(sha256 "${archive}")"
  if [[ "${actual_sha256}" != "${expected_sha256}" ]]; then
    echo "Checksum mismatch for ${url}" >&2
    exit 1
  fi
}

readonly ACTIONLINT_DIR="${CACHE_ROOT}/actionlint-${ACTIONLINT_VERSION}"
readonly ACTIONLINT_BIN="${ACTIONLINT_DIR}/actionlint"
if [[ ! -x "${ACTIONLINT_BIN}" ]]; then
  mkdir -p "${ACTIONLINT_DIR}"
  readonly ACTIONLINT_ARCHIVE="${ACTIONLINT_DIR}/actionlint.tar.gz"
  download_and_verify \
    "https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}/actionlint_${ACTIONLINT_VERSION}_${ACTIONLINT_PLATFORM}.tar.gz" \
    "${ACTIONLINT_ARCHIVE}" \
    "${ACTIONLINT_SHA256}"
  tar -xzf "${ACTIONLINT_ARCHIVE}" -C "${ACTIONLINT_DIR}" actionlint
  rm "${ACTIONLINT_ARCHIVE}"
fi

readonly SHELLCHECK_DIR="${CACHE_ROOT}/shellcheck-${SHELLCHECK_VERSION}"
readonly SHELLCHECK_BIN="${SHELLCHECK_DIR}/shellcheck"
if [[ ! -x "${SHELLCHECK_BIN}" ]]; then
  mkdir -p "${SHELLCHECK_DIR}"
  readonly SHELLCHECK_ARCHIVE="${SHELLCHECK_DIR}/shellcheck.tar.gz"
  download_and_verify \
    "https://github.com/koalaman/shellcheck/releases/download/v${SHELLCHECK_VERSION}/shellcheck-v${SHELLCHECK_VERSION}.${SHELLCHECK_PLATFORM}.tar.gz" \
    "${SHELLCHECK_ARCHIVE}" \
    "${SHELLCHECK_SHA256}"
  tar -xzf "${SHELLCHECK_ARCHIVE}" \
    -C "${SHELLCHECK_DIR}" \
    --strip-components=1 \
    "shellcheck-v${SHELLCHECK_VERSION}/shellcheck"
  rm "${SHELLCHECK_ARCHIVE}"
fi

exec "${ACTIONLINT_BIN}" -color -shellcheck "${SHELLCHECK_BIN}"
