path = 'components/farm/Operations.tsx'
content = open(path, 'rb').read().decode('utf-8')

# Fix the dailyConsumption body — it was partially replaced before
# Current state: dailyConsumption = dailyConsumptionKg (but daysCover was already updated via edit_file)
# Check what's there now:
idx = content.find('const dailyConsumption')
snippet = content[idx:idx+200] if idx != -1 else 'NOT FOUND'
print("current daily snippet:", repr(snippet))

# Replace old hardcoded assignment with prop-based one
old = '  const dailyConsumption = 36.8;\n  const daysCover = dailyConsumptionKg > 0 ? Math.floor(feedOnHand / dailyConsumptionKg) : 0;'
new = '  const dailyConsumption = dailyConsumptionKg;\n  const daysCover = dailyConsumption > 0 ? Math.floor(feedOnHand / dailyConsumption) : 0;'
if old in content:
    content = content.replace(old, new, 1)
    print("daily body replaced (old path)")
else:
    # It may already be partially done — just ensure the variable uses the prop
    old2 = '  const dailyConsumption = 36.8;'
    new2 = '  const dailyConsumption = dailyConsumptionKg;'
    if old2 in content:
        content = content.replace(old2, new2, 1)
        print("daily var replaced")
    else:
        print("daily: nothing to replace (may already be correct)")

open(path, 'wb').write(content.encode('utf-8'))
print("operations saved")
