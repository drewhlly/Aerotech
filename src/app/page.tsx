const stats = [
  {
    label: "Total People",
    value: "248",
    change: "+8.2%",
    description: "vs last month",
  },
  {
    label: "Open Positions",
    value: "12",
    change: "4 urgent",
    description: "currently hiring",
  },
  {
    label: "Pending Tasks",
    value: "18",
    change: "6 overdue",
    description: "requiring attention",
  },
  {
    label: "Company Health",
    value: "86%",
    change: "+4.1%",
    description: "overall health score",
  },
];

const attentionItems = [
  {
    title: "Engineering recruitment",
    description: "3 positions have been open for more than 30 days.",
    priority: "High",
  },
  {
    title: "Performance reviews",
    description: "8 employee reviews are awaiting manager submission.",
    priority: "Medium",
  },
  {
    title: "Compliance",
    description: "4 employee certifications will expire within 30 days.",
    priority: "High",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-gray-200 bg-white px-5 py-6 lg:block">
          <div className="mb-10">
            <div className="text-xl font-bold tracking-tight">
              AEROTECH
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Organizational Intelligence
            </div>
          </div>

          <nav className="space-y-1">
            {[
              "Overview",
              "Ask Aerotech",
              "People",
              "Recruitment",
              "Operations",
              "Performance",
              "Reports",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2.5 text-sm ${
                  index === 0
                    ? "bg-gray-900 font-medium text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-10 border-t border-gray-100 pt-5">
            <div className="px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
              Administration
            </div>

            <div className="mt-2 rounded-lg px-3 py-2.5 text-sm text-gray-600">
              Settings
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">

          {/* Header */}
          <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 lg:px-10">
            <div>
              <p className="text-sm text-gray-500">
                Friday, August 14, 2026
              </p>

              <h1 className="mt-1 text-lg font-semibold">
                Good afternoon.
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="rounded-full border border-gray-200 p-2">
                🔔
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                A
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

            {/* AI Assistant */}
            <section className="rounded-2xl bg-gray-900 p-7 text-white">
              <div className="max-w-3xl">

                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    AEROTECH AI
                  </span>

                  <span className="text-xs text-gray-400">
                    Organizational Intelligence
                  </span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  What would you like to know about your organization?
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Ask questions, analyse your workforce, find problems or
                  generate reports.
                </p>

                <div className="mt-6 flex max-w-2xl items-center rounded-xl bg-white p-2">

                  <input
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none"
                    placeholder='Try "What needs my attention today?"'
                  />

                  <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                    Ask
                  </button>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Show workforce trends",
                    "Recruitment status",
                    "Generate HR report",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

              </div>
            </section>

            {/* Statistics */}
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>

                  <div className="mt-3 flex items-end justify-between">

                    <p className="text-2xl font-semibold">
                      {stat.value}
                    </p>

                    <span className="text-xs font-medium">
                      {stat.change}
                    </span>

                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </div>
              ))}

            </section>

            {/* Attention */}
            <section className="mt-8 grid gap-6 lg:grid-cols-3">

              <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-semibold">
                      Needs your attention
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Issues Aerotech believes require review.
                    </p>
                  </div>

                  <button className="text-sm font-medium">
                    View all
                  </button>

                </div>

                <div className="mt-6 divide-y divide-gray-100">

                  {attentionItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-4 py-4"
                    >

                      <div>
                        <div className="font-medium">
                          {item.title}
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {item.priority}
                      </span>

                    </div>
                  ))}

                </div>

              </div>

              {/* Company Health */}
              <div className="rounded-xl border border-gray-200 bg-white p-6">

                <h3 className="font-semibold">
                  Company health
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Current organizational overview.
                </p>

                <div className="mt-8 text-center">

                  <div className="text-5xl font-semibold">
                    86%
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Overall health score
                  </p>

                </div>

                <div className="mt-8 space-y-4">

                  {[
                    ["Workforce", 92],
                    ["Recruitment", 78],
                    ["Performance", 88],
                    ["Compliance", 84],
                  ].map(([label, value]) => (

                    <div key={label as string}>

                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-gray-500">
                          {label}
                        </span>

                        <span className="font-medium">
                          {value}%
                        </span>
                      </div>

                      <div className="h-1.5 rounded-full bg-gray-100">

                        <div
                          className="h-1.5 rounded-full bg-gray-900"
                          style={{
                            width: `${value}%`,
                          }}
                        />

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </section>

          </div>

        </section>
      </div>
    </main>
  );
}