import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQty, clearCart, selectCartTotal, selectCartCount } from '../store/cartSlice';
import { toast } from 'react-toastify';

const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(state => state.cart.items);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  const add = (product, qty = 1) => {
    dispatch(addToCart({ product, qty }));
    toast.success(`${product.name} added to cart`);
  };

  const remove = (id) => dispatch(removeFromCart(id));
  const update = (id, qty) => dispatch(updateQty({ id, qty }));
  const clear = () => dispatch(clearCart());

  return { items, total, count, add, remove, update, clear };
};

export default useCart;
