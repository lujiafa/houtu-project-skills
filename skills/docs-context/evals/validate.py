"""
Static validation script for docs-context skill.

Run from anywhere:
    python3 validate.py

Resolves paths relative to this file so it works on any machine.

Checks:
- evals.json validity, ID uniqueness, fixture refs all exist
- SKILL.md and SKILL-CN.md description <= 1024 chars
- SKILL.md <-> SKILL-CN.md header structure 1:1 aligned
- fixture-synced-pay-with-status integrity (added in v1.2 round)
- iteration-4 workspace correctness (added in v1.2 round; SKIPPED if not present)
- Old sections removed from SKILL files; new sections present
"""
import json
import os
import re
import sys

# Resolve paths relative to this file: <root>/skills/docs-context/evals/validate.py
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # skills/docs-context
SKILLS_PARENT = os.path.dirname(ROOT)  # skills/
WORKSPACE = os.path.join(SKILLS_PARENT, 'docs-context-workspace')

results = []
def check(name, ok, detail=''):
    icon = 'PASS' if ok else 'FAIL'
    detail_str = ' (' + detail + ')' if detail else ''
    results.append((ok, '  [{}] {}{}'.format(icon, name, detail_str)))

def section(title):
    print('\n=== {} ==='.format(title))

# 1. evals.json structure
section('1. evals.json structure')
try:
    with open(ROOT + '/evals/evals.json', 'r', encoding='utf-8') as f:
        evals_data = json.load(f)
    check('evals.json parses as JSON', True)
    check('Total eval count = 31', len(evals_data['evals']) == 31, str(len(evals_data['evals'])))
    ids = [e['id'] for e in evals_data['evals']]
    check('No duplicate IDs', len(ids) == len(set(ids)))
    check('IDs are 1..31 sequential', ids == list(range(1, 32)))
    fixtures_registered = {f['name'] for f in evals_data['fixture_setup_instructions']['fixtures_needed']}
    check('Fixture count = 9', len(fixtures_registered) == 9, str(len(fixtures_registered)))
    fixtures_referenced = set()
    for e in evals_data['evals']:
        for fpath in e.get('files', []):
            name = fpath.replace('evals/files/', '').rstrip('/')
            fixtures_referenced.add(name)
    missing = fixtures_referenced - fixtures_registered
    check('All referenced fixtures registered', not missing, 'missing: ' + str(missing) if missing else '')
except Exception as e:
    check('evals.json parses', False, str(e))
    evals_data = None
    fixtures_registered = set()

for r in results: print(r[1])
results.clear()

