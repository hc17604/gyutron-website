"""Offline synthetic print checks. Requires pypdf, PyMuPDF and Pillow."""
from pathlib import Path
from pypdf import PdfReader
import fitz
import hashlib
import json
import re
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
markers = [f'QAREF-{i:03}' for i in range(1, 51)] + [f'TERM-{i:03}' for i in range(1, 41)]
results = []
for lang in ['en', 'zh', 'de', 'ja']:
    file = root / f'quotation-{lang}.pdf'
    reader = PdfReader(file)
    texts = [page.extract_text() for page in reader.pages]
    combined = '\n'.join(texts)
    doc = fitz.open(file)
    unicode_text = '\n'.join(page.get_text() for page in doc)
    compact_text = re.sub(r'\s+', '', unicode_text)
    positions, counter_checks = [], []
    for index, page in enumerate(doc):
        spans = [span for block in page.get_text('dict')['blocks']
                 for line in block.get('lines', []) for span in line['spans']]
        refs = [span for span in spans if 'QT-PRINT-QA-R01' in span['text'] and span['bbox'][1] > 790]
        assert refs, (lang, index + 1, 'missing marginbox reference')
        counter_checks.append(any(span['text'] == f'{index + 1} / {len(texts)}'
                                  and span['bbox'][1] > 790 for span in spans))
        body_bottom = max((span['bbox'][3] for span in spans if span['bbox'][1] < 790), default=0)
        footer_top = min(span['bbox'][1] for span in refs)
        positions.append({'page': index + 1, 'footerTop': round(footer_top, 2),
                          'bodyBottom': round(body_bottom, 2), 'clearance': round(footer_top - body_bottom, 2)})
    record = {
        'lang': lang, 'pages': len(texts), 'bytes': file.stat().st_size,
        'missingMarkers': [marker for marker in markers if marker not in combined],
        'marginReferenceEveryPage': True, 'pageCounterEveryPage': all(counter_checks),
        'expectedTotalPresent': ('1.574.208,56' if lang == 'de' else '1,574,208.56') in combined,
        'hasChinese': '工业检测系统报价' in compact_text,
        'hasLanguageLabel': {'en': 'QUOTATION', 'zh': '报价单', 'de': 'ANGEBOT', 'ja': '見積書'}[lang] in compact_text,
        'replacementGlyph': '\ufffd' in unicode_text,
        'internalOutcomeExcluded': 'INTERNAL-ONLY-QA-SENTINEL' not in combined,
        'positions': positions,
    }
    assert not record['missingMarkers'] and record['pageCounterEveryPage'] and record['expectedTotalPresent'], record
    assert record['hasChinese'] and record['hasLanguageLabel'] and not record['replacementGlyph'], record
    assert record['internalOutcomeExcluded'] and min(p['clearance'] for p in positions) > 5, record
    results.append(record)
    thumbs = []
    for index in range(1, len(texts) + 1):
        image = Image.open(root / f'page-{lang}-{index}.png').convert('RGB')
        image.thumbnail((420, 610))
        canvas = Image.new('RGB', (432, 630), '#d5d9de')
        canvas.paste(image, ((432 - image.width) // 2, 20))
        ImageDraw.Draw(canvas).text((10, 5), f'{lang.upper()} {index}/{len(texts)}', fill='black')
        thumbs.append(canvas)
    sheet = Image.new('RGB', (432 * 3, 630 * ((len(thumbs) + 2) // 3)), '#c7ccd2')
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % 3) * 432, (index // 3) * 630))
    sheet.save(root / f'contact-sheet-{lang}.jpg', quality=90)

renderer = root.parents[2] / 'src/platform/quotes/document.mjs'
checks = {
    'fixtureSource': 'Same synthetic body as v1; nonempty internal response deliberately supplied and excluded',
    'cjkExtractor': 'MuPDF; pypdf maps some Japanese glyphs to compatibility radicals',
    'rendererSHA256': hashlib.sha256(renderer.read_bytes()).hexdigest(),
    'checks': results,
}
(root / 'pdf-checks.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps([{'lang': r['lang'], 'pages': r['pages'], 'missingMarkers': r['missingMarkers'],
                   'pageCounterEveryPage': r['pageCounterEveryPage'],
                   'minimumFooterClearance': min(p['clearance'] for p in r['positions']),
                   'internalOutcomeExcluded': r['internalOutcomeExcluded']} for r in results], indent=2))
