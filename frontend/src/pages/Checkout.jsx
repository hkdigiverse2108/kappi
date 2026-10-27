import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Truck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Logo } from '../components/common/Logo';
import { useCartStore } from '../store/useCartStore';
import { useUserStore } from '../store/useUserStore';
import { placeOrder } from '../api/orderApi';

export const Checkout = () => {
  const navigate = useNavigate();
  const {
    items,
    getSubtotal,
    getSavings,
    getShippingFee,
    getGiftWrapFee,
    getCouponDiscount,
    getExtraTierDiscount,
    getFinalTotal,
    coupon,
    giftWrap,
    orderNote,
    clearCart
  } = useCartStore();

  const { user, isLoggedIn, loadMyOrders, addAddress } = useUserStore();

  // Steps: 1: Shipping Address, 2: Payment
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepError, setStepError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Form Fields
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  // Prefilled from the logged-in customer's name and default address (empty for guests)
  const savedAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '');
  const [addressLine, setAddressLine] = useState(savedAddress?.addressLine1 || '');
  const [pincode, setPincode] = useState(savedAddress?.pincode || '');
  const [city, setCity] = useState(savedAddress?.city || '');
  const [state, setState] = useState(savedAddress?.state || '');
  // Signed-in customers can keep this address in My Account > Addresses (ticked when they have none yet)
  const [saveAddress, setSaveAddress] = useState(!user?.addresses?.length);

  // Payment Option
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Auto-fill city and state from pincode
  const handlePincodeChange = (val) => {
    setPincode(val);
    if (val.length === 6) {
      if (val.startsWith('56')) {
        setCity('Bengaluru');
        setState('Karnataka');
      } else if (val.startsWith('40') || val.startsWith('41')) {
        setCity('Mumbai');
        setState('Maharashtra');
      } else if (val.startsWith('11')) {
        setCity('New Delhi');
        setState('Delhi');
      } else if (val.startsWith('50')) {
        setCity('Hyderabad');
        setState('Telangana');
      } else if (val.startsWith('60')) {
        setCity('Chennai');
        setState('Tamil Nadu');
      } else if (val.startsWith('70')) {
        setCity('Kolkata');
        setState('West Bengal');
      }
    }
  };

  const subtotal = getSubtotal();
  const savings = getSavings();
  const shippingFee = getShippingFee();
  const giftWrapFee = getGiftWrapFee();
  const couponDiscount = getCouponDiscount();
  const extraTierDiscount = getExtraTierDiscount();
  const finalTotal = getFinalTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 className="font-serif text-2xl font-bold">No items in your cart</h2>
        <Link to="/shop" className="btn-primary inline-flex text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Step 1 is not a <form>, so its required fields are checked here before moving to payment
  const handleContinueToPayment = () => {
    const missing = [email, phone, firstName, lastName, addressLine, pincode, city, state].some((v) => !String(v).trim());
    if (missing) return setStepError('Please fill in all the required (*) fields.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setStepError('Please enter a valid email address.');
    if (phone.replace(/\D/g, '').length < 10) return setStepError('Please enter a valid 10-digit mobile number.');
    if (!/^\d{6}$/.test(pincode.trim())) return setStepError('Please enter a valid 6-digit pincode.');
    setStepError('');
    setCurrentStep(2);
  };

  // Is the address typed here already one of the customer's saved addresses?
  const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  const alreadySaved = (user?.addresses || []).some(
    (a) => sameText(a.addressLine1, addressLine) && sameText(a.pincode, pincode) && sameText(a.city, city)
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setOrderError('');

    try {
      // The backend works out prices and the total again from the products and the coupon
      const order = await placeOrder({
        customer: { name: `${firstName} ${lastName}`.trim(), phone: phone.trim(), email: email.trim() },
        shippingAddress: { line1: addressLine, city, state, pincode: pincode.trim(), country: 'India' },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
          isFreeGift: !!i.isFreeGift
        })),
        paymentMethod,
        couponCode: coupon?.code || null,
        giftWrap,
        notes: orderNote || ''
      });

      // A problem saving the address must not stop the order, which is already placed
      if (isLoggedIn && saveAddress && !alreadySaved) {
        try {
          await addAddress({
            name: `${firstName} ${lastName}`.trim(),
            type: 'Home',
            phone: phone.trim(),
            addressLine1: addressLine.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            isDefault: !user?.addresses?.length
          });
        } catch (err) {
          console.error('Could not save the address:', err);
        }
      }

      clearCart();
      loadMyOrders();
      navigate(`/order-success?orderId=${order.orderNumber}`);
    } catch (err) {
      setOrderError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Helmet>
        <title>Secure Checkout | KAPEE Enterprise</title>
      </Helmet>

      {/* Checkout Minimal Header */}
      <header className="bg-white border-b border-emerald-soft py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo className="h-9 w-auto" />
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-deep">
            <Lock className="w-4 h-4 text-success" />
            <span>256-bit Bank Grade Encryption</span>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden bg-white border-b border-emerald-soft px-4 py-3">
        <button
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full flex items-center justify-between text-xs font-bold text-ink"
        >
          <span className="flex items-center gap-1.5 text-emerald">
            <ShoppingBag className="w-4 h-4" />
            {showMobileSummary ? 'Hide order summary' : 'Show order summary'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobileSummary ? 'rotate-180' : ''}`} />
          </span>
          <span className="text-sm font-extrabold text-emerald-deep">₹{finalTotal}</span>
        </button>

        {showMobileSummary && (
          <div className="pt-4 space-y-3 text-xs border-t border-emerald-soft mt-3">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between items-center gap-2">
                <span className="text-ink line-clamp-1">{i.title} (x{i.quantity})</span>
                <span className="font-bold text-emerald-deep">₹{i.price * i.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================
              LEFT COLUMN: STEP-BY-STEP CHECKOUT FORM
             ======================================================== */}
          <div className="lg:col-span-7 space-y-8">
            {/* Steps Indicator */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className={`px-2.5 py-1 rounded-lg ${currentStep >= 1 ? 'bg-emerald text-white' : 'bg-muted/20 text-muted'}`}>
                1. Shipping Address
              </span>
              <ChevronRight className="w-4 h-4 text-muted" />
              <span className={`px-2.5 py-1 rounded-lg ${currentStep >= 2 ? 'bg-emerald text-white' : 'bg-muted/20 text-muted'}`}>
                2. Payment Method
              </span>
            </div>

            {/* Step 1: Contact & Shipping Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-soft shadow-soft space-y-6">
                <div>
                  <h2 className="font-serif text-xl font-bold text-ink">Contact Information</h2>
                  <p className="text-xs text-muted">We will send tracking updates to your phone and email.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-ink mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-ink mb-1">Mobile Number (for delivery OTP) *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-soft">
                  <h2 className="font-serif text-xl font-bold text-ink mb-3">Shipping Address</h2>
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-ink mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-ink mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">Flat, House No., Building, Street *</label>
                      <input
                        type="text"
                        required
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="e.g. 402, Green Glen Layout, Bellandur"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-ink mb-1">Pincode *</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={pincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          placeholder="6-digit PIN"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-ink mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-ink mb-1">State *</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-soft focus:border-emerald outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save to profile (signed-in customers only) */}
                {isLoggedIn && !alreadySaved && (
                  <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-ivory border border-emerald-soft cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald focus:ring-emerald"
                    />
                    <span>
                      <span className="block text-xs font-bold text-ink">Save this address to my profile</span>
                      <span className="block text-[11px] text-muted">Use it again next time from My Account &gt; Addresses.</span>
                    </span>
                  </label>
                )}

                {stepError && <p className="text-xs font-semibold text-error">{stepError}</p>}

                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className="btn-primary w-full text-xs sm:text-sm font-bold py-3.5"
                >
                  Continue to Payment Options →
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <form onSubmit={handlePlaceOrder} className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-soft shadow-soft space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-soft">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-ink">Payment Method</h2>
                    <p className="text-xs text-muted">All transactions are secure and encrypted.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Edit Address
                  </button>
                </div>

                {/* Delivery Address Snapshot */}
                <div className="p-3.5 rounded-2xl bg-ivory border border-emerald-soft text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-ink">Delivering to: {firstName} {lastName}</p>
                    <p className="text-muted">{addressLine}, {city}, {state} - {pincode}</p>
                  </div>
                  <span className="text-success font-bold">Standard Delivery</span>
                </div>

                {/* Payment Options Selection */}
                <div className="space-y-3">
                  {/* Only Cash on Delivery for now: UPI / Card come back once a payment gateway is connected */}
                  {/* Cash on Delivery (COD) */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-emerald bg-emerald-soft/30' : 'border-emerald-soft'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Banknote className="w-5 h-5 text-emerald" />
                        <div>
                          <p className="text-xs font-bold text-ink">Cash On Delivery (COD)</p>
                          <p className="text-[11px] text-muted">Pay at doorstep with cash or delivery QR</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-emerald"
                      />
                    </div>
                  </div>
                </div>

                {orderError && (
                  <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-error">{orderError}</p>
                )}

                {/* Complete Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-gold w-full text-sm font-bold py-4 tracking-wider uppercase shadow-gold flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                      Securing Your Order...
                    </span>
                  ) : (
                    `Place Order • ₹${finalTotal}`
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ========================================================
              RIGHT COLUMN: ORDER SUMMARY SIDEBAR
             ======================================================== */}
          <div className="hidden lg:block lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 border border-emerald-soft shadow-soft space-y-4">
              <h3 className="font-serif font-bold text-base text-ink pb-3 border-b border-emerald-soft">
                Order Items ({items.length})
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={it.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-emerald-soft shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-ink truncate">{it.title}</p>
                        <p className="text-[11px] text-muted">{it.variantName} (Qty: {it.quantity})</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-deep shrink-0">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-muted pt-3 border-t border-emerald-soft">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-ink">₹{subtotal}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-success font-semibold">
                    <span>Savings & Discounts</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                {coupon && (
                  <div className="flex justify-between text-success font-semibold">
                    <span>Coupon ({coupon.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                {giftWrapFee > 0 && (
                  <div className="flex justify-between">
                    <span>Gift Packaging</span>
                    <span>+₹{giftWrapFee}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-success">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-ink pt-2 border-t border-emerald-soft">
                  <span>Total Amount</span>
                  <span className="text-xl font-extrabold text-emerald-deep">₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
