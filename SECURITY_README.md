# AutoAlpha Security Guidelines

## Administrator Requirements for the Vault Settings

This platform executes sophisticated background jobs on behalf of investors using centralized exchange credentials. Strict adherence to zero-trust compliance is incredibly essential.

When entering the Master API Keys and Secret Keys into the AutoAlpha Admin Settings Vault, you must independently enforce the following rules directly inside your Binance or Bybit exchange account settings:

### 1. Mandatory IP-Allowlisting

All Exchange API Keys hooked up to AutoAlpha **must be strictly bound** to the Static IP address of your DigitalOcean Droplet, AWS EC2 Instance, or Server.

- If a bad actor gains access to the database or reads environment variables, the hijacked credentials will be entirely useless if called from outside the server's designated cloud VPC.
- Leaving API IP restrictions as "Unrestricted" poses an existential threat and invalidates our data-encryption liabilities.

### 2. Disable Withdrawals

Withdrawal permissions on these keys must be **strictly disabled**.
AutoAlpha's trade engine only requires the `Trade` permission for Futures / Spot execution and `Read` permissions to reconcile balances.

- In instances where a separate key is required to automate refunds globally, the specific API key must leverage the Exchange's internal **Address Whitelist** protocol to strictly lock destinations to our operational cold wallets.
- General withdrawal access poses acute risk.

These guidelines govern our SOC2 adherence model. Modifying keys in the database logs directly to the immutable Audit Log.

-- The AutoAlpha Security Engineering Team
