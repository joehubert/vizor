import { useState, useMemo, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { YearData } from '../../types/models';
import { formatDollars, formatDollarsAxis } from '../../utils/format';

const LINE_CONFIG = [
  { key: 'cashOnHand',             label: 'Cash on Hand',             stroke: '#d97706', strokeWidth: 3, dash: '8 4',   defaultVisible: true  },
  { key: 'cumulativeNet',          label: 'Cumulative Net',            stroke: '#1e3a5f', strokeWidth: 3, dash: '6 3',   defaultVisible: true  },
  { key: 'totalExpenses',          label: 'Total Expenses',            stroke: '#ef4444', strokeWidth: 2, dash: undefined, defaultVisible: true  },
  { key: 'totalIncome',            label: 'Total Income',              stroke: '#22c55e', strokeWidth: 2, dash: undefined, defaultVisible: true  },
  { key: 'yearlyNet',              label: 'Yearly Net',                stroke: '#3b82f6', strokeWidth: 2, dash: undefined, defaultVisible: true  },
  { key: 'totalInvestmentBalance', label: 'Total Investment Balance',  stroke: '#8b5cf6', strokeWidth: 2, dash: '5 3',   defaultVisible: false },
  { key: 'totalAssets',            label: 'Total Assets',              stroke: '#0d9488', strokeWidth: 2, dash: '5 3',   defaultVisible: false },
] as const;

interface Props {
  years: YearData[];
  negativeZoneColor?: string;
}

export default function OverviewLineChart({ years, negativeZoneColor = '#ef4444' }: Readonly<Props>) {
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LINE_CONFIG.map(({ key, defaultVisible }) => [key, defaultVisible]))
  );

  const toggle = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allVisible = LINE_CONFIG.every(({ key }) => visible[key] ?? true);
  const someVisible = LINE_CONFIG.some(({ key }) => visible[key] ?? true);
  const allCheckRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (allCheckRef.current) {
      allCheckRef.current.indeterminate = someVisible && !allVisible;
    }
  }, [allVisible, someVisible]);

  const toggleAll = (checked: boolean) => {
    setVisible(Object.fromEntries(LINE_CONFIG.map(({ key }) => [key, checked])));
  };

  const chartData = useMemo(() =>
    years.map((y) => ({
      ...y,
      totalAssets: y.cashOnHand + y.totalInvestmentBalance,
    })),
    [years]
  );

  return (
    <div className="chart-with-filters">
      <div className="chart-line-filters">
        <label className="chart-filter-checkbox chart-filter-all">
          <input
            ref={allCheckRef}
            type="checkbox"
            checked={allVisible}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <span>All</span>
        </label>
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
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="year" tickLine={false} />
          <YAxis tickFormatter={formatDollarsAxis} width={80} />
          <Tooltip
            formatter={(value, name) => [formatDollars(Number(value ?? 0)), String(name)]}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend />
          <ReferenceArea y1={Number.MIN_SAFE_INTEGER} y2={0} fill={negativeZoneColor} fillOpacity={0.06} ifOverflow="hidden" />
          {LINE_CONFIG.map(({ key, label, stroke, strokeWidth, dash }) =>
            visible[key] ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={stroke}
                strokeWidth={strokeWidth}
                dot={false}
                strokeDasharray={dash}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
