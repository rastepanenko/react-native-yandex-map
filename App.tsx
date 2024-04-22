import { Linking, StyleSheet } from 'react-native';
import { YaMap, Marker, Animation } from 'react-native-yamap';
import styled, { css } from '@emotion/native'
import { registerRootComponent } from 'expo';
import useLemons from './src/hooks/useLemons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ILemon } from './src/types/Types';
import LemonItem from './src/components/LemonItem';
import Loader from './src/components/Loader';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheet, IBottomSheetRefProps } from './src/components/BottomSheet';

YaMap.init('18e876bd-15b3-4125-b126-a7a1c9cc8299');
registerRootComponent(App);

export default function App() {

  const [lemons, setLemons] = useState<ILemon[]>();
  const [isMarkersVisible, setIsMarkersVisible] = useState(false);
  const mapRef = useRef<YaMap>(null);
  const markerRef = useRef<IBottomSheetRefProps>(null);

  const {
    updateLemons,
    errorMessage,
    isLoading,
  } = useLemons();

  const onPress = useCallback(async (lemonInfo: ILemon) => {
    const isActive = markerRef?.current?.isActive();
    markerRef.current?.setLemonInfo(lemonInfo);
    if (isActive) {
      markerRef.current?.setIsOnFullScreen(false);
      markerRef.current?.scrollTo(0);
      changeMapPosition(true, lemonInfo);
    } else {
      markerRef.current?.setIsOnFullScreen(false);
      markerRef.current?.scrollTo(-300);
      changeMapPosition(false, lemonInfo);
    }
  }, [])

  const changeMapPosition = (isActive: boolean, lemonInfo: ILemon) => {
    if (isActive) {
      mapRef.current?.fitAllMarkers();
    } else {
      mapRef.current?.setCenter({ lon: lemonInfo.longitude, lat: lemonInfo.latitude }, 15, 0, 0, 0.5, Animation.SMOOTH);
    }
  }

  useEffect(() => {
    (async () => {
      const response = await updateLemons();
      setLemons(response);
    })()
  }, []);

  const onMapLoaded = async () => {
    setIsMarkersVisible(true);
    try {
      const url = await Linking.getInitialURL();
      if (url?.includes('/lemonId')) {
        const id = Number(url?.split('/').pop());
        lemons?.map((item) => {
          if (item.id === id) {
            setTimeout(() => {
              onPress(item);
            }, 300);
          }
        })
      } else {
        setTimeout(() => {
          mapRef.current?.fitAllMarkers();
        }, 300);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!lemons) {
    return <LoaderView style={{}}>
      <Loader size={100} color={'black'} />
    </LoaderView>
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, }}>
      <Container>
        <YaMap
          ref={mapRef}
          rotateGesturesEnabled={false}
          mapType={'vector'}
          style={styles.mapStyle}
          onMapLoaded={onMapLoaded}
        >
          {lemons.map((item) => {
            return (
              <Marker
                point={{ lat: item.latitude, lon: item.longitude, }}
                key={item.id}
                onPress={() => onPress(item)}
                visible={isMarkersVisible}
              >
                <LemonItem color={item.color ? item.color : '#FFC700'} />
              </Marker>
            )
          })}
        </YaMap>
        <BottomSheet ref={markerRef} changeMapPosition={changeMapPosition} />
      </Container>
    </GestureHandlerRootView>
  );
}

const Container = styled.View`
  display: flex;
  justify-content: center;
  flex: 1;
  align-items: center;
`;

const LoaderView = styled.View`
  flex: 1; 
  justify-content: center;
  align-items: center;
`

const styles = StyleSheet.create({
  mapStyle: {
    width: '100%',
    height: '100%',
  },
});