# 2. SKILL description char limits
section('2. SKILL description char limits (<= 1024)')
def measure_desc(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    start = content.index('description: |\n') + len('description: |\n')
    end = content.index('metadata:', start)
    raw = content[start:end]
    lines = raw.splitlines()
    stripped = '\n'.join(l[2:] if l.startswith('  ') else l for l in lines).rstrip('\n')
    return len(stripped), len(stripped.encode('utf-8'))

en_chars, en_bytes = measure_desc(ROOT + '/SKILL.md')
cn_chars, cn_bytes = measure_desc(ROOT + '/SKILL-CN.md')
check('SKILL.md description chars', en_chars <= 1024, '{} chars / {} bytes'.format(en_chars, en_bytes))
check('SKILL-CN.md description chars', cn_chars <= 1024, '{} chars / {} bytes'.format(cn_chars, cn_bytes))
for r in results: print(r[1])
results.clear()

# 3. Header structure alignment
section('3. SKILL header structure alignment')
def get_headers(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    in_code = False
    headers = []
    for line in content.splitlines():
        if line.startswith('```'):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = re.match(r'^(#{1,4})\s+(.+)', line)
        if m:
            headers.append(len(m.group(1)))
    return headers

en_h = get_headers(ROOT + '/SKILL.md')
cn_h = get_headers(ROOT + '/SKILL-CN.md')
check('Header counts match', len(en_h) == len(cn_h), 'EN={} CN={}'.format(len(en_h), len(cn_h)))
check('Header levels match position-for-position', en_h == cn_h)
for r in results: print(r[1])
results.clear()

# 4. fixture-synced-pay-with-status integrity
section('4. fixture-synced-pay-with-status integrity')
fix_dir = ROOT + '/evals/files/fixture-synced-pay-with-status'
expected = [
    'pom.xml',
    'docs/architecture.md', 'docs/coding.md', 'docs/tech-stack.md', 'docs/modules/pay.md',
    'src/main/java/com/example/pay/PayApplication.java',
    'src/main/java/com/example/pay/controller/PayController.java',
    'src/main/java/com/example/pay/entity/Order.java',
    'src/main/java/com/example/pay/entity/OrderStatus.java',
    'src/main/java/com/example/pay/exception/BizException.java',
    'src/main/java/com/example/pay/service/OrderService.java',
    'src/main/resources/application.yml',
    'src/main/resources/db/migration/V20240315__add_order_status.sql',
]
for f in expected:
    check(f, os.path.isfile(fix_dir + '/' + f))

with open(fix_dir + '/src/main/java/com/example/pay/entity/Order.java', encoding='utf-8') as f:
    order_src = f.read()
check('Order.java uses OrderStatus enum', 'private OrderStatus status;' in order_src)
check('Order.java has @Enumerated(EnumType.STRING)', '@Enumerated(EnumType.STRING)' in order_src)

with open(fix_dir + '/src/main/java/com/example/pay/service/OrderService.java', encoding='utf-8') as f:
    svc_src = f.read()
check('OrderService.java has markPaid method', 'markPaid' in svc_src)
check('OrderService.java has cancel method', 'public void cancel' in svc_src)

with open(fix_dir + '/docs/modules/pay.md', encoding='utf-8') as f:
    paydoc = f.read()
check('pay.md has Order Status Tracking capability', 'Capability: Order Status Tracking' in paydoc)
check('pay.md has migration script reference', 'V20240315__add_order_status.sql' in paydoc)
check('pay.md has State Transitions table', '### State Transitions' in paydoc)
for r in results: print(r[1])
results.clear()

# 5. iteration-4 workspace correctness (skip if workspace dir not present)
section('5. iteration-4 workspace correctness')
iter4 = WORKSPACE + '/iteration-4'
if not os.path.isdir(iter4):
    print('  [SKIP] iteration-4 not found at {} (workspace is gitignored; nothing to validate)'.format(iter4))
else:
    check('iteration-4 has benchmark.json', os.path.isfile(iter4 + '/benchmark.json'))
    for eid in range(19, 32):
        for mode in ['with_skill', 'without_skill']:
            d = iter4 + '/eval-{}-{}'.format(eid, mode)
            check('eval-{}-{} dir+docs+src'.format(eid, mode),
                  os.path.isdir(d) and os.path.isdir(d + '/docs') and os.path.isdir(d + '/src'))

fail = sum(1 for ok, _ in results if not ok)
print('  Total: {}/{} passed'.format(len(results) - fail, len(results)))
for ok, msg in results:
    if not ok:
        print(msg)
results.clear()

# 6. Other consistency
section('6. Cross-file consistency')
files_dir = ROOT + '/evals/files'
if evals_data:
    for fix in fixtures_registered:
        check('fixture-on-disk: ' + fix, os.path.isdir(files_dir + '/' + fix))
    for e in evals_data['evals']:
        check('eval-{} has fixture ref'.format(e['id']), len(e.get('files', [])) >= 1)

with open(ROOT + '/SKILL.md', encoding='utf-8') as f:
    skill_en = f.read()
with open(ROOT + '/SKILL-CN.md', encoding='utf-8') as f:
    skill_cn = f.read()
check('SKILL.md: no "## Operating Modes"', '## Operating Modes' not in skill_en)
check('SKILL.md: no "## Trigger Rules"', '## Trigger Rules' not in skill_en)
check('SKILL.md: has "## Modes & Triggers"', '## Modes & Triggers' in skill_en)
check('SKILL.md: has "### Removal & Rollback Sync"', '### Removal & Rollback Sync' in skill_en)
check('SKILL.md: has "## Coordination with other skills"', '## Coordination with other skills' in skill_en)
check('SKILL-CN.md: no "## 工作模式"', '## 工作模式' not in skill_cn)
check('SKILL-CN.md: no "## 触发规则"', '## 触发规则' not in skill_cn)
check('SKILL-CN.md: has "## 模式与触发"', '## 模式与触发' in skill_cn)
check('SKILL-CN.md: has "### Removal & Rollback Sync"', '### Removal & Rollback Sync' in skill_cn)
check('SKILL-CN.md: has "## 与其他 skill 协作"', '## 与其他 skill 协作' in skill_cn)

fail = sum(1 for ok, _ in results if not ok)
print('  Total: {}/{} passed'.format(len(results) - fail, len(results)))
for ok, msg in results:
    if not ok:
        print(msg)
results.clear()

print('\n=== SUMMARY ===')
all_results = []
print('Validation complete.')
