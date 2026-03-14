import React, { useState } from 'react';

const initialProducts = [
  { id: 1, name: 'Produkt 1', price: 1.500, stock: 5 },
  { id: 2, name: 'Produkt 2', price: 3.00, stock: 3 },
  { id: 3, name: 'Produkt 3', price: 10.00, stock: 2 },
];

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [purchaseMessage, setPurchaseMessage] = useState('');

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);

    if (!product || product.stock <= 0) {
      return;
    }

    setCart((prevCart) => [...prevCart, product]);
    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === productId ? { ...item, stock: item.stock - 1 } : item,
      ),
    );
    setPurchaseMessage('');
  };

  const removeFromCart = (cartIndex) => {
    const productToRemove = cart[cartIndex];
    if (!productToRemove) {
      return;
    }

    setCart((prevCart) => prevCart.filter((_, index) => index !== cartIndex));
    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === productToRemove.id ? { ...item, stock: item.stock + 1 } : item,
      ),
    );
    setPurchaseMessage('');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, product) => total + product.price, 0).toFixed(2);
  };

  const handlePurchase = () => {
    if (cart.length === 0) {
      setPurchaseMessage('Ihr Warenkorb ist leer. Bitte fuegen Sie Produkte hinzu.');
      return;
    }

    setCart([]);
    setPurchaseMessage('Kauf erfolgreich! Vielen Dank fuer Ihre Bestellung.');
  };

  return (
    <div className="App">
      <h1>Webshop</h1>

      <h2>Produkte</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price} ({product.stock} auf Lager)
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              disabled={product.stock <= 0}
            >
              In den Warenkorb
            </button>
          </li>
        ))}
      </ul>

      <h2>Warenkorb</h2>
      <ul>
        {cart.map((product, index) => (
          <li key={`${product.id}-${index}`}>
            {product.name} - ${product.price}
            <button type="button" onClick={() => removeFromCart(index)}>
              Entfernen
            </button>
          </li>
        ))}
      </ul>

      {cart.length > 0 && (
        <>
          <h3>Gesamtsumme: ${getTotalPrice()}</h3>
          <button type="button" onClick={handlePurchase}>Jetzt kaufen</button>
        </>
      )}

      {purchaseMessage && <p>{purchaseMessage}</p>}
    </div>
  );
}

export default App;
