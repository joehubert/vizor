import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
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

interface Props {
  years: YearData[];
}

const INCOME_COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#4ade80'];
const EXPENSE_COLORS = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#f87171'];

interface ModelInfo {
  key: string;
  description: string;
  category: 'income' | 'expense';
}

export default function StackedBarChart({ years }: Props) {
  // Discover all unique model IDs across all years and categorize them
  const { models, chartData } = useMemo(() => {
    const incomeModels = new Map<string, string>();
    const expenseModels = new Map<string, string>();

    for (const y of years) {
      for (const item of y.incomes) {
        if (!incomeModels.has(item.modelId)) {
          incomeModels.set(item.modelId, item.description);
        }
      }
      for (const item of y.expenses) {
        if (!expenseModels.has(item.modelId)) {
          expenseModels.set(item.modelId, item.description);
        }
      }
    }

    const models: ModelInfo[] = [];
    for (const [id, desc] of incomeModels) {
      models.push({ key: `income_${id}`, description: desc, category: 'income' });
    }
    for (const [id, desc] of expenseModels) {
      models.push({ key: `expense_${id}`, description: desc, category: 'expense' });
    }

    const chartData = years.map((y) => {
      const row: Record<string, number> = {
        year: y.year,
        yearlyNet: y.yearlyNet,
        cumulativeNet: y.cumulativeNet,
        cashOnHand: y.cashOnHand,
      };

      for (const item of y.incomes) {
        row[`income_${item.modelId}`] = item.amount;
      }
      for (const item of y.expenses) {
        // Expenses rendered as negative bars
        row[`expense_${item.modelId}`] = -item.amount;
      }

      return row;
    });

    return { models, chartData };
  }, [years]);

  return (
    <ResponsiveContainer width="100%" height={450}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="year" tickLine={false} />
        <YAxis tickFormatter={formatDollarsAxis} width={80} />
        <Tooltip
          formatter={(value, name) => [formatDollars(Number(value ?? 0)), String(name)]}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Legend />

        {/* Income bars (positive, stacked) */}
        {models
          .filter((m) => m.category === 'income')
          .map((m, i) => (
            <Bar
              key={m.key}
              dataKey={m.key}
              name={m.description}
              stackId="stack"
              fill={INCOME_COLORS[i % INCOME_COLORS.length]}
            />
          ))}

        {/* Expense bars (negative, stacked) */}
        {models
          .filter((m) => m.category === 'expense')
          .map((m, i) => (
            <Bar
              key={m.key}
              dataKey={m.key}
              name={m.description}
              stackId="stack"
              fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]}
            />
          ))}

        {/* Overlay lines */}
        <Line
          type="monotone"
          dataKey="yearlyNet"
          name="Yearly Net"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="cumulativeNet"
          name="Cumulative Net"
          stroke="#1e3a5f"
          strokeWidth={3}
          dot={false}
          strokeDasharray="6 3"
        />
        <Line
          type="monotone"
          dataKey="cashOnHand"
          name="Cash on Hand"
          stroke="#d97706"
          strokeWidth={3}
          dot={false}
          strokeDasharray="8 4"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
