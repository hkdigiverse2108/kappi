import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { trackOrder, toCustomerOrder } from '../api/orderApi';
import { istShortDateTime } from '../utils/istTime';

// Each stage lists the order statuses that mean the parcel has reached it
const trackingStages = [
  { id: 'ordered', label: 'Ordered', desc: 'Order received', statuses: ['Pending', 'Confirmed'] },
  { id: 'packed', label: 'Packed', desc: 'Quality checked & packed', statuses: ['Packed'] },
  { id: 'shipped', label: 'Shipped', desc: 'Handed over to the courier', statuses: ['Shipped'] },
  { id: 'out', label: 'Out for Delivery', desc: 'Assigned to delivery courier', statuses: ['Out for delivery'] },
  { id: 'delivered', label: 'Delivered', desc: 'Delivered to your doorstep', statuses: ['Delivered'] }
];

const formatStageDate = istShortDateTime;

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderQuery, setOrderQuery] = useState(initialOrderId);
  const [activeOrder, setActiveOrder] = useState(initialOrderId.trim().toUpperCase());
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderQuery.trim()) {
      setActiveOrder(orderQuery.trim().toUpperCase());
    }
  };

  // Order status from the backend
  useEffect(() => {
    if (!activeOrder) return;
    setLoading(true);
    setError('');
    trackOrder(activeOrder)
      .then((o) => setOrderDetails(toCustomerOrder(o)))
      .catch((err) => {
        setOrderDetails(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [activeOrder]);

  const isStopped = ['Cancelled', 'RTO/Returned'].includes(orderDetails?.status);
  const currentStageIndex = orderDetails
    ? trackingStages.findIndex((st) => st.statuses.includes(orderDetails.status))
    : -1;
  // When each stage was reached (latest change into one of its statuses)
  const stageDate = (stage) => {
    const entry = [...(orderDetails?.statusHistory || [])].reverse().find((h) => stage.statuses.includes(h.status));
    return entry ? formatStageDate(entry.at) : '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <Helmet>
        <title>Track Your Order | KAPEE Enterprise</title>
      </Helmet>

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald">
          Real-Time Shipment Updates
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-ink">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
          Enter your KAPEE order ID to see the current package status.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <Package className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="e.g. KAP-123456"
            className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm rounded-xl border border-emerald-soft focus:border-emerald uppercase outline-none bg-white"
          />
        </div>
        <button
          type="submit"
          className="btn-primary text-xs sm:text-sm font-bold px-6 py-3"
        >
          Track
        </button>
      </form>

      {loading && <p className="text-center text-xs text-muted">Finding your order...</p>}
      {!loading && error && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-error font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Card */}
      {!loading && orderDetails && (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-soft shadow-soft space-y-8">
        {/* Top Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-soft">
          <div>
            <span className="text-[11px] text-muted uppercase font-bold tracking-wider">Tracking Order</span>
            <p className="font-serif text-2xl font-bold text-emerald-deep">{orderDetails.id}</p>
            <p className="text-xs text-muted mt-0.5">
              {orderDetails.carrier
                ? `Carrier: ${orderDetails.carrier}${orderDetails.trackingNumber ? ` • AWB: ${orderDetails.trackingNumber}` : ''}`
                : `Placed on ${orderDetails.date}`}
            </p>
          </div>
          <div className="bg-emerald-soft px-4 py-2.5 rounded-2xl text-left sm:text-right">
            <span className="text-[11px] text-emerald-deep font-bold">Current Status</span>
            <p className="text-xs sm:text-sm font-bold text-ink">{orderDetails.status}</p>
          </div>
        </div>

        {/* Animated Timeline */}
        <div className="space-y-6">
          <h3 className="font-serif text-lg font-bold text-ink">Package Progress</h3>

          {isStopped && (
            <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-error">
              This order was {orderDetails.status === 'Cancelled' ? 'cancelled' : 'returned'}. Please contact us if you have any questions.
            </p>
          )}

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-soft">
            {trackingStages.map((stage, idx) => {
              const isPast = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.id} className="relative flex items-start justify-between gap-4">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? 'bg-emerald text-white shadow-xs'
                        : 'bg-white border-2 border-emerald-soft text-muted'
                    } ${isCurrent ? 'ring-4 ring-emerald-soft animate-pulse' : ''}`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  {/* Stage text */}
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isPast ? 'text-ink' : 'text-muted'}`}>
                      {stage.label}
                    </h4>
                    <p className="text-xs text-muted mt-0.5">{stage.desc}</p>
                  </div>

                  {/* Timestamp */}
                  <span className={`text-[11px] font-semibold shrink-0 ${isCurrent ? 'text-emerald-deep font-bold' : 'text-muted'}`}>
                    {isPast ? stageDate(stage) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Included Items Snapshot */}
        {orderDetails.items && (
          <div className="pt-6 border-t border-emerald-soft space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Items In Package</h4>
            <div className="space-y-2">
              {orderDetails.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-2xl bg-ivory border border-emerald-soft/60">
                  <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{it.title}</p>
                    <p className="text-[11px] text-muted">Quantity: {it.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-deep">₹{it.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default TrackOrder;
