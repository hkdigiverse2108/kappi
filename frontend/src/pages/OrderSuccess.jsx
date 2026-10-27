import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { triggerOrderCelebration } from '../utils/confetti';
import { trackOrder, toCustomerOrder } from '../api/orderApi';

export const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const [order, setOrder] = useState(null);

  // Celebrate once per visit (React dev mode runs effects twice)
  const celebrated = useRef(false);
  useEffect(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    triggerOrderCelebration();
  }, []);

  // The placed order, from the backend
  useEffect(() => {
    if (!orderId) return;
    trackOrder(orderId)
      .then((o) => setOrder(toCustomerOrder(o)))
      .catch((err) => console.error('Failed to load order:', err));
  }, [orderId]);

  // Card pops in, then its rows appear one after another
  const card = {
    hidden: { opacity: 0, y: 24, scale: 0.94 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 260, damping: 22, staggerChildren: 0.1, delayChildren: 0.35 }
    }
  };
  const row = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Helmet>
        <title>Order Confirmed | KAPEE Enterprise</title>
      </Helmet>

      <motion.div
        variants={card}
        initial="hidden"
        animate="show"
        className="bg-white rounded-3xl border border-emerald-soft shadow-soft p-6 text-center space-y-5"
      >
        {/* Tick: circle pops, ring pulses out, check mark draws itself */}
        <div className="relative w-16 h-16 mx-auto">
          <motion.span
            className="absolute inset-0 rounded-full bg-emerald-soft"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
          />
          <motion.div
            className="relative w-16 h-16 rounded-full bg-emerald-soft flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.15 }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-deep" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.path
                d="M5 12.5l4.5 4.5L19 7.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.45, duration: 0.45, ease: 'easeOut' }}
              />
            </svg>
          </motion.div>
        </div>

        <motion.div variants={row} className="space-y-1.5">
          <h1 className="font-serif text-2xl font-extrabold text-ink">Order Placed!</h1>
          <p className="text-xs text-muted">Thank you for choosing KAPEE. We'll deliver your order in 3-4 business days.</p>
        </motion.div>

        <motion.div variants={row} className="rounded-2xl bg-ivory border border-emerald-soft divide-y divide-emerald-soft text-xs text-left">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-muted">Order ID</span>
            <span className="font-bold text-emerald-deep">{orderId}</span>
          </div>
          {order && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-muted">To Pay (Cash on Delivery)</span>
              <span className="text-sm font-extrabold text-ink">₹{order.total}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={row} className="grid grid-cols-2 gap-2.5">
          <Link to={`/track-order?orderId=${orderId}`} className="btn-primary text-xs py-3 text-center">
            Track Order
          </Link>
          <Link to="/shop" className="btn-secondary text-xs py-3 text-center">
            Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
