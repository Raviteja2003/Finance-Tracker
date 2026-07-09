import { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  openCreateModal,
  openEditModal,
  closeModal,
  selectCategoriesList,
  selectCategoriesStatus,
  selectCategoriesError,
  selectIsCategoryModalOpen,
  selectEditingCategory,
} from '../store/slices/categoriesSlice';

const TYPE_META = {
  income: { label: 'Income', icon: ArrowUpCircle },
  expense: { label: 'Expense', icon: ArrowDownCircle },
};

const TYPE_ORDER = ['expense', 'income'];

// A small curated palette rather than a raw color-picker — keeps category
// chips visually consistent instead of every color under the sun. Users
// can still type a custom hex if they want something else.
const COLOR_PRESETS = [
  '#e0455c', // red
  '#f0954a', // orange
  '#e0b23e', // amber
  '#16a394', // teal
  '#1fb8cc', // cyan
  '#4a7de0', // blue
  '#6d4aff', // violet
  '#c04adf', // magenta
  '#8a8f98', // neutral gray
];

export default function Categories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategoriesList);
  const status = useAppSelector(selectCategoriesStatus);
  const error = useAppSelector(selectCategoriesError);
  const isModalOpen = useAppSelector(selectIsCategoryModalOpen);
  const editingCategory = useAppSelector(selectEditingCategory);

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  async function handleConfirmDelete(categoryId) {
    setDeleteError(null);
    try {
      await dispatch(deleteCategory(categoryId)).unwrap();
    } catch (err) {
      // Backend returns 409 with a clear message when transactions or
      // budgets still reference this category - surface it directly.
      setDeleteError(typeof err === 'string' ? err : 'Failed to delete category.');
    } finally {
      setConfirmingDeleteId(null);
    }
  }

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    items: categories.filter((c) => c.type === type),
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text">Categories</h1>
          <p className="mt-1.5 text-sm text-muted">
            {categories.length === 0
              ? 'No categories yet'
              : `${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        <button
          onClick={() => dispatch(openCreateModal())}
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Add category
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{error}</span>
          <button
            onClick={() => dispatch(fetchCategories())}
            className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {deleteError && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="shrink-0 font-medium underline underline-offset-2 hover:no-underline">
            Dismiss
          </button>
        </div>
      )}

      {status === 'loading' && categories.length === 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-md border border-border bg-surface" />
          ))}
        </div>
      )}

      {status !== 'loading' && categories.length === 0 && !error && (
        <div className="mt-6 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-display text-lg text-text">Add your first category</p>
          <p className="mt-1 text-sm text-muted">
            Categories tag your transactions and power budgets and analytics — e.g. Groceries, Rent, Salary.
          </p>
          <button
            onClick={() => dispatch(openCreateModal())}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Add category
          </button>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-6 space-y-8">
          {grouped.map(({ type, items }) => {
            if (items.length === 0) return null;
            const meta = TYPE_META[type];
            const Icon = meta.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-muted" />
                  <span className="ledger-eyebrow text-[0.65rem]">{meta.label}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((category) => {
                    const isConfirming = confirmingDeleteId === category.id;
                    return (
                      <div
                        key={category.id}
                        className="ledger-rule-top group relative flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color ?? '#8a8f98' }}
                          aria-hidden="true"
                        />
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-text">{category.name}</p>

                        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          {isConfirming ? (
                            <>
                              <button
                                onClick={() => handleConfirmDelete(category.id)}
                                className="rounded px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmingDeleteId(null)}
                                className="rounded px-2 py-1 text-xs font-medium text-muted hover:bg-text/5"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => dispatch(openEditModal(category.id))}
                                aria-label={`Edit ${category.name}`}
                                className="rounded p-1.5 text-muted hover:bg-text/5 hover:text-text"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                onClick={() => setConfirmingDeleteId(category.id)}
                                aria-label={`Delete ${category.name}`}
                                className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                              >
                                <TrashIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <CategoryModal
          key={editingCategory?.id ?? 'create'}
          initial={editingCategory ?? null}
          onClose={() => dispatch(closeModal())}
        />
      )}
    </div>
  );
}

function CategoryModal({ initial, onClose }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState(initial?.type ?? 'expense');
  const [color, setColor] = useState(initial?.color ?? COLOR_PRESETS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const isEditing = initial !== null;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Name is required.');
      return;
    }

    const payload = { name: trimmedName, type, color: color || null };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dispatch(updateCategory({ id: initial.id, ...payload })).unwrap();
      } else {
        await dispatch(createCategory(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setFormError(typeof err === 'string' ? err : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="ledger-rule-top w-full max-w-sm rounded-lg border border-border bg-bg p-6 shadow-xl"
      >
        <h2 className="font-display text-xl font-semibold text-text">
          {isEditing ? 'Edit category' : 'Add category'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-text/80">
              Name
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              autoFocus
              className="mt-1 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80">Type</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {TYPE_ORDER.map((t) => {
                const meta = TYPE_META[t];
                const Icon = meta.icon;
                const isActive = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted hover:bg-text/5'
                    }`}
                  >
                    <Icon size={16} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80">Color</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  aria-label={`Choose color ${preset}`}
                  className="h-7 w-7 rounded-full ring-offset-2 ring-offset-bg transition"
                  style={{
                    backgroundColor: preset,
                    boxShadow: color === preset ? `0 0 0 2px ${preset}` : 'none',
                    outline: color === preset ? '2px solid currentColor' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Custom color"
                className="h-7 w-7 cursor-pointer rounded-full border border-border bg-transparent p-0"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-text/70 hover:bg-text/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}