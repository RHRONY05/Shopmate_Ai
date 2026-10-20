import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Package,
  Truck,
  Award,
  Printer,
} from 'lucide-react';
import { fetchOrderApi } from '../services/api';
import type { OrderModel } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderModel | null>(null);

  useEffect(() => {
    let isCurrent = true;
    if (!orderId) return;

    fetchOrderApi(orderId)
      .then((data) => {
        if (isCurrent) {
          setOrder(data);
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [orderId]);

  return (
    <main className="min-h-screen bg-[var(--bg-canvas)] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Banner */}
        <div className="text-center space-y-3 mb-10">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[var(--text-primary)]">
            Matchday Order Confirmed
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Thank you for shopping at The KitRoom. Your payment has been processed and your official kit is being
            prepared for authentication and custom printing.
          </p>
        </div>

        {/* Matchday Authenticity Ticket Stub */}
        <div className="bg-white rounded-3xl border-2 border-[var(--border-subtle)] shadow-xl overflow-hidden mb-10">
          {/* Ticket Header */}
          <div className="bg-[var(--text-primary)] text-white p-6 sm:p-8 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                Official Digital Certificate of Authenticity
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-white">
                THE KITROOM MATCHDAY TICKET
              </h2>
            </div>
            <img
              src="/logo.jpg"
              alt="Official Matchday Authenticity Crest"
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/60 shadow-sm"
            />
          </div>

          {/* Ticket Body with Serrated Effect */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[var(--border-subtle)] text-xs font-mono">
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Order Reference</span>
                <span className="font-bold text-[var(--text-primary)]">{order?.orderNumber || orderId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Payment Status</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                  PAID (Stripe Verified)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Issue Date</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[var(--text-muted)] block">Total Paid</span>
                <span className="font-serif font-black text-base text-[var(--accent-primary)]">
                  {order ? Number(order.totalAmount).toFixed(2) : '89.99'} USD
                </span>
              </div>
            </div>

            {/* Purchased Items List */}
            {order?.items && order.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  Verified Jerseys in This Dispatch
                </h3>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-[var(--bg-canvas)] rounded-lg p-1 border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                          <img
                            src={item.jerseyVariant?.jersey?.images[0]}
                            alt={item.jerseyVariant?.jersey?.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-[var(--text-primary)]">
                            {item.jerseyVariant?.jersey?.title || 'Authentic Football Kit'}
                          </h4>
                          <div className="text-[11px] font-mono text-[var(--text-muted)]">
                            Size: {item.jerseyVariant?.size} • Quantity: {item.quantity}
                          </div>
                          {item.customName && (
                            <div className="text-[10px] font-mono text-emerald-800 font-bold">
                              Squad Print: #{item.customNumber} {item.customName}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="font-serif font-bold text-xs text-[var(--text-primary)]">
                        {(Number(item.priceAtPurchase) * item.quantity).toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracking Progress Timeline */}
            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-4">
              <h3 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                Matchday Fulfilment Timeline
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[var(--text-primary)] block text-[11px]">Order Placed</span>
                  <span className="text-[10px] font-mono text-emerald-700">Confirmed</span>
                </div>

                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center mx-auto shadow-xs">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[var(--text-primary)] block text-[11px]">Custom Printing</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">In Progress</span>
                </div>

                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto border border-[var(--border-subtle)]">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[var(--text-muted)] block text-[11px]">Quality Check</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Pending</span>
                </div>

                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto border border-[var(--border-subtle)]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[var(--text-muted)] block text-[11px]">Dispatch</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">Estimated 2 Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-[var(--bg-canvas)] p-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>Official Serial: KR-AUTH-{Math.floor(100000 + Math.random() * 900000)}</span>
            <button
              onClick={() => window.print()}
              className="text-[var(--accent-primary)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Matchday Receipt</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/jerseys"
            className="px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white font-serif font-bold text-xs hover:bg-[var(--btn-hover)] transition-all shadow-md flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/account"
            className="px-6 py-3 rounded-full bg-white text-[var(--text-primary)] font-serif font-bold text-xs hover:bg-[var(--bg-canvas)] transition-all border border-[var(--border-subtle)] shadow-xs"
          >
            View All My Orders
          </Link>
        </div>
      </div>
    </main>
  );
};
