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

        let productsUpdated;

        if (searchSameItem) {
          searchSameItem.quantity++;

          productsUpdated = products;

          setProducts([...productsUpdated]);
        } else {
          productsUpdated = [...products, { ...product, quantity: 1 }];

          setProducts(productsUpdated);
        }

        await AsyncStorage.setItem(
          '@Market:Item',
          JSON.stringify(productsUpdated),
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

      let addProduct;

      if (productItem) {
        addProduct = products.map(p =>
          p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
        );

        setProducts(addProduct);

        await AsyncStorage.setItem('@Market:Item', JSON.stringify(addProduct));
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productItem = products.find(product => product.id === id);

      let subProduct;

      if (productItem) {
        if (productItem.quantity > 1) {
          subProduct = products.map(p =>
            p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
          );

          setProducts(subProduct);

          await AsyncStorage.setItem(
            '@Market:Item',
            JSON.stringify(subProduct),
          );
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
