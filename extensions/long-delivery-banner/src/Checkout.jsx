import '@shopify/ui-extensions/preact';
import {render} from "preact";
import {useAppMetafields} from "@shopify/ui-extensions/checkout/preact"
import { useCartLines } from '@shopify/ui-extensions/checkout/preact';

export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  const cartItems = useCartLines();

  const longDeliveryMetafields = useAppMetafields({
    type: "product",
    namespace: "custom",
    key: "long_delivery",
  });

  const longDeliveryTargetIds = longDeliveryMetafields
    .filter((entry) => {
      const value = entry.metafield?.value;
      try {
        return value && JSON.parse(value) === true;
      } catch (e) {
        return false;
      }
    })
    .map((entry) => entry.target.id);

  const containsLongDelivery = cartItems.some((item) =>
    longDeliveryTargetIds.some((targetId) => 
      item.merchandise.product.id.endsWith(targetId)
    )
  );

  if (containsLongDelivery) {
    return (
      <s-banner heading="Some items in your order have long delivery times." tone="warning" dismissible>
        Please check estimated delivery time before placing the order.
      </s-banner>
    )
  }

  return null;
}