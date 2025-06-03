import { components } from "@pana-commerce/pana-sdk/dist/public-api";

/* store specific */
export type Store = components["schemas"]["Store"];
export type Product = components["schemas"]["StoreProduct"];
export type ProductVariant = components["schemas"]["StoreProductVariant"];
export type Category = components["schemas"]["StoreCategory"];

/* user specific */
export type Customer = components["schemas"]["StoreCustomer"];
export type Wishlist = components["schemas"]["StoreCustomerWishlist"];
export type ShoppingCart = components["schemas"]["StoreCustomerShoppingCart"];
export type ShoppingCartItem =
  components["schemas"]["StoreCustomerShoppingCartItem"];
export type Order = components["schemas"]["StoreCustomerOrder"];
