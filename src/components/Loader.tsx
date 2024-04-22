import { ActivityIndicator } from "react-native-paper";

interface LoaderProps {
    readonly size?: number;
    readonly style?: object;
    readonly color?: string;
}
export default function Loader(props: LoaderProps) {
    return (
        <ActivityIndicator
            style={props.style}
            animating={true}
            color={props.color}
            size={props.size || 50}
        />
    );
}