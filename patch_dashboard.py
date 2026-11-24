path = 'components/farm/Dashboard.tsx'
content = open(path, 'rb').read().decode('utf-8')

# --- 1. Extend function signature and add computed vars ---
old1 = (
    "  editTask: (task: FarmTask) => void;\r\n"
    "}) {\r\n"
    "  const orderedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));\r\n"
    "  const kpis = [\r\n"
    "    {\r\n"
    '      label: "Registered rabbits",\r\n'
    "      value: rabbits.length,\r\n"
    '      note: "+3 this month",\r\n'
    '      icon: "rabbit" as const,\r\n'
    '      tone: "bg-emerald-50 text-emerald-700",\r\n'
    "    },"
)
new1 = (
    "  editTask: (task: FarmTask) => void;\n"
    "  adminName: string;\n"
    "  farmName: string;\n"
    "}) {\n"
    "  const orderedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));\n"
    "  const now = new Date();\n"
    "  const hour = now.getHours();\n"
    '  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";\n'
    '  const todayLabel = now.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });\n'
    "  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);\n"
    "  const newThisMonth = rabbits.filter((r) => r.acquiredDate >= startOfMonth).length;\n"
    "  const kpis = [\n"
    "    {\n"
    '      label: "Registered rabbits",\n'
    "      value: rabbits.length,\n"
    "      note: newThisMonth > 0 ? `+${newThisMonth} this month` : \"No new arrivals\",\n"
    '      icon: "rabbit" as const,\n'
    '      tone: "bg-emerald-50 text-emerald-700",\n'
    "    },"
)

# Also need to add adminName/farmName to the destructured params
old_params = (
    "  addTask,\r\n"
    "  editTask,\r\n"
    "}: {"
)
new_params = (
    "  addTask,\n"
    "  editTask,\n"
    "  adminName,\n"
    "  farmName,\n"
    "}: {"
)

if old_params in content:
    content = content.replace(old_params, new_params, 1)
    print("params replaced")
else:
    print("PARAMS NOT FOUND")

if old1 in content:
    content = content.replace(old1, new1, 1)
    print("sig+kpi replaced")
else:
    print("SIG+KPI NOT FOUND")

# --- 2. Replace hardcoded date and greeting ---
old2 = (
    "            Thursday, 06 August 2026\r\n"
    "          </p>\r\n"
    '          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#183e34] sm:text-4xl">\r\n'
    "            Good morning, Esther.\r\n"
    "          </h2>\r\n"
    '          <p className="mt-2 text-sm text-stone-500">\r\n'
    "            Here's what is happening across Dauson Farm today.\r\n"
    "          </p>"
)
new2 = (
    "            {todayLabel}\n"
    "          </p>\n"
    '          <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#183e34] sm:text-4xl">\n'
    "            {greeting}, {adminName}.\n"
    "          </h2>\n"
    '          <p className="mt-2 text-sm text-stone-500">\n'
    "            Here's what is happening across {farmName} today.\n"
    "          </p>"
)

if old2 in content:
    content = content.replace(old2, new2, 1)
    print("greeting replaced")
else:
    print("GREETING NOT FOUND")

open(path, 'wb').write(content.encode('utf-8'))
print("dashboard saved")
