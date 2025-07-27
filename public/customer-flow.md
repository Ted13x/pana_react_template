# Customer Flow

## 🔐 Authentication

### 1. Connect to the Store API

Use your store's API token to initialize the client:

```ts
const storeClient = new PanaStoreClient(apiToken);
```

### 2. Register a customer:

You can register either an individual or a company.
Make sure to include all required customPropertyValues specified by your store settings.

#### 1. Register an Individual.

 ```ts
await storeClient.register({
  email: 'customer@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  password: 'johnspassword',
  customerType: 'individual',
  customPropertyValues: [
    {
      propertyId: 1,
      value: 'Blue'
    }
  ]
});
 ```

#### 2. Register a company.

For companies, you must additionally provide:
<ul>
    <li>companyName</li>
    <li>businessType</li>
    <li>registryNumber</li>
</ul>

```ts
await storeClient.register({
  email: 'company@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  password: 'johnspassword',
  customerType: 'company',
  customPropertyValues: [
    {
      propertyId: 1,
      value: 'Blue'
    }
  ],
  companyName: 'Acme Corporation',
  businessType: 'Software Development',
  registryNumber: 'REG-123456789',
});
```

### 3. Login

```ts
const loginData = await storeClient.login({
  email: 'customer@gmail.com',
  password: 'johnspassword',
});
```

### 4. Connect to the Customers API

```ts
const customerClient = new PanaCustomerClient(loginData?.accessToken!);
```

Since then, you can interact with customer actions.

## 🙎 Customer Personal Data

All actions below use customerClient, which operates under an authenticated customer session.

### 1. Get customer data

```ts
await customerClient.getCustomer();
```

### 2. Update customer data

Update any customer fields (only send the fields you want to change):

```ts
await customerClient.updateMe({
  email: 'company@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  password: 'johnspassword',
  customPropertyValues: [
    {
      propertyId: 1,
      value: 'Green'
    }
  ],
  // company data
  companyName: 'Acme Corporation',
  businessType: 'Software Development',
  registryNumber: 'REG-123456789',
});
```

### 3. Upload profile file

You can use custom properties of type file (e.g. a logo field). To upload a file:

```ts
await customerClient.uploadCustomerPropertyFile({
  propertyId: 1,
  file: new File(),
});
```

### 4. Check password

Verify if the current password is correct:

```ts
await customerClient.checkMyPassword({
  password: 'johnspassword',
});
```

### 5. Change password

```ts
await customerClient.changeMyPassword({
  oldPassword: 'johnspassword',
  newPassword: 'johnspassword_new',
});
```

### 6. Change email

The confirmation email will be sent to the newEmail.<br/>
The customer must click the verification link — it redirects to your verification page with a token in the query string.

```ts
await customerClient.changeMyEmail({
  newEmail: 'customer_new@gmail.com',
});
```

### 7. Resend verification email

Let the customer request a new verification email if needed:

```ts
await customerClient.resendMyVerificationEmail();
```

### 8. Verify email

Use the token from the query string to verify the email on your verification page:

```ts
await customerClient.verifyMyEmail({
  verificationToken: 'verification_token'
});
```

### 9. Delete profile

Permanently delete the customer’s profile:

```ts
await customerClient.delete();
```

## 🏠 Customer Addresses

Customers must provide a shipping address to create an order with delivery.
You can perform the following actions using customerClient:

### 1. Get all addresses

```ts
await customerClient.getAllAddresses();
```

### 2. Get one address by ID

```ts
await customerClient.getAddress(1);
```

### 3. Create address

You can mark it as primary (only one address can be primary):

```ts
await customerClient.createAddress({
  country: 'Ukraine',
  state: 'K5',
  city: 'Kyiv',
  street: 'Nezalezhnosti',
  building: '1',
  postCode: '00000',
  primary: true
});
```

### 4. Update address by ID

Provide only the fields you want to change:

```ts
await customerClient.updateAddress(1, {
  country: 'Ukraine',
  state: 'K5',
  city: 'Kyiv',
  street: 'Nezalezhnosti',
  building: '1',
  postCode: '00000',
  primary: true
});
```

### 5. Set default address by ID

Mark an address as default. This address will be preselected during order creation.<br/>
Only one address can be set as default:

```ts
await customerClient.setDefaultAddress(1);
```

### 6. Delete address by ID

Note: default address cannot be deleted:

```ts
await customerClient.deleteAddress(1);
```

## 🛒 Shopping Card

A shopping cart is automatically created when the customer registers on the platform.<br/>
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

Once the shopping cart contains at least one available item, the customer can proceed to order creation.

### 1. Select Delivery Type

Customer must choose between:
<ul>
    <li>Pickup — requires a store or branch ID</li>
    <li>Delivery — requires a previously created shipping address</li>
</ul>

### 2. Comment (optional)

Customer can leave a comment with the order, e.g., "Please deliver before 6 PM".

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
  customerAddressId: 1,
  paymentSchedule: 'now'
});
```

## 📂 Other Order Actions

### 1. Get all orders

Supports pagination:

```ts
await customerClient.getAllOrders({
  limit: 10,
  offset: 0
});
```

### 2. Get one order by ID

```ts
await customerClient.getOrder(1);
```

### 3. Get order invoice by order ID

```ts
await customerClient.getOrderInvoice(1);
```

### 4. Duplicate an order by order ID

This action will recreate a shopping cart with available items and return the list of unavailable items:

```ts
await customerClient.duplicateOrder(1);
```

## 🗒️ Order Notes

Customers can manage notes attached to their orders:

### 1. Get all notes by order ID

```ts
await customerClient.getAllOrderNotes(1);
```

### 2. Get one note by order and note ID

```ts
await customerClient.getOrderNote(1, 2);
```

### 3. Create note

```ts
await customerClient.createOrderNote({
  text: 'I want a discount'
});
```

## ⭐️ Wishlists
Authorized customers can manage wishlists and add or remove product variants:
### 1. Get all wishlists
Supports pagination:
```ts
await customerClient.getAllWishlists({
  limit: 10,
  offset: 0
});
```

### 2. Get wishlist by ID
```ts
await customerClient.getWishlist(1);
```

### 3. Create wishlist
```ts
await customerClient.createWishlist({
  name: 'Presents',
  description: 'For my family'
});
```

### 4. Update wishlist
```ts
await customerClient.updateWishlist({
  name: 'Nutrition',
  description: 'Healthy food'
});
```

### 5. Delete wishlist
```ts
await customerClient.deleteWishlist(1);
```

### 6. Add item to wishlist
Provide wishlist ID and product variant ID:
```ts
await customerClient.addWishlistItem(1, 2);
```

### 7. Remove item from wishlist
Provide wishlist ID and product variant ID:
```ts
await customerClient.removeWishlistItem(1, 2);
```

### 8. Clear wishlist by ID
```ts
await customerClient.clearWishlist(1);
```

_See also Client flow page_
