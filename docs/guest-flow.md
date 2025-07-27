# Guest Flow

## 🔐 Authentication

Even for guest users you must connect API and login customer.

### 1. Connect to the Store API

Use your store's API token to initialize the client:

```ts
const storeClient = new PanaStoreClient(apiToken);
```

### 2. Login

The permanent customer will be created:

```ts
const loginData = await storeClient.loginGuest();
```

## 🛒 Shopping Card

A shopping cart is automatically created when you log in guest customer.<br/>
Here are the available actions:

### 1. Get shopping cart data

```ts
await customerClient.getShoppingCart();
```

### 2. Add item to cart

Add an item to the cart by specifying the item ID and quantity:

```ts
await customerClient.addShoppingCartItem(1, { amount: 5 });
```

### 3. Remove item from cart

Remove a specific quantity of an item from the cart:

```ts
await customerClient.removeShoppingCartItem(1, { amount: 2 });
```

### 4. Clear shopping cart

```ts
await customerClient.clearShoppingCart();
```

### 5. Check items availability

Ensure that all items in the cart are still available before creating an order:

```ts
await customerClient.checkout();
```

## 🧾 Create an Order

### ⚠️ Guest Checkout Requirements:

- Guest must provide:
  - email
  - first name
  - last name
  - address details
- If a customer already exists with the provided email:
  - Show a warning and require the user to log in
- After placing an order, a new customer account will be created automatically

Once the shopping cart contains at least one available item, the guest can proceed to order creation.

### 1. Select Delivery Type

Guest must choose between:

<ul>
    <li>Pickup — requires a store or branch ID</li>
    <li>Delivery — requires a shipping address</li>
</ul>

### 2. Comment (optional)

Guest can leave a comment with the order, e.g., "Please deliver before 6 PM".

### 3. Choose Payment Type

These types are controlled by store's payment schedule options:

<ul>
    <li>Now ➡️ you will get the link for payment in the order creation response.
   You have to redirect customer to that page.</li>
    <li>In N days ➡️ the invoice will be created and automatically sent to customer's email.
   He has to pay due to expire date that is defined by store's settings.</li>
    <li>On pickup ➡️ payment intent will be created. Store's worker has to activate it manually.</li>
    <li>Later ➡️ payment intent will be created. Store's worker has to activate it manually.</li>
</ul>

### 4. Example of order creating

```ts
await customerClient.createOrder({
	comment: 'Please deliver before 6 PM',
	deliveryType: 'delivery',
	storeId: 1,
	paymentSchedule: 'now',
	firstName: 'John',
	lastName: 'Doe',
	email: 'guest@gmail.com',
	country: 'Ukraine',
	state: 'K5',
	city: 'Kyiv',
	street: 'Nezalezhnosti',
	building: '1',
	postCode: '00000',
});
```

_See also Client flow page_
