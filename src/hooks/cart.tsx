import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import { Alert } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const items = await AsyncStorage.getItem('@Market:Item');

      console.log('visualizacao dos itens do use effect abaixo');
      console.log(JSON.parse(items));

      if (items) {
        setProducts([...JSON.parse(items)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      try {
        const searchSameItem = products.find(prod => prod.id === product.id);

        if (searchSameItem) {
          searchSameItem.quantity++;

          setProducts([...products]);
        } else {
          setProducts([...products, { ...product, quantity: 1 }]);
        }
        await AsyncStorage.setItem(
          '@Market:Item',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      } catch (err) {
        Alert.alert('error', 'we do not have this product anymore');
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productItem = products.find(product => product.id === id);
      if (productItem) {
        productItem.quantity++;

        setProducts([...products]);

        await AsyncStorage.setItem('@Market:Item', JSON.stringify(products));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productItem = products.find(product => product.id === id);
      if (productItem) {
        if (productItem.quantity > 1) {
          productItem.quantity--;

          setProducts([...products]);

          await AsyncStorage.setItem('@Market:Item', JSON.stringify(products));
        }
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
