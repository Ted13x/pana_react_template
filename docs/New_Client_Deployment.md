# New Client Deployment Process

1. Create a new branch

   Use the naming convention: client/client-name.

2. Apply customization changes

   Make all necessary template customizations specific to that client (if needed).

3. Add .env file

   Include a `VITE_PANA_STORE_API_TOKEN` variable, and set its value to the store’s API token.

4. Create a new static app on Digital Ocean

   Deploy the branch as a static resource.

5. Add default PANA domain

   After a successful deployment, add the default PANA domain, for example: `{client_name}.pana.technology`

6. Add custom domain (optional)

   If needed, add the client’s custom domain.
