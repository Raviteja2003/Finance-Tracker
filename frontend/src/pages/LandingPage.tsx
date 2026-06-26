import { Link } from 'react-router-dom';
import { Wallet, BarChart3, MessageCircle, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Multiple accounts, one view',
    body: 'Track checking, savings, credit cards, and cash side by side.',
  },
  {
    icon: BarChart3,
    title: 'Budgets that talk back',
    body: 'Set category budgets and see exactly where this month is heading.',
  },
  {
    icon: MessageCircle,
    title: 'Ask your money questions',
    body: 'A built-in assistant that can query your real transaction data.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-lg font-semibold">Finance Tracker</span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-muted hover:text-text"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Know where your money actually goes.
        </h1>
        <p className="mt-4 text-lg text-muted">
          One place for accounts, budgets, and spending — with a chatbot that
          can answer questions about your own data.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Create your account
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <Icon size={22} className="text-primary" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}