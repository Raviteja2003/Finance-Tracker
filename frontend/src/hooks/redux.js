import { useDispatch, useSelector } from 'react-redux';

// Plain re-exports of react-redux's hooks. In the TypeScript version these
// carried generics for typed dispatch/state; without TypeScript there's
// nothing to type, but keep using these (not the bare hooks) everywhere,
// so the convention doesn't split between components.
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;