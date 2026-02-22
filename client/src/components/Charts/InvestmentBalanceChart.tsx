import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AccountBalanceYear } from '../../types/models';
import { formatDollars, formatDollarsAxis } from '../../utils/format';

interface Props {
  accountBalances: AccountBalanceYear[];
}

export default function InvestmentBalanceChart({ accountBalances }: Readonly<Props>) {
  // Group account balances by modelId and create chart data
  const { accounts, chartData } = useMemo(() => {
    const accountMap = new Map<string, string>();
    const yearMap = new Map<number, Record<string, number>>();

    // Discover all unique accounts and years
    for (const entry of accountBalances) {
      if (!accountMap.has(entry.modelId)) {
        accountMap.set(entry.modelId, entry.description);
      }
      if (!yearMap.has(entry.year)) {
        yearMap.set(entry.year, { year: entry.year });
      }
      const yearData = yearMap.get(entry.year)!;
      yearData[`balance_${entry.modelId}`] = entry.endingBalance;
    }

    const accounts = Array.from(accountMap.entries()).map(([id, desc]) => ({
      id,
      description: desc,
      key: `balance_${id}`,
    }));

    const chartData = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);

    return { accounts, chartData };
  }, [accountBalances]);

  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(accounts.map(({ key }) => [key, true]))
  );

  const toggle = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Color palette for different accounts
  const COLORS = [
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  if (accounts.length === 0) {
    return (
      <div className="chart-container">
        <p>No investment accounts found in this scenario.</p>
      </div>
    );
  }

  return (
    <div className="chart-with-filters">
      <div className="chart-line-filters">
        {accounts.map((account, i) => (
          <label key={account.key} className="chart-filter-checkbox">
            <input
              type="checkbox"
              checked={visible[account.key] ?? true}
              onChange={() => toggle(account.key)}
            />
            <span
              className="chart-filter-swatch"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {account.description}
          </label>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="year" tickLine={false} />
          <YAxis tickFormatter={formatDollarsAxis} width={80} />
          <Tooltip
            formatter={(value, name) => [formatDollars(Number(value ?? 0)), String(name)]}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          {accounts.map((account, i) =>
            visible[account.key] ? (
              <Line
                key={account.key}
                type="monotone"
                dataKey={account.key}
                name={account.description}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
