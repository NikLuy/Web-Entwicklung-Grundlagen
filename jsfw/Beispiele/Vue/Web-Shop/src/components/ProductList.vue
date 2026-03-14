<template>
    <div>
        <h2>Produkte</h2>
        <ul>
            <li v-for="product in products" :key="product.id">
                {{ product.name }} - {{ product.price }} CHF
                | Lagerbestand: {{ product.stock }}
                <button :disabled="product.stock === 0" @click="$emit('add-to-cart2', product.id)">
                    {{ product.stock === 0 ? 'Ausverkauft' : 'In den Warenkorb' }}
                </button>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
  props: {
    products: {
      type: Array,
      required: true
    }
  }
};
</script>
