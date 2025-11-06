"use client";

interface EarningsData {
  month: string;
  earnings: number;
  sessions: number;
}

interface EarningsChartProps {
  data: EarningsData[];
}

export default function EarningsChart({ data }: EarningsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-white/60">
        <p>No earnings data available yet</p>
      </div>
    );
  }

  const maxEarnings = Math.max(...data.map((d) => d.earnings), 1);

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.earnings / maxEarnings) * 100;

            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                {/* Bar */}
                <div className="relative w-full" style={{ height: "100%" }}>
                  <div className="absolute bottom-0 w-full flex flex-col justify-end">
                    {/* Hover tooltip */}
                    <div className="group relative">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-300 hover:from-purple-500 hover:to-purple-300"
                        style={{ height: `${height}%`, minHeight: item.earnings > 0 ? "8px" : "2px" }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 group-hover:block">
                        <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-sm shadow-lg">
                          <p className="font-semibold text-white">${item.earnings.toFixed(2)}</p>
                          <p className="text-xs text-white/60">{item.sessions} sessions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <p className="text-xs text-white/60">{item.month.split(" ")[0]}</p>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 -ml-12 flex h-full flex-col justify-between text-right text-xs text-white/40">
          <span>${maxEarnings.toFixed(0)}</span>
          <span>${(maxEarnings / 2).toFixed(0)}</span>
          <span>$0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gradient-to-t from-purple-600 to-purple-400" />
          <span className="text-white/70">Earnings</span>
        </div>
      </div>
    </div>
  );
}
