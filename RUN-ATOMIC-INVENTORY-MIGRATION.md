# Run Atomic Inventory Update Migration

## Why This Is Important

This migration creates **database-level atomic functions** to prevent race conditions when multiple invoices update the same inventory part simultaneously.

### Problem It Solves:
Without atomic updates, this can happen:
1. Invoice A reads part BMP-123 has quantity 10
2. Invoice B reads part BMP-123 has quantity 10
3. Invoice A adds 5 → saves quantity as 15
4. Invoice B adds 3 → saves quantity as 13 (WRONG! Should be 18)

With atomic updates:
- Database locks the row during update
- Second update waits for first to complete
- Final quantity is correct: 18

---

## How to Run This Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: **vbxrcqtjpcyhylanozgz**
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy the ENTIRE contents of `supabase/migrations/atomic-inventory-update.sql`
6. Paste into the SQL editor
7. Click **RUN** (or press Ctrl+Enter)

**Expected Output:**
```
Success. No rows returned
CREATE FUNCTION
GRANT
COMMENT
CREATE FUNCTION
GRANT
COMMENT
```

---

### Option 2: Supabase CLI

```bash
# Make sure you're in the project directory
cd "c:\Users\usmc3\OneDrive\Documents\StephensCode Customer Websites\C.A.R.S\collision-shop"

# Run the migration
supabase db execute --file supabase/migrations/atomic-inventory-update.sql
```

---

## What This Migration Creates

### 1. `update_inventory_atomic()` Function

**Purpose**: Safely add inventory from invoices

**Parameters**:
- `p_part_number` - Part number (e.g., "BMP-123")
- `p_description` - Part description
- `p_quantity_to_add` - Quantity to add
- `p_unit_price` - Price per unit
- `p_supplier` - Supplier name (optional)

**Returns**:
- `id` - Inventory record ID
- `part_number` - Part number
- `description` - Description
- `quantity_on_hand` - New quantity
- `unit_price` - Unit price
- `supplier` - Supplier
- `was_created` - TRUE if new record, FALSE if updated existing

**How It Works**:
1. Locks the inventory row (prevents concurrent updates)
2. If part exists: adds to quantity
3. If part doesn't exist: creates new record
4. Returns updated/created record

**Usage Example**:
```sql
SELECT * FROM update_inventory_atomic(
  'BMP-123',
  'Bumper Cover',
  5,
  150.00,
  'AutoZone'
);
```

---

### 2. `deduct_inventory_atomic()` Function

**Purpose**: Safely deduct inventory for work orders

**Parameters**:
- `p_part_number` - Part number
- `p_quantity_to_deduct` - Quantity to deduct

**Returns**:
- `success` - TRUE if successful, FALSE if failed
- `message` - Success or error message
- `new_quantity` - New quantity after deduction

**How It Works**:
1. Locks the inventory row
2. Checks if part exists
3. Checks if sufficient quantity available
4. Deducts quantity if valid
5. Returns result

**Usage Example**:
```sql
SELECT * FROM deduct_inventory_atomic('BMP-123', 2);
```

**Possible Responses**:
- Success: `{success: true, message: "Quantity deducted successfully", new_quantity: 3}`
- Part not found: `{success: false, message: "Part not found in inventory", new_quantity: 0}`
- Insufficient stock: `{success: false, message: "Insufficient quantity. Available: 3, Requested: 5", new_quantity: 3}`

---

## Benefits

✅ **Prevents Race Conditions** - Database locks ensure atomic updates
✅ **Data Integrity** - Correct quantities even with concurrent invoices
✅ **Stock Validation** - Prevents negative inventory
✅ **Automatic Creation** - Creates new parts if they don't exist
✅ **Production Safe** - Uses PostgreSQL transactions and locking

---

## Testing

After running the migration, test with:

```sql
-- Test 1: Add new part
SELECT * FROM update_inventory_atomic('TEST-001', 'Test Part', 10, 25.00, 'Test Supplier');

-- Test 2: Add to existing part
SELECT * FROM update_inventory_atomic('TEST-001', 'Test Part', 5, 25.00, 'Test Supplier');

-- Test 3: Deduct from inventory
SELECT * FROM deduct_inventory_atomic('TEST-001', 3);

-- Test 4: Try to deduct too much (should fail)
SELECT * FROM deduct_inventory_atomic('TEST-001', 100);

-- Clean up
DELETE FROM inventory WHERE part_number = 'TEST-001';
```

---

## Next Steps

After running this migration:

1. ✅ Functions are created and ready to use
2. Update Invoices.jsx to call `update_inventory_atomic` instead of direct insert/update
3. Update CustomerDetailsPage.jsx to call `deduct_inventory_atomic` when adding parts to work orders

---

## Troubleshooting

**Error: "relation 'inventory' does not exist"**
- Make sure you ran the initial database schema first

**Error: "permission denied"**
- The migration grants execute permission to `authenticated` role
- Make sure you're logged in when calling the functions

**Functions not showing up**
- Refresh the Supabase dashboard
- Check the Functions section in the Database tab

---

**Status**: Ready to run before 10 AM meeting ✅
