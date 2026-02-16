import type { Model, Defaults } from '../../types/models';
import SalaryForm from './SalaryForm';
import RecurringExpenseForm from './RecurringExpenseForm';
import OneTimeExpenseForm from './OneTimeExpenseForm';
import OneTimeIncomeForm from './OneTimeIncomeForm';
import MortgageForm from './MortgageForm';
import CarLoanForm from './CarLoanForm';
import RetirementAccountForm from './RetirementAccountForm';
import SocialSecurityForm from './SocialSecurityForm';
import './FormFields.css';

const TYPE_LABELS: Record<string, string> = {
  salary: 'Salary / Income',
  recurring_expense: 'Recurring Expense',
  onetime_expense: 'One-Time Expense',
  onetime_income: 'One-Time Income',
  mortgage: 'Home Mortgage',
  car_loan: 'Car Loan',
  retirement_account: 'Retirement / Investment',
  social_security: 'Social Security',
};

interface Props {
  model: Model;
  defaults: Defaults;
  scenarioEndYear: number;
  isNew: boolean;
  onSave: (model: Model) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function ModelFormPanel({ model, defaults, scenarioEndYear, isNew, onSave, onDelete, onCancel }: Props) {
  const title = isNew ? `New ${TYPE_LABELS[model.type]}` : `Edit ${TYPE_LABELS[model.type]}`;

  function renderForm() {
    switch (model.type) {
      case 'salary':
        return <SalaryForm model={model} defaults={defaults} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'recurring_expense':
        return <RecurringExpenseForm model={model} defaults={defaults} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'onetime_expense':
        return <OneTimeExpenseForm model={model} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'onetime_income':
        return <OneTimeIncomeForm model={model} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'mortgage':
        return <MortgageForm model={model} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'car_loan':
        return <CarLoanForm model={model} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'retirement_account':
        return <RetirementAccountForm model={model} defaults={defaults} scenarioEndYear={scenarioEndYear} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
      case 'social_security':
        return <SocialSecurityForm model={model} defaults={defaults} onSave={onSave} onDelete={isNew ? undefined : onDelete} onCancel={onCancel} />;
    }
  }

  return (
    <div className="model-form-panel">
      <div className="form-header">
        <h3>{title}</h3>
        <button className="form-close-btn" onClick={onCancel}>&times;</button>
      </div>
      {renderForm()}
    </div>
  );
}
