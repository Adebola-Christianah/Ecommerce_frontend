import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../actions/cartActions';
import ConfirmationModal from '../components/ConfirmationModal';
import EmptyImage from '../images/empty_cart-removebg-preview.png';
import Header from '../components/Header';
import Footer from '../components/Footer';

function CartScreen({ history }) {
    const dispatch = useDispatch();
    const { cartItems } = useSelector((state) => state.cart);

    const [quantityErrors, setQuantityErrors] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showModal, setShowModal] = useState(null); // Store ID of the item to delete

    const showDeleteModal = (id) => {
        setShowModal(id);
    };

    const closeModal = () => {
        setShowModal(null);
    };

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id));
        closeModal(); // Close modal after deletion
    };

    const checkoutHandler = () => {
        history.push('/login?redirect=shipping');
    };

    const handleQuantityChange = (productId, newQty, countInStock) => {
        if (newQty > countInStock) {
            setQuantityErrors({
                ...quantityErrors,
                [productId]: `Maximum quantity available is ${countInStock}`,
            });
        } else {
            setQuantityErrors({
                ...quantityErrors,
                [productId]: '',
            });
            dispatch(addToCart(productId, Number(newQty)));
        }
    };

    const applyCouponHandler = () => {
        if (couponCode === 'SAVE10') {
            setDiscount(10); // Apply a 10% discount
        } else {
            setDiscount(0); // No discount
        }
    };

    // Get the product name for the modal
    const productToDelete =
        showModal !== null ? cartItems.find((item) => item.product === showModal) : null;

    return (
        <div className="">
            <div className="flex flex-col md:flex-row">
                <div className="w-full">
                    {cartItems.length === 0 ? (
                        <div className="bg-white w-full h-screen flex items-center justify-center">
                            <div className="text-center bg-white rounded-lg">
                                <div className="flex justify-center">
                                    <img
                                        src={EmptyImage} // Replace with the actual path to the image
                                        alt="No results found"
                                        className="w-[28rem] h-auto object-contain "
                                    />
                                </div>
                                <h1 className="text-lg md:text-3xl font-bold text-red-600 ">
                                    Your cart is empty
                                </h1>
                                <p className="text-gray-600 mb-6">Looks like you have not made your choice yet</p>
                                <Link
                                    to="/"
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg shadow hover:bg-red-700 transition"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Header />
                            <div className="bg-white w-[95%] mx-auto py-6 mt-4">
                                {/* Cart Items Representation as Cards for Mobile */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cartItems.map((item) => (
                                        <div key={item.product} className="flex flex-col bg-white shadow-md rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-24 w-24 object-cover rounded-lg"
                                                />
                                                <div>
                                                    <h2 className="text-lg font-semibold">{item.name}</h2>
                                                    <p className="text-sm text-gray-600">₦{item.price}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-4">
                                                <select
                                                    className="form-select block p-2 border-gray-400 rounded-md"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleQuantityChange(item.product, Number(e.target.value), item.countInStock)
                                                    }
                                                >
                                                    {[...Array(item.countInStock).keys()].map((x) => (
                                                        <option key={x + 1} value={x + 1}>
                                                            {x + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                                {quantityErrors[item.product] && (
                                                    <p className="text-red-500 text-sm">{quantityErrors[item.product]}</p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <button
                                                    type="button"
                                                    className="text-red-500 focus:outline-none"
                                                    onClick={() => showDeleteModal(item.product)}
                                                >
                                                    <i className="fas fa-trash"></i> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cart Total */}
                                <div className="mt-6 md:flex md:justify-between">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            className="border p-2 rounded mr-2 h-12"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded h-12"
                                            onClick={applyCouponHandler}
                                        >
                                            Apply Coupon
                                        </button>
                                    </div>

                                    <div className="mt-4 md:mt-0 md:w-1/3 bg-gray-100 rounded-lg p-4">
                                        <h2 className="text-xl mb-4">Cart Summary</h2>
                                        <div className="flex justify-between mb-2">
                                            <span>Subtotal:</span>
                                            <span>{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Shipping:</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span>Tax:</span>
                                            <span>₦0.00</span>
                                        </div>
                                        <div className="flex justify-between mb-4 font-semibold">
                                            <span>Total:</span>
                                            <span>
                                                ₦{(
                                                    cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) *
                                                    (1 - discount / 100)
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-red-500 text-white w-full py-2 rounded"
                                            disabled={cartItems.length === 0}
                                            onClick={checkoutHandler}
                                        >
                                            Proceed to Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Footer />
                        </>
                    )}

                    {/* Modal for confirming deletion */}
                    {showModal !== null && productToDelete && (
                        <ConfirmationModal
                            message="Confirm Deletion"
                            subMessage={`Are you sure you want to delete <strong>${productToDelete.name}</strong>?`}
                            onAction={() => removeFromCartHandler(productToDelete.product)}
                            onCancel={() => setShowModal(null)}
                            actionText="Delete"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default CartScreen;
