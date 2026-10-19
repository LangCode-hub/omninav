import json
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
dist = root/'dist'
scenes = ['indoor-static', 'indoor-dynamic', 'pillars', 'forest', 'mesh-obstacles', 'sports-field']
methods = ['omninav', 'omninav-minus', 'trace', 'abs', 'agile']
html = (dist/'index.html').read_text(encoding='utf-8')
script = (dist/'assets/site.js').read_text(encoding='utf-8')
assert '<html lang="en">' in html
assert html.count('<iframe ') == 2
assert html.index('/embed/YZBGMiN6IBI') < html.index('/embed/i-mlYopYlfE')
assert len(re.findall(r'id: "(?:'+'|'.join(scenes)+r')"', script)) == 6
assert [script.index('id: "'+method+'"') for method in methods] == sorted(script.index('id: "'+method+'"') for method in methods)
assert 'preload="none"' in script and 'autoplay' not in script
assert (dist/'.nojekyll').exists()
total = 0
for scene in scenes:
    for method in methods:
        for suffix in ['mp4', 'jpg']:
            path = dist/'media'/scene/f'{method}.{suffix}'
            assert path.is_file() and path.stat().st_size > 0, path
            if suffix == 'mp4':
                assert path.stat().st_size < 100*1024*1024, path
                assert not path.open('rb').read(100).startswith(b'version https://git-lfs'), path
            total += path.stat().st_size
assert len(list((dist/'media').rglob('*.mp4'))) == 30
assert total < 1_000_000_000
for path in dist.rglob('*'):
    if path.is_file() and path.suffix in {'.html', '.css', '.js', '.json', '.svg'}:
        content = path.read_text(encoding='utf-8')
        assert not re.search(r'[\u4e00-\u9fff]', content), f'Non-English text: {path}'
        assert not re.search(r'[A-Za-z]:[\\/]+Users[\\/]', content), f'Local identity leak: {path}'
print(json.dumps({'scenes': 6, 'comparison_videos': 30, 'youtube_embeds': 2, 'media_bytes': total, 'checks': 'passed'}, indent=2))
