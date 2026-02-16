import { useMemo } from 'react';
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
import type { CalculationOutput } from '../../types/models';
import { formatDollars, formatDollarsAxis } from '../../utils/format';
import OverviewLineChart from '../Charts/OverviewLineChart';

const SCENARIO_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];

interface Props {
  results: CalculationOutput[];
  onClose: () => void;
}

export default function ScenarioCompareView({ results, onClose }: Props) {
  // Build overlay chart data for both Cumulative Net and Cash on Hand comparisons
  const { overlayDataCumNet, overlayDataCashOnHand } = useMemo(() => {
    // Find the widest year range
    let minYear = Infinity;
    let maxYear = -Infinity;
    for (const result of results) {
      for (const yd of result.years) {
        if (yd.year < minYear) minYear = yd.year;
        if (yd.year > maxYear) maxYear = yd.year;
      }
    }

    const yearMapCumNet = new Map<number, Record<string, number | null>>();
    const yearMapCashOnHand = new Map<number, Record<string, number | null>>();
    for (let y = minYear; y <= maxYear; y++) {
      const rowCumNet: Record<string, number | null> = { year: y };
      const rowCashOnHand: Record<string, number | null> = { year: y };
      for (const result of results) {
        rowCumNet[result.scenarioName] = null;
        rowCashOnHand[result.scenarioName] = null;
      }
      yearMapCumNet.set(y, rowCumNet);
      yearMapCashOnHand.set(y, rowCashOnHand);
    }

    for (const result of results) {
      for (const yd of result.years) {
        const rowCumNet = yearMapCumNet.get(yd.year);
        if (rowCumNet) rowCumNet[result.scenarioName] = yd.cumulativeNet;
        const rowCashOnHand = yearMapCashOnHand.get(yd.year);
        if (rowCashOnHand) rowCashOnHand[result.scenarioName] = yd.cashOnHand;
      }
    }

    return {
      overlayDataCumNet: Array.from(yearMapCumNet.values()),
      overlayDataCashOnHand: Array.from(yearMapCashOnHand.values()),
    };
  }, [results]);

  return (
    <div className="compare-view">
      <div className="compare-header">
        <button className="sc-btn" onClick={onClose}>
          Back
        </button>
        <h2>Scenario Comparison</h2>
      </div>

      <div className="compare-charts">
        {results.map((result, i) => (
          <section key={result.scenarioName} className="chart-section">
            <h2 style={{ color: SCENARIO_COLORS[i] }}>{result.scenarioName}</h2>
            <OverviewLineChart years={result.years} />
          </section>
        ))}

        <section className="chart-section">
          <h2>Comparison: Cumulative Net</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={overlayDataCumNet} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tickLine={false} />
              <YAxis tickFormatter={formatDollarsAxis} width={80} />
              <Tooltip
                formatter={(value, name) => [formatDollars(Number(value ?? 0)), String(name)]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              {results.map((result, i) => (
                <Line
                  key={result.scenarioName}
                  type="monotone"
                  dataKey={result.scenarioName}
                  stroke={SCENARIO_COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="chart-section">
          <h2>Comparison: Cash on Hand</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={overlayDataCashOnHand} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="year" tickLine={false} />
              <YAxis tickFormatter={formatDollarsAxis} width={80} />
              <Tooltip
                formatter={(value, name) => [formatDollars(Number(value ?? 0)), String(name)]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              {results.map((result, i) => (
                <Line
                  key={result.scenarioName}
                  type="monotone"
                  dataKey={result.scenarioName}
                  stroke={SCENARIO_COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
