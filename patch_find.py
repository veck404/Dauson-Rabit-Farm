path = 'components/farm/Dashboard.tsx'
content = open(path, 'rb').read().decode('utf-8')

# Find the actual greeting block
idx = content.find('Thursday, 06 August 2026')
if idx == -1:
    print("date string not found — may already be replaced")
else:
    snippet = content[idx-50:idx+300]
    print("found block:", repr(snippet))
