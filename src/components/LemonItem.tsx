import { Image, View } from "react-native";

interface ILemonItemProps {
    readonly color: string;
}

export default function LemonItem({ color }: ILemonItemProps) {
    return (
        <>
            <Image source={require('../images/Lemon.png')} style={{ tintColor: color, }} />
        </>
    )
}