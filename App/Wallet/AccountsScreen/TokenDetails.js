import { assetDataUtils } from '0x.js';
import React, { Component } from 'react';
import { View } from 'react-native';
import { Avatar } from 'react-native-elements';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import * as AssetService from '../../../services/AssetService';
import NavigationService from '../../../services/NavigationService';
import * as WalletService from '../../../services/WalletService';
import * as styles from '../../../styles';
import { getImage } from '../../../utils';
import { assetProp } from '../../../types/props';
import Button from '../../components/Button';
import TokenBalanceByAssetData from '../../views/TokenBalanceByAssetData';

class TokenDetails extends Component {
  static propTypes = {
    asset: assetProp.isRequired
  };

  receive() {
    const { asset } = this.props;
    NavigationService.navigate('Receive', {
      asset
    });
  }

  send() {
    const { asset } = this.props;
    NavigationService.navigate('Send', {
      asset
    });
  }

  wrap() {
    const { asset } = this.props;
    NavigationService.navigate('Wrap', {
      asset
    });
  }

  toggleApprove() {
    const { asset } = this.props;
    NavigationService.navigate('ToggleApprove', {
      asset
    });
  }

  render() {
    const { asset } = this.props;
    const { symbol } = asset;

    const assetOrWETH =
      asset.assetData !== null
        ? AssetService.findAssetByData(asset.assetData)
        : AssetService.getWETHAsset();

    const isUnlocked = WalletService.isUnlockedByAddress(
      assetDataUtils.decodeERC20AssetData(assetOrWETH.assetData).tokenAddress
    );

    return (
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 10
        }}
      >
        <Avatar
          size="large"
          rounded
          source={getImage(asset.symbol)}
          activeOpacity={0.7}
        />
        <TokenBalanceByAssetData
          assetData={asset.assetData}
          style={{ marginTop: 5 }}
        />

        <View
          style={{
            height: 50,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10
          }}
        >
          <Button
            large
            title=""
            icon={
              <MaterialCommunityIcons
                name="qrcode"
                color="white"
                size={28}
                style={[styles.margin1]}
              />
            }
            onPress={() => this.receive()}
          />
          {symbol === 'ETH' ? (
            <Button
              large
              title=""
              icon={
                <MaterialCommunityIcons
                  name="ethereum"
                  color="white"
                  size={28}
                  style={[styles.margin1]}
                />
              }
              onPress={() => this.wrap()}
            />
          ) : null}
          <Button
            large
            title=""
            icon={
              <FontAwesome
                name={isUnlocked ? 'lock' : 'unlock'}
                color="white"
                size={28}
                style={[styles.margin1]}
              />
            }
            onPress={() => this.toggleApprove()}
          />
          <Button
            large
            title=""
            icon={
              <MaterialIcons
                name="send"
                color="white"
                size={28}
                style={[styles.margin1]}
              />
            }
            iconRight={true}
            onPress={() => this.send()}
          />
        </View>
      </View>
    );
  }
}

export default connect(
  state => ({
    ...state.wallet
  }),
  dispatch => ({ dispatch })
)(TokenDetails);
