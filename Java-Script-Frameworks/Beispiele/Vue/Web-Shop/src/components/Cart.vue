<template>
    <div>
        <h2>Warenkorb</h2>
        <ul>
            <!-- key uses id+index so duplicate products are still unique in DOM -->
            <li v-for="(item, index) in cart" :key="`${item.id}-${index}`">
                {{ item.name }} - {{ item.price }} CHF
                <button @click="removeFromCart(item.id)">Entfernen</button>
            </li>
        </ul>
        <!-- Show total only when at least one item is in the cart -->
        <h3 v-if="cart.length > 0">Gesamtsumme: {{ totalPrice }} CHF</h3>
    </div>
</template>

<script>
export default {
        props: {
            cart: {
                type: Array,
                default: () => []
            }
        },
  computed: {
    totalPrice() {
      return this.cart.reduce((total, product) => total + product.price, 0).toFixed(2);
    }
  },
  methods: {
    removeFromCart(productId) {
      this.$emit('remove-from-cart', productId);
    }
  }
};
</script>
