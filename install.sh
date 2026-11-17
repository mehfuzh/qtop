#!/usr/bin/env bash
# qtop installer: fetch a release tarball from GitHub, build, and link `qtop`.
#   curl -fsSL https://raw.githubusercontent.com/mehfuzh/qtop/main/install.sh | bash
# Override the release with QTOP_VERSION=v0.2.0 (defaults to v0.1.0).
set -euo pipefail

REPO="mehfuzh/qtop"
VERSION="${QTOP_VERSION:-v0.1.0}"

die() { echo "qtop install: $*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node.js 18+ is required (https://nodejs.org or: brew install node)"
command -v npm  >/dev/null 2>&1 || die "npm is required (ships with Node.js)"
command -v curl >/dev/null 2>&1 || die "curl is required"
command -v tar  >/dev/null 2>&1 || die "tar is required"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "Node.js 18+ required (found $(node --version))"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

url="https://codeload.github.com/$REPO/tar.gz/refs/tags/$VERSION"
echo "Downloading qtop $VERSION…"
curl -fsSL "$url" -o "$tmp/qtop.tar.gz" || die "download failed: $url (does the tag exist?)"
tar -xzf "$tmp/qtop.tar.gz" -C "$tmp"

src="$tmp/qtop-${VERSION#v}"
[ -d "$src" ] || die "unexpected archive layout"
cd "$src"

echo "Installing dependencies…"
npm install --no-fund --no-audit
echo "Building…"
npm run build
chmod +x dist/index.js

echo "Linking qtop globally…"
if ! npm link 2>/dev/null; then
  die "npm link failed (permissions?). Try: sudo bash install.sh, or run 'npm start' inside $src"
fi

echo "✔ Installed $(qtop --version 2>/dev/null || echo qtop) — run 'qtop' in a terminal at least 80×24."
