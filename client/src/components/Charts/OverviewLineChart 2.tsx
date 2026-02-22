import { useState } from 'react';
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
import type { YearData } from '../../types/models';
import { formatDollars, formatDollarsAxis } from '../../utils/format';

const LINE_CONFIG = [
  { key: 'cashOnHand', label: 'Cash on Hand', stroke: '#d97706' },
  { key: 'cumulativeNet', label: 'Cumulative Net', stroke: '#1e3a5f' },
  { key: 'totalExpenses', label: 'Total Expenses', stroke: '#ef4444' },
  { key: 'totalIncome', label: 'Total Income', stroke: '#22c55e' },
  { key: 'yearlyNet', label: 'Yearly Net', stroke: '#3b82f6' },
] as const;

interface Props {
  years: YearData[];
}

export default function OverviewLineChart({ years }: Readonly<Props>) {
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LINE_CONFIG.map(({ key }) => [key, true]))
  );

  const toggle = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="chart-with-filters">
      <div className="chart-line-filters">
        {LINE_CONFIG.map(({ key, label, stroke }) => (
          <label key={key} className="chart-filter-checkbox">
            <input
              type="checkbox"
              checked={visible[key] ?? true}
              onChange={() => toggle(key)}
            />
            <span className="chart-filter-swatch" style={{ backgroundColor: stroke }} />
            {label}
          </label>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={years} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="year" tickLine={false} />
          <YAxis tickFormatter={formatDollarsAxis} width={80} />
          <Tooltip
            formatter={(value, name) => [formatDollars(Number(value ?? 0)), String(name)]}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          {visible.totalIncome && (
            <Line
              type="monotone"
              dataKey="totalIncome"
              name="Total Income"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
          )}
          {visible.totalExpenses && (
            <Line
              type="monotone"
              dataKey="totalExpenses"
              name="Total Expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
          )}
          {visible.yearlyNet && (
            <Line
              type="monotone"
              dataKey="yearlyNet"
              name="Yearly Net"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          )}
          {visible.cumulativeNet && (
            <Line
              type="monotone"
              dataKey="cumulativeNet"
              name="Cumulative Net"
              stroke="#1e3a5f"
              strokeWidth={3}
              dot={false}
            />
          )}
          {visible.cashOnHand && (
            <Line
              type="monotone"
              dataKey="cashOnHand"
              name="Cash on Hand"
              stroke="#d97706"
              strokeWidth={3}
              dot={false}
              strokeDasharray="8 4"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
