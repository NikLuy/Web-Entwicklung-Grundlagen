<template>
    <h1>Web Shop</h1>
    <div id="app">
        <ProductList :products="products" @add-to-cart2="addToCart" />
        <Cart :cart="cart" @remove-from-cart="removeFromCart" />
    </div>
</template>

<script>
    import ProductList from './components/ProductList.vue';
    import Cart from './components/Cart.vue';

    export default {
        data() {
            return {
                products: [
                    { id: 1, name: 'Produkt 1', price: 29.99, stock: 3 },
                    { id: 2, name: 'Produkt 2', price: 39.99, stock: 2 },
                    { id: 3, name: 'Produkt 3', price: 19.99, stock: 1 }
                ],
                // Cart contains the currently selected items.
                cart: []
            };
        },
        methods: {

            addToCart(productId) {

                const product = this.products.find(item => item.id === productId);
                if (!product || product.stock <= 0) {
                    return;
                }
                product.stock -= 1;

                this.cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price
                });
            },
            removeFromCart(productId) {
                const itemIndex = this.cart.findIndex(item => item.id === productId);
                if (itemIndex === -1) {
                    return;
                }
                this.cart.splice(itemIndex, 1);

                const product = this.products.find(item => item.id === productId);
                if (product) {
                    product.stock += 1;
                }
            }
        },
        components: {
            ProductList,
            Cart
        }
    };
</script>
