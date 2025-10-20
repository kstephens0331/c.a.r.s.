# Add Supplier Column to Inventory Table

## Why This Column is Important

The `supplier` column allows Tony to:
- **Track which vendor supplies each part** for easy reordering
- **Compare prices** when the same part is available from multiple suppliers
- **Verify correct parts** when pricing differs between vendors
- **Build vendor relationships** by tracking purchase history

## How to Add the Column

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/vbxrcqtjpcyhylanozgz
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Copy and paste the SQL from `add-supplier-column.sql`
5. Click **"Run"** button
6. Done! The column is now added

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd "c:\Users\usmc3\OneDrive\Documents\StephensCode Customer Websites\C.A.R.S\collision-shop"

# Run the SQL file
supabase db execute < add-supplier-column.sql
```

## What Gets Updated

### Database Changes:
- Adds `supplier` column (TEXT) to `inventory` table
- Creates index on `supplier` for faster searches
- Adds column description/comment

### Code Changes (Already Done):
- ✅ **Invoices.jsx** - Now saves supplier when adding new inventory items from invoices
- ✅ **Inventory.jsx** - Now displays supplier column in inventory table

## How It Works

### When Tony Uploads an Invoice:
1. AI extracts supplier name from invoice (e.g., "AutoZone", "NAPA")
2. When new parts are added to inventory, supplier name is saved
3. Inventory table now shows which vendor each part came from

### Example Inventory Table:

| Part # | Description | Qty | Price | **Supplier** | Date Added |
|--------|-------------|-----|-------|--------------|------------|
| BMP-123 | Front Bumper | 5 | $150.00 | **AutoZone** | 1/15/2025 |
| HOOD-456 | Hood Panel | 3 | $200.00 | **NAPA** | 1/16/2025 |
| BMP-123 | Front Bumper | 2 | $145.00 | **O'Reilly** | 1/20/2025 |

Now Tony can see the same part (BMP-123) from different suppliers with different prices!

## Benefits for Reordering

When Tony needs to reorder a part:
- Can see which supplier had the best price
- Can contact the supplier directly
- Can verify part numbers match the original supplier's catalog
- Can build relationships with reliable vendors

## After Adding the Column

**Important:** Existing inventory items (added before this change) will show "N/A" for supplier since they weren't tracked before. Only new items added from invoices will have supplier information.

To update existing items manually:
1. Go to Inventory page
2. Check which parts need supplier info
3. Add supplier info in Supabase dashboard or via SQL updates

## Verification

After running the SQL, verify it works:
1. Go to admin portal → Invoices
2. Upload a test vendor invoice
3. Let AI extract the data
4. Save the invoice
5. Go to Inventory page
6. Verify new parts show the supplier name in the table
