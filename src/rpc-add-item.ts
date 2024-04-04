const AddItemRpc = function (
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string | null,
): string {
  // Define success and failure responses.
  const success = JSON.stringify({ success: true })
  const failure = function (error: string): string {
    logger.error(error)
    return JSON.stringify({
      success: false,
      error,
    })
  }

  // If the payload is empty, return a failure.
  if (!payload || payload === '') {
    return failure('no payload provided')
  }

  const itemToAdd = JSON.parse(payload)

  // If the payload contains no item name, return a failure.
  if (!itemToAdd.name) {
    return failure('item has no name')
  }

  // If the payload contains no quantity, or a non-numeric quantity, return a failure.
  if (!itemToAdd.quantity || isNaN(Number(itemToAdd.quantity))) {
    return failure('item has no quantity')
  }

  // If the payload quantity is negative, return a failure.
  if (itemToAdd.quantity <= 0) {
    return failure('quantity provided must be greater than 0')
  }

  // Define a storage read request to get the player's current inventory.
  const readRequest: nkruntime.StorageReadRequest = {
    collection: 'player',
    key: 'inventory',
    userId: ctx.userId,
  }

  let inventory: Inventory = {}

  // Attempt to get the player's current inventory from storage.
  const result = nk.storageRead([readRequest])
  if (result.length > 0) {
    inventory = result[0].value
  }

  // If the player already has the item, increase the quantity, otherwise add it.
  if (inventory[itemToAdd.name]) {
    inventory[itemToAdd.name] += itemToAdd.quantity
  } else {
    inventory[itemToAdd.name] = itemToAdd.quantity
  }

  // Define the storage write request to update the player's inventory.
  const writeRequest: nkruntime.StorageWriteRequest = {
    collection: 'player',
    key: 'inventory',
    userId: ctx.userId,
    permissionWrite: 1,
    permissionRead: 1,
    value: inventory,
  }

  // Write the updated inventory to storage.
  const storageWriteAck = nk.storageWrite([writeRequest])

  // Return a failure if the write does not succeed.
  if (!storageWriteAck || storageWriteAck.length === 0) {
    return failure('error saving inventory')
  }

  return success
}

type Inventory = Record<string, any>

export default AddItemRpc
