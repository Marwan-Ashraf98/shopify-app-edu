// @ts-check

/**
 * 
 * @typedef {import("../generated/api").CartTransformRunInput} CartTransformRunInput
 * @typedef {import("../generated/api").CartTransformRunResult} CartTransformRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */

/**
 * @type {CartTransformRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {CartTransformRunInput} input
 * @returns {CartTransformRunResult}
 */
export function cartTransformRun(input) {
  const operations = input.cart.lines.reduce(
    /** @param {Operation[]} acc */
    (acc, cartLine) => {
      const expandOperation = optionallyBuildExpandOperation(cartLine);

    if (expandOperation) {
      acc.push({ lineExpand: expandOperation });
    }

      return acc;
    },
    []
  );

  return operations.length > 0 ? { operations } : NO_CHANGES;
}

/**
 * @param {CartTransformRunInput['cart']['lines'][number]} cartLine
 */
function optionallyBuildExpandOperation(
  { id: cartLineId, merchandise, cost },
) {
  if (merchandise.__typename === "ProductVariant") {
    const { product: { freeProductId } } = merchandise;

    if (freeProductId) {
      return {
        cartLineId,
        expandedCartItems: [
          {
            merchandiseId: merchandise.id,
            quantity: 1,
            price: {
              adjustment: {
                fixedPricePerUnit: {
                  amount: cost.amountPerQuantity.amount,
                },
              },
            },
          },
          {
            merchandiseId: freeProductId.value,
            quantity: 1,
            price: {
              adjustment: {
                fixedPricePerUnit: {
                  amount: 0,
                },
              },
            },
          },
        ],
      };
    }
  }

  return null;
}
