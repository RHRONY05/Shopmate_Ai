import React from 'react'
import { ShoppingBag, Sparkles, Bot, ShieldCheck } from 'lucide-react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { addItem, toggleCart } from './store/slices/cartSlice'

export const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((state) => state.cart.items)
  const isCartOpen = useAppSelector((state) => state.cart.isOpen)

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Example handler showing typed synthetic event & typed action dispatch
  const handleAddSampleKit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    dispatch(
      addItem({
        id: 'arsenal-2024-home',
        jerseyId: 'arsenal-2024',
        title: 'Arsenal 2024/25 Authentic Home Kit',
        clubName: 'Arsenal FC',
        size: 'L',
        price: 89.99,
        quantity: 1,
        customization: {
          playerName: 'Saka',
          playerNumber: 7,
          leagueBadge: true,
        },
      })
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-white">
                ShopMate <span className="text-emerald-400">AI</span>
              </span>
              <span className="ml-2 text-xs uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                KitRoom Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => dispatch(toggleCart())}
              className={`relative p-2.5 rounded-lg border transition-colors ${
                isCartOpen
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              aria-label="Toggle Cart Drawer"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-neutral-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-6">
          <ShieldCheck className="w-4 h-4" />
          React 19 + TypeScript 5 + Vite + Redux Toolkit Verified
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Next-Gen Football Kit Shopping with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Autonomous AI Stylist
          </span>
        </h1>

        <p className="mt-4 text-lg text-neutral-400 max-w-2xl leading-relaxed">
          Discover authentic club & retro kits, customized player printing, voice commands, and semantic AI discovery powered by pgvector.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleAddSampleKit}
            className="px-6 py-3 rounded-lg font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            Test Redux: Add Sample Kit
          </button>

          <button
            type="button"
            className="px-6 py-3 rounded-lg font-semibold text-neutral-300 border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-5 h-5 text-emerald-400" />
            KitBot AI Assistant (Phase 4)
          </button>
        </div>

        {/* Live Redux State Verification Badge */}
        <section className="mt-12 p-6 rounded-xl border border-neutral-800 bg-neutral-900/40 max-w-lg w-full text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
            <span>Redux State Inspector</span>
            <span className="text-emerald-400 font-mono text-xs">{cartItems.length} items in state</span>
          </h2>
          {cartItems.length === 0 ? (
            <p className="text-xs text-neutral-500 font-mono">Cart is empty. Click "Test Redux" above to dispatch a typed action.</p>
          ) : (
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-neutral-400 mt-0.5">
                    Size: <span className="text-emerald-400 font-bold">{item.size}</span> | Qty: {item.quantity} | ${item.price}
                  </div>
                  {item.customization?.playerName && (
                    <div className="text-emerald-400/80 mt-1 font-mono">
                      Print: {item.customization.playerName} #{item.customization.playerNumber}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        ShopMate AI &bull; Production Infrastructure &bull; React 19 + TypeScript
      </footer>
    </div>
  )
}

export default App
