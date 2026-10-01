import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react';
import { products } from '../data';
import { buildCatalogue, summariseBag, type BagSummary, type Catalogue } from '../lib/cashback';
import type { AppState } from '../lib/types';
import { loadState, saveState } from './persistence';
import { reducer, type Action } from './reducer';

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  catalogue: Catalogue;
  bag: BagSummary;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: AppState;
}) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => init ?? loadState());

  // Debounced save, plus a final save when the page is hidden or closed.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
    const timer = window.setTimeout(() => saveState(state), 300);
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    const flush = () => saveState(latest.current);
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  // Derived, never stored (SPEC.md section 3). The shop only uses the saved model.
  const catalogue = useMemo(
    () => buildCatalogue(products, state.model, state.overrides),
    [state.model, state.overrides],
  );
  const bag = useMemo(() => summariseBag(state.bag, catalogue), [state.bag, catalogue]);

  const value = useMemo(() => ({ state, dispatch, catalogue, bag }), [state, catalogue, bag]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used inside StoreProvider');
  return value;
}
