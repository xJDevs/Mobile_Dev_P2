import { useLocalSearchParams } from 'expo-router';

import { CoinDetailScreen } from '../../screens/CoinDetailScreen';

export default function CoinDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CoinDetailScreen id={id} />;
}
