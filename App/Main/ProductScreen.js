import { ZeroEx } from '0x.js';
import * as _ from 'lodash';
import React, { Component } from 'react';
import {
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  View
} from 'react-native';
import { ListItem, Text } from 'react-native-elements';
import { connect } from 'react-redux';
import {
  loadAssets,
  loadProductsAndTokens,
  updateForexTickers,
  updateTokenTickers
} from '../../thunks';
import {
  detailsFromTicker,
  formatAmount,
  formatAmountWithDecimals,
  formatMoney,
  formatPercent
} from '../../utils';
import Col from '../components/Col';
import Row from '../components/Row';
import MutedText from '../components/MutedText';
import TokenIcon from '../components/TokenIcon';

class TokenItem extends Component {
  render() {
    const { quoteToken, baseToken, tokenTicker, amount } = this.props;
    const tokenDetails = detailsFromTicker(tokenTicker);

    return (
      <ListItem
        roundAvatar
        bottomDivider
        leftElement={
          <TokenIcon
            token={baseToken}
            amount={parseFloat(amount)}
            style={{ flex: 0 }}
            numberOfLines={1}
            showName={false}
            showSymbol={true}
          />
        }
        title={
          <Row style={[{ flex: 1 }, styles.itemContainer]}>
            <Col style={{ flex: 1 }}>
              <Text
                style={[
                  styles.large,
                  tokenDetails.changePrice >= 0 ? styles.profit : styles.loss
                ]}
              >
                {this.props.price}
              </Text>
              <MutedText>Price</MutedText>
            </Col>
            <Col style={{ flex: 1 }}>
              <Text
                style={[
                  styles.large,
                  tokenDetails.changePrice >= 0 ? styles.profit : styles.loss
                ]}
              >
                {this.props.change}
              </Text>
              <MutedText>24 Hour Change</MutedText>
            </Col>
          </Row>
        }
        hideChevron={true}
      />
    );
  }
}

class QuoteTokenItem extends Component {
  render() {
    const { quoteToken, baseToken, tokenTicker, amount } = this.props;
    const tokenDetails = detailsFromTicker(tokenTicker);

    return (
      <TokenItem
        price={`${formatAmount(Math.abs(tokenDetails.price))} ${
          quoteToken.symbol
        }`}
        change={formatPercent(Math.abs(tokenDetails.changePercent))}
        amount={formatAmountWithDecimals(baseToken.balance, baseToken.decimals)}
        {...this.props}
      />
    );
  }
}

class ForexTokenItem extends Component {
  render() {
    const { quoteToken, baseToken, forexTicker, tokenTicker } = this.props;
    const forexDetails = detailsFromTicker(forexTicker);
    const tokenDetails = detailsFromTicker(tokenTicker);

    return (
      <TokenItem
        price={formatMoney(Math.abs(tokenDetails.price * forexDetails.price))}
        change={formatPercent(Math.abs(tokenDetails.changePercent))}
        amount={formatMoney(
          ZeroEx.toUnitAmount(baseToken.balance, baseToken.decimals).mul(
            Math.abs(tokenDetails.price * forexDetails.price)
          )
        )}
        {...this.props}
      />
    );
  }
}

class ProductScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refreshing: true,
      showForexPrices: false
    };
  }

  async componentDidMount() {
    await this.onRefresh();
  }

  render() {
    const { products, forexCurrency } = this.props;
    const forexTickers = this.props.ticker.forex;
    const tokenTickers = this.props.ticker.token;
    const ProductItem = this.props.navigation.getParam('showForexPrices')
      ? ForexTokenItem
      : QuoteTokenItem;

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.onRefresh()}
          />
        }
      >
        <View style={{ width: '100%', backgroundColor: 'white' }}>
          {products.map(({ tokenA, tokenB }, index) => {
            const fullTokenA = _.find(this.props.assets, {
              address: tokenA.address
            });
            const fullTokenB = _.find(this.props.assets, {
              address: tokenB.address
            });

            if (!fullTokenA) return null;
            if (!fullTokenB) return null;

            const quoteSymbol = fullTokenA.symbol;

            if (!forexTickers[fullTokenA.symbol]) return null;
            if (!forexTickers[fullTokenA.symbol][forexCurrency]) return null;
            if (!tokenTickers[fullTokenB.symbol]) return null;
            if (!tokenTickers[fullTokenB.symbol][quoteSymbol]) return null;

            const forexTickerA = forexTickers[fullTokenA.symbol][forexCurrency];
            const tokenTickerB = tokenTickers[fullTokenB.symbol][quoteSymbol];

            return (
              <TouchableOpacity
                key={`token-${index}`}
                onPress={() =>
                  this.props.navigation.push('Details', {
                    product: { tokenA, tokenB }
                  })
                }
              >
                <ProductItem
                  quoteToken={fullTokenA}
                  baseToken={fullTokenB}
                  forexTicker={forexTickerA}
                  tokenTicker={tokenTickerB}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  async onRefresh() {
    this.setState({ refreshing: true });
    await this.props.dispatch(loadAssets());
    await this.props.dispatch(loadProductsAndTokens(true));
    await this.props.dispatch(updateForexTickers());
    await this.props.dispatch(updateTokenTickers());
    this.setState({ refreshing: false });
  }
}

const styles = {
  itemContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    width: '100%'
  },
  center: {
    textAlign: 'center'
  },
  padBottom: {
    marginBottom: 5
  },
  padLeft: {
    marginLeft: 10
  },
  small: {
    fontSize: 10
  },
  large: {
    fontSize: 14
  },
  profit: {
    color: 'green'
  },
  loss: {
    color: 'red'
  },
  right: {
    flex: 1,
    textAlign: 'right',
    marginHorizontal: 10
  }
};

export default connect(
  state => ({
    ...state.relayer,
    ...state.settings,
    ...state.wallet,
    ticker: state.ticker
  }),
  dispatch => ({ dispatch })
)(ProductScreen);
