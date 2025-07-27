# Client Flow

Both authenticated and guest customers can access the following features.

## 🔐 Authentication

### 1. Connect to the Store API

Use your store's API token to initialize the client:

```ts
const storeClient = new PanaStoreClient(apiToken);
```

### 2. Register a customer:

Customer can be registered as an individual or a company.
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

### 3. Login as Registered Customer

```ts
await storeClient.login({
  email: 'customer@gmail.com',
  password: 'johnspassword',
});
```

### 4. Login as Guest

Allow customers to browse and create order without creating an account:

```ts
await storeClient.loginGuest();
```

### 5. Reset Password

Send a reset link to the customer’s email:

```ts
await storeClient.resetPassword({
  email: 'customer@gmail.com'
});
```

### 6. Change Password

After receiving the reset link, the customer can set a new password on your reset page:

```ts
await storeClient.changePassword({
  resetToken: 'reset_token',
  password: 'new_password'
});
```

### 7. Resend verification email

Let the customer request a new verification email if needed:

```ts
await storeClient.resendMyVerificationEmail();
```

### 8. Verify email

Use the token from the query string to verify the email on your verification page:

```ts
await storeClient.verifyMyEmail({
  verificationToken: 'verification_token'
});
```

## 🏢 Branches

### 1. Get all branches

Supports pagination:

```ts
await storeClient.getAllBranches({
  limit: 10,
  offset: 0
});
```

### 2. Get one branch by ID

```ts
await storeClient.getBranch(1);
```

## 📦️ Storages

### 1. Get all storages

Supports pagination:

```ts
await storeClient.getAllStorages({
  limit: 10,
  offset: 0
});
```

### 2. Get one storage by ID

```ts
await storeClient.getStorage(1);
```

## 🏬 Store

### 1. Get current store data
```ts
await storeClient.getStore();
```

## 🗂️ Categories

### 1. Get all categories

Supports pagination:

```ts
await storeClient.getAllCategories({
  limit: 10,
  offset: 0
});
```

### 2. Get one category by ID

```ts
await storeClient.getCategory(1);
```

## 👔 Products

### 1. Get all products

Supports pagination:

```ts
await storeClient.getAllProducts({
  limit: 10,
  offset: 0
});
```

### 2. Get one product by ID

```ts
await storeClient.getProduct(1);
```

## 🎨 Product Variants

### 1. Get all variants

Supports pagination. Require providing a product ID:

```ts
await storeClient.getAllProductVariants(1, {
  limit: 10,
  offset: 0
});
```

### 2. Get one variant by ID

```ts
await storeClient.getProductVariant(1);
```
