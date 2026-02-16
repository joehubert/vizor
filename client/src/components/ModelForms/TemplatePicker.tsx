import type { ModelType } from '../../types/models';
import './TemplatePicker.css';

interface Props {
  onSelect: (type: ModelType) => void;
  onClose: () => void;
}

const TEMPLATES: { type: ModelType; label: string; description: string }[] = [
  { type: 'salary', label: 'Salary / Income', description: 'Recurring income with annual raises' },
  { type: 'recurring_expense', label: 'Recurring Expense', description: 'Annual expense that repeats' },
  { type: 'onetime_expense', label: 'One-Time Expense', description: 'Single expense in one year' },
  { type: 'onetime_income', label: 'One-Time Income', description: 'Single income event' },
  { type: 'mortgage', label: 'Home Mortgage', description: 'Fixed-rate home loan' },
  { type: 'car_loan', label: 'Car Loan', description: 'Vehicle financing' },
  { type: 'retirement_account', label: 'Retirement / Investment', description: 'Account with contributions and growth' },
  { type: 'social_security', label: 'Social Security', description: 'Government retirement benefits' },
];

export default function TemplatePicker({ onSelect, onClose }: Props) {
  return (
    <div className="template-picker-overlay" onClick={onClose}>
      <div className="template-picker" onClick={(e) => e.stopPropagation()}>
        <div className="template-picker-header">
          <h3>Add Model</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="template-grid">
          {TEMPLATES.map((t) => (
            <button
              key={t.type}
              className="template-card"
              onClick={() => onSelect(t.type)}
            >
              <span className="template-label">{t.label}</span>
              <span className="template-desc">{t.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
