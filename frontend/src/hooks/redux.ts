import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

// Typed wrappers around react-redux's hooks — use these everywhere instead
// of the bare `useDispatch` / `useSelector` so thunk dispatch and state
// shape are inferred correctly without re-typing generics at every call site.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;