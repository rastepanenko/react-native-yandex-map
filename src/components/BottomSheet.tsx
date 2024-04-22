import { Dimensions, Linking } from "react-native";
import styled, { css } from '@emotion/native'
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import React from "react";
import { ILemon } from "../types/Types";
import { FontAwesome } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

interface IBottomSheetProps {
    readonly changeMapPosition: (isActive: boolean, lemonInfo: ILemon) => void;
}

export interface IBottomSheetRefProps {
    readonly scrollTo: (destination: number) => void;
    readonly isActive: () => boolean;
    setLemonInfo: (lemonInfo: ILemon) => void;
    setIsOnFullScreen: (isOnFullScreen: boolean) => void;
}

const { fontScale, height: screenHeight } = Dimensions.get('window');
const maxTranslateY = -screenHeight + 50;

export const BottomSheet = React.forwardRef<IBottomSheetRefProps, IBottomSheetProps>(({ changeMapPosition }, ref) => {

    const [lemonInfo, setLemonInfo] = useState<ILemon>();
    const [isOnFullScreen, setIsOnFullScreen] = useState(false);

    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);

    const scrollRef = useRef<ScrollView>(null);

    const scrollTo = (destination: number) => {
        'worklet';
        active.value = destination !== 0;
        translateY.value = withSpring(destination, { damping: 50 });
    };

    const isActive = useCallback(() => {
        return active.value;
    }, [])

    useEffect(() => {
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true
        });
    }, [lemonInfo]);

    useImperativeHandle(ref, () => ({ scrollTo, isActive, setLemonInfo, setIsOnFullScreen }), [scrollTo, isActive, setLemonInfo, setIsOnFullScreen]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
            runOnJS(setIsOnFullScreen)(false);
        })
        .onUpdate((event) => {
            translateY.value = event.translationY + context.value.y;
            translateY.value = Math.max(translateY.value, maxTranslateY);
        })
        .onEnd(() => {
            if (translateY.value > -screenHeight / 3) {
                runOnJS(setIsOnFullScreen)(false);
                if (lemonInfo) {
                    runOnJS(changeMapPosition)(active.value, lemonInfo);
                }
                scrollTo(0);
            } else if (translateY.value > -screenHeight / 1.3) {
                runOnJS(setIsOnFullScreen)(true);
                scrollTo(maxTranslateY);
            }
        })

    const copyLink = async () => {
        try {
            let url = await Linking.getInitialURL();
            if(url) {
                if (url?.includes('/lemonId')) {
                    const newUrl = url.replace(/[^/]*$/, `${lemonInfo?.id}`)
                    url = newUrl;
                } else {
                    url = url + (`/lemonId/${lemonInfo?.id}`);
                }
                console.log(url);
                await Clipboard.setStringAsync(url);
                alert('Link copied!');
            } else {
                alert('Link cannot be copied!');
                return;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }]
        }
    })

    return (
        <GestureDetector gesture={gesture}>
            <Container style={rBottomSheetStyle}>
                <Line />
                <StyledBottomSheet >
                    <CloseButtonArea
                        onPress={() => {
                            scrollTo(0);
                            if (lemonInfo) {
                                runOnJS(changeMapPosition)(active.value, lemonInfo);
                            }
                        }}
                        style={{ display: isOnFullScreen ? 'flex' : 'none', right: 1, }}
                    >
                        <FontAwesome name="times-circle" size={30} color={'gray'} />
                    </CloseButtonArea>
                    <ScrollView
                        ref={scrollRef}
                        scrollEnabled={isOnFullScreen}
                        style={{ width: '100%', height: '100%', }}
                    >
                        <TitleText>
                            {lemonInfo?.title}
                        </TitleText>
                        <OtherText>
                            {`latitude: ${lemonInfo?.latitude}`}
                        </OtherText>
                        <OtherText>
                            {`longitude: ${lemonInfo?.longitude}`}
                        </OtherText>
                        <OtherText>
                            {lemonInfo?.content}
                        </OtherText>
                    </ScrollView>
                    <Button onPress={() => copyLink()}>
                        <CopyText>
                            Copy link to Lemon
                        </CopyText>
                    </Button>
                </StyledBottomSheet>
            </Container>
        </GestureDetector>
    )
})

const Container = styled(Animated.View)`
    display: flex;
    height: ${screenHeight.toFixed(0).toString()}px;
    width: 100%;
    position: absolute;
    top: ${(screenHeight).toFixed().toString()}px;
`

const StyledBottomSheet = styled.View`
  height: 93%;
  width: 100%;
  background-color: white;
  border-radius: 15px;
  padding: 15px;
`;

const Line = styled.View`
    display: flex;
    width: 75px;
    margin-bottom: 5px;
    height: 4px;
    background-color: grey;
    align-self: center;
`;

const TitleText = styled.Text`
    font-size: ${(24 / fontScale).toString()}px;
    font-weight: 600;
    margin-bottom: 15px;
`;

const OtherText = styled.Text`
    font-size: ${(18 / fontScale).toString()}px;
    font-weight: 500;
    margin-bottom: 10px;
`;

const CloseButtonArea = styled.TouchableOpacity`
    position: absolute; 
    zIndex: 100; 
    width: 40px;
    height: 40px; 
    marginTop: 10px;
`;

const Button = styled.TouchableOpacity`
    align-self: center;
    background-color: black;
    width: 90%;
    border-radius: 15px;
    height: 40px; 
    align-items: center;
    justify-content: center;
`;

const CopyText = styled.Text`
    font-size: 18px;
    color: white;
    font-weight: 400;
`