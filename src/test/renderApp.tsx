import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { ToastProvider } from '../components/Toast';
import type { AppState } from '../lib/types';
import { StoreProvider } from '../state/store';

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', state }: { route?: string; state?: AppState } = {},
) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <StoreProvider initialState={state}>
        <ToastProvider>{ui}</ToastProvider>
      </StoreProvider>
    </MemoryRouter>,
  );
}

export function renderApp(route: string, state?: AppState) {
  return renderWithProviders(<App />, { route, state });
}
