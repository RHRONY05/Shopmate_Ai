import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { Header } from './Header';

// Mock Clerk React
vi.mock('@clerk/clerk-react', () => ({
  SignedIn: () => null,
  SignedOut: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  UserButton: () => <div>UserButton</div>,
}));

describe('Header Component', () => {
  it('renders brand name and navigation elements', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/THE KITROOM/i)).toBeInTheDocument();
    expect(screen.getByText(/ShopMate AI Football Curator/i)).toBeInTheDocument();
    expect(screen.getByText(/All Jerseys/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask KitBot/i)).toBeInTheDocument();
  });

  it('renders search input with placeholder', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/Search club, player, year/i)).toBeInTheDocument();
  });
});
