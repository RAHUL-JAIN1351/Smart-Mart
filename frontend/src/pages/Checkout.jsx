import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { orderApi } from '../services/api';
import useCart from '../hooks/useCart';
import { toast } from 'react-toastify';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { user } = useSelector(state => state.auth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');

  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const shipping = total > 99 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  // -------------------------
  // COD ORDER
  // -------------------------
  const handleCOD = async () => {
    try {
      setLoading(true);

      const res = await orderApi.create({
        items: items.map(i => ({
          product: i._id,
          name: i.name,
          image: i.image,
          price: i.price,
          qty: i.qty
        })),
        shippingAddress: address,
        paymentMethod: 'COD',
        itemsPrice: total,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: grandTotal
      });




      clear();
      toast.success("Order placed (Cash on Delivery)");
      navigate(`/orders/${res.data._id}`);

    } catch (err) {
      toast.error("Order failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // RAZORPAY PAYMENT
  // -------------------------
  const handleRazorpay = async () => {
    if (!validatePhone(address.phone)) {
      return toast.error("Enter valid 10-digit phone number");
    }

    try {
      setLoading(true);

      const { data } = await orderApi.createRazorpayOrder({
        amount: Math.round(grandTotal * 100)
      });

      const options = {
        key: "rzp_test_ScZzU9QtZoGdog",
        amount: data.amount,
        currency: "INR",
        name: "SmartMart+",
        description: "Order Payment",
        order_id: data.id,

        handler: async function (response) {
          try{
          const res = await orderApi.verifyPayment({
            ...response,
            orderData: {
                items: items.map(i => ({
                  product: i._id,
                  name: i.name,
                  image: i.image,
                  price: i.price,
                  qty: i.qty
                })),
                shippingAddress: address,
                paymentMethod: "RAZORPAY",
                itemsPrice: total,
                shippingPrice: shipping,
                taxPrice: tax,
                totalPrice: grandTotal
              }
          });

          clear();
          toast.success("Payment Successful 🎉");
          navigate(`/orders/${res.data.order._id}`);
        }
        catch (err) {
            console.error("VERIFY ERROR:", err);
            toast.error("Payment verification failed");
          }
        },

        prefill: {
          name: address.fullName,
          contact: address.phone
        },

        theme: {
          color: "#2563eb"
        }
      };

      const rzp = new window.Razorpay(options);

      // ❌ handle failure also
      rzp.on("payment.failed", function (response) {
        console.error("PAYMENT FAILED:", response.error);
        toast.error("Payment Failed ❌");
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // FINAL ACTION
  // -------------------------
  const handleFinal = async () => {
    if (paymentMethod === 'COD') return handleCOD();
    if (paymentMethod === 'RAZORPAY') return handleRazorpay();
    toast.error("Select payment method");
  };

  return (
    <div className="container checkout-layout">

      {/* LEFT SIDE */}
      <div className="checkout-main">

        {/* STEPS */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Shipping</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Review</div>
        </div>

        {/* STEP 1 */}
        {/* STEP 1 */}
{step === 1 && (
  <div className="checkout-section">
    <h2>Shipping Details</h2>

    <div className="form-grid">

      <div className="form-group">
        <label>Full Name</label>
        <input
          className="form-input"
          placeholder="Rahul Jain"
          value={address.fullName}
          onChange={e => setAddress({ ...address, fullName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Mobile Number</label>
        <input
          className="form-input"
          placeholder="10-digit mobile number"
          value={address.phone}
          onChange={e => setAddress({ ...address, phone: e.target.value })}
        />
      </div>

      <div className="form-group full">
        <label>Street Address</label>
        <input
          className="form-input"
          placeholder="House no, area, landmark"
          value={address.street}
          onChange={e => setAddress({ ...address, street: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>City</label>
        <select
          className="form-input"
          value={address.city}
          onChange={e => setAddress({ ...address, city: e.target.value })}
        >
          <option value="">Select City</option>
          <option>Bangalore</option>
          <option>Mysore</option>
          <option>Hubli</option>
        </select>
      </div>

      <div className="form-group">
        <label>State</label>
        <select
          className="form-input"
          value={address.state}
          onChange={e => setAddress({ ...address, state: e.target.value })}
        >
          <option value="">Select State</option>
          <option>Karnataka</option>
          <option>Tamil Nadu</option>
          <option>Maharashtra</option>
          <option>Delhi</option>
        </select>
      </div>

      <div className="form-group full">
        <label>Pincode</label>
        <input
          className="form-input"
          placeholder="6-digit pincode"
          value={address.zip}
          onChange={e => setAddress({ ...address, zip: e.target.value })}
        />
      </div>

    </div>

    <button
      className="btn btn-primary btn-lg"
      onClick={() => {
        if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
          return toast.error("Fill all fields");
        }
        if (!validatePhone(address.phone)) {
          return toast.error("Invalid phone number");
        }
        setStep(2);
      }}
    >
      Continue
    </button>
  </div>
)}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="checkout-section">
            <h2>Payment Method</h2>

            <label className="payment-option">
              <input
                type="radio"
                checked={paymentMethod === 'RAZORPAY'}
                onChange={() => setPaymentMethod('RAZORPAY')}
              />
              Razorpay (UPI / Card / NetBanking / GPay / PhonePe)
            </label>

            <label className="payment-option">
              <input
                type="radio"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              Cash on Delivery
            </label>

            <div className="checkout-nav">
              <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                Review
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="checkout-section">
            <h2>Review Order</h2>

            {items.map(i => (
              <div key={i._id} className="review-item">
                <img src={i.image} alt={i.name} />
                <span className="review-name">{i.name}</span>
                <span>{i.qty} × ${i.price}</span>
                <span>${(i.qty * i.price).toFixed(2)}</span>
              </div>
            ))}

            <div className="review-address">
              <strong>Ship to:</strong> {address.street}, {address.city}, {address.state} - {address.zip}
            </div>

            <div className="checkout-nav">
              <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>

              <button
                className="btn btn-accent btn-lg"
                disabled={loading}
                onClick={handleFinal}
              >
                {loading ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="checkout-summary">
        <h3>Order Summary</h3>

        {items.map(i => (
          <div key={i._id} className="summary-item">
            <span>{i.name} × {i.qty}</span>
            <span>${(i.price * i.qty).toFixed(2)}</span>
          </div>
        ))}

        <hr />

        <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span></div>
        <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>

        <div className="summary-row total">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>

        <div className="loyalty-note">
          Earn {Math.floor(grandTotal)} loyalty points
        </div>
      </div>
    </div>
  );
};

export default Checkout;
