#!/usr/bin/env bash
# One-time acquisition helper. Downloads candidate images from Unsplash/Pexels
# CDN into public/images for visual inspection. Not run at build time.
set -u
DEST="$(cd "$(dirname "$0")/.." && pwd)/public/images"
mkdir -p "$DEST"

# name|url
SLOTS='
hero-workforce|https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&h=1080&q=72&fm=webp
home-employers|https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&h=1050&q=72&fm=webp
home-candidates|https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1400&h=1050&q=72&fm=webp
about-team|https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&h=900&q=72&fm=webp
about-culture|https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&h=1050&q=72&fm=webp
service-recruitment|https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
service-staffing|https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
service-executive|https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
service-consulting|https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
service-managed|https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
service-assessment|https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
industry-technology|https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
industry-manufacturing|https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
industry-healthcare|https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
industry-finance|https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
industry-logistics|https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
industry-energy|https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&h=800&q=72&fm=webp
employers-hero|https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&h=1080&q=72&fm=webp
candidates-hero|https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&h=1080&q=72&fm=webp
insight-workforce-trends|https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&h=900&q=72&fm=webp
insight-hiring-process|https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&h=900&q=72&fm=webp
insight-retention|https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1600&h=900&q=72&fm=webp
'

echo "name|http|type|bytes"
echo "$SLOTS" | while IFS='|' read -r name url; do
  [ -z "$name" ] && continue
  out="$DEST/$name.webp"
  code=$(curl -s -o "$out" -w "%{http_code}" -L --max-time 60 "$url")
  type=$(file -b --mime-type "$out" 2>/dev/null)
  bytes=$(stat -c%s "$out" 2>/dev/null || echo 0)
  echo "$name|$code|$type|$bytes"
done
