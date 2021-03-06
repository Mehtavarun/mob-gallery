import React, { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cartIcon from '../../assets/icons/cart.png';
import CartItem from './cartItem';
import { Link, useHistory } from 'react-router-dom';
import { editItem, setCartProperty, resetCart } from '../../Actions/cart';
import { request } from '../../Utils/Service';
import { isLoggedInUser } from '../../Utils/util';

function Cart() {
  const { items, currency } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [mobiles, setMobiles] = useState([]);
  const [price, setPrice] = useState(0);
  const [orderPlaced, toggleOrderPlaced] = useState(false);
  const history = useHistory();

  function updateItem(item) {
    dispatch(editItem(items, item));
    updatePrice(items);
  }

  async function getMobiles() {
    const mobileList = [];
    for (const item of items) {
      const res = await request('GET', `/mobiles/${item.id}`);
      const mobile = Object.assign(
        {},
        { ...res.body },
        { userQuantity: item.userQuantity || 1 }
      );
      mobileList.push(mobile);
    }
    setMobiles([...mobileList]);
    dispatch(setCartProperty('items', mobileList));
    updatePrice(mobileList);
  }

  useEffect(() => {
    (async function() {
      await getMobiles();
    })();
  }, []);

  function updatePrice(listItems) {
    let price = 0;
    listItems.forEach(element => {
      price += element.userQuantity * element.price;
    });
    setPrice(price);
    dispatch(setCartProperty('totalPrice', price));
  }

  function removeItem(id) {
    const updatedItemIndex = items.findIndex(item => item.id === id);
    const updatedItems = [...mobiles];
    updatedItems.splice(updatedItemIndex, 1);
    dispatch(setCartProperty('items', [...updatedItems]));
    setMobiles([...updatedItems]);
    updatePrice(updatedItems);
  }

  function handlePlaceOrder() {
    if (isLoggedInUser()) {
      toggleOrderPlaced(true);
      dispatch(resetCart());
    } else {
      history.push('/login?returnUrl=/cart');
    }
  }

  return (
    <div
      className="container text-monospace mt-5 border border-dark bg-light"
      style={{ width: '48rem', padding: '0rem' }}
    >
      {orderPlaced && <OrderSuccess />}
      <nav className="navbar navbar-dark bg-dark mb-3">
        <span className="navbar-brand mb-0 h1">
          <img className="mr-3" src={cartIcon} heigth="28" width="28" />
          Shipping Cart
        </span>
      </nav>
      {mobiles.length === 0 ? (
        <EmptyCart />
      ) : (
        mobiles.map((item, i) => {
          return (
            <Fragment key={i}>
              <CartItem
                item={item}
                updateItem={updateItem}
                removeItem={removeItem}
              />
              <hr />
            </Fragment>
          );
        })
      )}
      <nav className="navbar navbar-dark bg-dark mt-3">
        <h5 className="navbar-brand mr-auto ml-3 mb-0 mg-10">Total</h5>
        <h5 className="my-2 my-sm-0 mr-5 text-light">{currency + price}</h5>
        <button
          className="btn btn-warning my-2 my-sm-0"
          disabled={items.length === 0}
          onClick={() => handlePlaceOrder()}
        >
          Place Order
        </button>
      </nav>
    </div>
  );
}

const EmptyCart = () => {
  return (
    <Fragment>
      <h1 className="text-center text-dark"> Cart is empty!</h1>
      <Link to="/mobile-phones">
        <h6 className="text-center">Let's shop</h6>
      </Link>
    </Fragment>
  );
};

const OrderSuccess = () => {
  return (
    <div
      className="modal fade show d-block focusedModal"
      id="exampleModal"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-light">
          <div className="modal-header">
            <h5 className="modal-title" id="orderModal">
              <b>
                Successfully placed order with id:{' '}
                {Math.ceil(Math.random() * 1000000)}
              </b>
              <br />
            </h5>
          </div>
          <div className="body">
            <Link className="text-center" to="/mobile-phones">
              <br />
              <h5>Let's Shop more</h5>
              <br />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
