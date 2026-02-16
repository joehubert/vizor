import { useMemo } from 'react';
import type { YearData } from '../../types/models';
import { formatDollars } from '../../utils/format';
import './DataTable.css';

interface Props {
  years: YearData[];
  scenarioName: string;
}

interface RowData {
  label: string;
  modelId: string | null; // null for summary rows
  category: 'income' | 'expense' | 'summary';
  values: Map<number, number>; // year -> amount
}

function buildRows(years: YearData[]): RowData[] {
  // Collect unique models from all years, preserving order of first appearance
  const incomeModels = new Map<string, string>(); // modelId -> description
  const expenseModels = new Map<string, string>();

  for (const yd of years) {
    for (const item of yd.incomes) {
      if (!incomeModels.has(item.modelId)) {
        incomeModels.set(item.modelId, item.description);
      }
    }
    for (const item of yd.expenses) {
      if (!expenseModels.has(item.modelId)) {
        expenseModels.set(item.modelId, item.description);
      }
    }
  }

  const rows: RowData[] = [];

  // Income model rows
  for (const [modelId, description] of incomeModels) {
    const values = new Map<number, number>();
    for (const yd of years) {
      const item = yd.incomes.find((i) => i.modelId === modelId);
      if (item) values.set(yd.year, item.amount);
    }
    rows.push({ label: description || '(untitled)', modelId, category: 'income', values });
  }

  // Expense model rows
  for (const [modelId, description] of expenseModels) {
    const values = new Map<number, number>();
    for (const yd of years) {
      const item = yd.expenses.find((e) => e.modelId === modelId);
      if (item) values.set(yd.year, item.amount);
    }
    rows.push({ label: description || '(untitled)', modelId, category: 'expense', values });
  }

  // Summary rows
  const summaryKeys: { label: string; key: keyof YearData }[] = [
    { label: 'Total Income', key: 'totalIncome' },
    { label: 'Total Expenses', key: 'totalExpenses' },
    { label: 'Yearly Net', key: 'yearlyNet' },
    { label: 'Cumulative Net', key: 'cumulativeNet' },
    { label: 'Total Wealth', key: 'totalWealth' },
  ];

  for (const { label, key } of summaryKeys) {
    const values = new Map<number, number>();
    for (const yd of years) {
      values.set(yd.year, yd[key] as number);
    }
    rows.push({ label, modelId: null, category: 'summary', values });
  }

  return rows;
}

function buildCSV(years: YearData[], rows: RowData[]): string {
  const yearNums = years.map((y) => y.year);
  const lines: string[] = [];

  // Header
  lines.push(['', ...yearNums].join(','));

  // Group headers + data rows
  let currentCategory = '';
  for (const row of rows) {
    if (row.category !== 'summary' && row.category !== currentCategory) {
      currentCategory = row.category;
      lines.push(currentCategory === 'income' ? 'Income' : 'Expenses');
    }
    if (row.category === 'summary' && currentCategory !== 'summary') {
      currentCategory = 'summary';
      lines.push('Summary');
    }

    const cells = yearNums.map((yr) => {
      const val = row.values.get(yr);
      return val !== undefined ? String(val) : '';
    });

    // Escape label if it contains commas or quotes
    const label = row.label.includes(',') || row.label.includes('"')
      ? `"${row.label.replace(/"/g, '""')}"`
      : row.label;

    lines.push([label, ...cells].join(','));
  }

  return lines.join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DataTable({ years, scenarioName }: Props) {
  const rows = useMemo(() => buildRows(years), [years]);
  const yearNums = years.map((y) => y.year);

  function handleExport() {
    const csv = buildCSV(years, rows);
    downloadCSV(csv, `${scenarioName}-data.csv`);
  }

  // Group rows for rendering with category headers
  let lastCategory = '';

  return (
    <div className="data-table-section">
      <div className="data-table-header">
        <h2>Data Table</h2>
        <button className="export-btn" onClick={handleExport}>Export CSV</button>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sticky-col">Model</th>
              {yearNums.map((yr) => (
                <th key={yr}>{yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const elements: React.ReactNode[] = [];

              // Insert category header row
              if (row.category !== 'summary' && row.category !== lastCategory) {
                lastCategory = row.category;
                elements.push(
                  <tr key={`cat-${row.category}`} className="category-row">
                    <td className="sticky-col" colSpan={yearNums.length + 1}>
                      {row.category === 'income' ? 'Income' : 'Expenses'}
                    </td>
                  </tr>
                );
              }
              if (row.category === 'summary' && lastCategory !== 'summary') {
                lastCategory = 'summary';
                elements.push(
                  <tr key="cat-summary" className="category-row summary-category">
                    <td className="sticky-col" colSpan={yearNums.length + 1}>
                      Summary
                    </td>
                  </tr>
                );
              }

              const isSummary = row.category === 'summary';

              elements.push(
                <tr key={row.modelId ?? row.label} className={isSummary ? 'summary-row' : ''}>
                  <td className={`sticky-col ${isSummary ? 'summary-label' : 'model-label'}`}>
                    {row.label}
                  </td>
                  {yearNums.map((yr) => {
                    const val = row.values.get(yr);
                    if (val === undefined) {
                      return <td key={yr} className="cell-empty">&mdash;</td>;
                    }
                    const isNeg = val < 0;
                    return (
                      <td key={yr} className={isNeg ? 'negative' : ''}>
                        {formatDollars(val)}
                      </td>
                    );
                  })}
                </tr>
              );

              return elements;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
