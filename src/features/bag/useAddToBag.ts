import { useCallback } from 'react';
import { useAnnounce } from '../../components/Toast';
import { formatNumber } from '../../lib/format';
import { useStore } from '../../state/store';

export function useAddToBag() {
  const { dispatch, catalogue } = useStore();
  const announce = useAnnounce();
  return useCallback(
    (productId: string, quantity = 1) => {
      const product = catalogue.products.get(productId);
      const result = catalogue.results.get(productId);
      if (!product || !result) return;
      dispatch({ type: 'ADD_TO_BAG', productId, quantity });
      const points = result.points * quantity;
      announce(
        `Added ${quantity > 1 ? `${quantity} × ` : ''}${product.name} to bag · +${formatNumber(points)} points`,
      );
    },
    [dispatch, catalogue, announce],
  );
}
