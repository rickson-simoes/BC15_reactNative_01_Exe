import React, { useState, useMemo } from 'react';

import { useNavigation } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import {
  Container,
  CartPricing,
  CartButton,
  CartButtonText,
  CartTotalPrice,
} from './styles';

import formatValue from '../../utils/formatValue';

import { useCart } from '../../hooks/cart';

const FloatingCart: React.FC = () => {
  const [qtdeItens, setQtdeItens] = useState<number>(0);
  const [valorTotalItens, setValorTotalItens] = useState<number>(0);

  const { products } = useCart();

  const navigation = useNavigation();

  const cartTotal = useMemo(() => {
    const valorTotal = products.reduce(
      (acc, uni) => acc + uni.quantity * uni.price,
      0,
    );

    if (valorTotal) {
      setValorTotalItens(valorTotal);

      return formatValue(valorTotalItens);
    }

    return formatValue(0);
  }, [products, valorTotalItens]);

  const totalItensInCart = useMemo(() => {
    const qntdTotal = products.reduce((acc, uni) => acc + uni.quantity, 0);

    if (qntdTotal) {
      setQtdeItens(qntdTotal);

      return qtdeItens;
    }

    return 0;
  }, [products, qtdeItens]);

  return (
    <Container>
      <CartButton
        testID="navigate-to-cart-button"
        onPress={() => navigation.navigate('Cart')}
      >
        <FeatherIcon name="shopping-cart" size={24} color="#fff" />
        <CartButtonText>{`${totalItensInCart} itens`}</CartButtonText>
      </CartButton>

      <CartPricing>
        <CartTotalPrice>{cartTotal}</CartTotalPrice>
      </CartPricing>
    </Container>
  );
};

export default FloatingCart;
