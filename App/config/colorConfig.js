import AsyncStorage from "@react-native-community/async-storage";

export let defColor = "#2196f3"

export const setColor = async () => {
    const color = await AsyncStorage.getItem("color")
    if (color != null) {
        defColor = color
    }
}