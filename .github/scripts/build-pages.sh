#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."
site_dir="${RUNNER_TEMP:?RUNNER_TEMP must point to a temporary directory}/pages-site"
mkdir -p "$site_dir"
rsync -a --delete --exclude='.*' --exclude='__pycache__' ./ "$site_dir/"

# Keep repository originals intact; optimize only the large deployment copies.
while IFS= read -r -d '' video; do
  compressed="${video%.mp4}.compressed.mp4"
  echo "Optimizing ${video##*/}"
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$video" \
    -map 0:v:0 -map '0:a?' -c:v libx264 -preset fast -crf 23 \
    -pix_fmt yuv420p -c:a copy -movflags +faststart "$compressed"
  if [ "$(wc -c < "$compressed")" -lt "$(wc -c < "$video")" ]; then
    mv "$compressed" "$video"
  else
    rm "$compressed"
  fi
done < <(find "$site_dir/coverage/media" -type f -name '*.mp4' -size +20M -print0)

# Leave room for the artifact archive below GitHub Pages' 1 GB site limit.
python3 - "$site_dir" <<'PY'
import pathlib
import sys

size = sum(p.stat().st_size for p in pathlib.Path(sys.argv[1]).rglob('*') if p.is_file())
print(f'Pages site: {size:,} bytes ({size / 1_000_000:.1f} MB)')
if size >= 990_000_000:
    sys.exit('Pages site exceeds the 990 MB deployment budget; reduce assets before deploying.')
PY
