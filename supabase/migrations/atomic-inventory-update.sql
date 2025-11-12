-- Atomic Inventory Update Function
-- Prevents race conditions when multiple invoices update the same inventory part
-- Uses database-level transactions and locking

CREATE OR REPLACE FUNCTION update_inventory_atomic(
  p_part_number TEXT,
  p_description TEXT,
  p_quantity_to_add INTEGER,
  p_unit_price NUMERIC,
  p_supplier TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  part_number TEXT,
  description TEXT,
  quantity_on_hand INTEGER,
  unit_price NUMERIC,
  supplier TEXT,
  was_created BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id UUID;
  v_new_quantity INTEGER;
  v_was_created BOOLEAN := FALSE;
BEGIN
  -- Lock the row for update to prevent race conditions
  -- If part exists, lock it. If not, we'll insert it.
  SELECT inventory.id INTO v_existing_id
  FROM inventory
  WHERE inventory.part_number = p_part_number
  FOR UPDATE;

  IF v_existing_id IS NOT NULL THEN
    -- Part exists: add to existing quantity
    UPDATE inventory
    SET
      quantity_on_hand = quantity_on_hand + p_quantity_to_add,
      unit_price = COALESCE(p_unit_price, unit_price),
      supplier = COALESCE(p_supplier, supplier),
      updated_at = NOW()
    WHERE inventory.id = v_existing_id
    RETURNING
      inventory.id,
      inventory.part_number,
      inventory.description,
      inventory.quantity_on_hand,
      inventory.unit_price,
      inventory.supplier,
      FALSE
    INTO
      id,
      part_number,
      description,
      quantity_on_hand,
      unit_price,
      supplier,
      was_created;
  ELSE
    -- Part doesn't exist: create new record
    INSERT INTO inventory (
      part_number,
      description,
      quantity_on_hand,
      unit_price,
      supplier,
      created_at,
      updated_at
    )
    VALUES (
      p_part_number,
      p_description,
      p_quantity_to_add,
      p_unit_price,
      COALESCE(p_supplier, 'Unknown'),
      NOW(),
      NOW()
    )
    RETURNING
      inventory.id,
      inventory.part_number,
      inventory.description,
      inventory.quantity_on_hand,
      inventory.unit_price,
      inventory.supplier,
      TRUE
    INTO
      id,
      part_number,
      description,
      quantity_on_hand,
      unit_price,
      supplier,
      was_created;
  END IF;

  RETURN NEXT;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_inventory_atomic TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION update_inventory_atomic IS
'Atomically updates inventory quantity or creates new inventory record.
Uses row-level locking to prevent race conditions when multiple invoices
process simultaneously. Returns the updated/created record with a flag
indicating whether it was newly created.';


-- Deduct Inventory Function (for work orders)
-- Atomically deducts parts from inventory with stock checking
CREATE OR REPLACE FUNCTION deduct_inventory_atomic(
  p_part_number TEXT,
  p_quantity_to_deduct INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  new_quantity INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
BEGIN
  -- Lock the inventory row for update
  SELECT quantity_on_hand INTO v_current_quantity
  FROM inventory
  WHERE part_number = p_part_number
  FOR UPDATE;

  -- Check if part exists
  IF v_current_quantity IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Part not found in inventory', 0;
    RETURN;
  END IF;

  -- Check if sufficient quantity available
  IF v_current_quantity < p_quantity_to_deduct THEN
    RETURN QUERY SELECT
      FALSE,
      format('Insufficient quantity. Available: %s, Requested: %s', v_current_quantity, p_quantity_to_deduct),
      v_current_quantity;
    RETURN;
  END IF;

  -- Deduct the quantity
  v_new_quantity := v_current_quantity - p_quantity_to_deduct;

  UPDATE inventory
  SET
    quantity_on_hand = v_new_quantity,
    updated_at = NOW()
  WHERE part_number = p_part_number;

  RETURN QUERY SELECT TRUE, 'Quantity deducted successfully', v_new_quantity;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION deduct_inventory_atomic TO authenticated;

COMMENT ON FUNCTION deduct_inventory_atomic IS
'Atomically deducts parts from inventory with stock checking.
Uses row-level locking to prevent overselling. Returns success status,
message, and new quantity.';
