import React, { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  FlatList,
  TouchableOpacity,
} from "react-native";

// Import fish data
import fishData from "./fish.json";

export default function App() {
  const [buttonTitle, setButtonTitle] = useState("Throw");
  const [catchResult, setCatchResult] = useState("");
  const [caughtItems, setCaughtItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [randomNumber, setRandomNumber] = useState(0);

  const [isBiteTime, setIsBiteTime] = useState(false);
  const [timer, setTimer] = useState(null);

  const [correctPullTime, setCorrectPullTime] = useState(null);

  const moveAnim = useRef(new Animated.Value(0)).current; // Initial value for ball position

  useEffect(() => {
    return () => {
      clearTimeout(timer); // Clear any running timeout
      moveAnim.setValue(0); // Reset animation
    };
  }, [timer, moveAnim]);

  const handlePress = () => {
    clearTimeout(timer); // Clear any existing timer
    moveAnim.setValue(0); // Reset the ball position

    if (buttonTitle === "Throw") {
      setButtonTitle("Pull");
      setCatchResult("");
      setIsBiteTime(false);
      let randomTime = Math.random() * (7000 - 3000) + 3000; // Random time between 3-7 seconds

      // Set the correct pull time to 1 second before the randomTime ends
      const now = new Date().getTime(); // Current timestamp
      const biteTime = now + randomTime - 1000; // Set future timestamp for correct pull

      // logging
      console.log("Now:", now);
      console.log("Random time:", randomTime);
      let fixedtime = biteTime - now;
      console.log("Bite time:", fixedtime.toFixed(0) / 1000);

      setCorrectPullTime(biteTime);

      const biteTimer = setTimeout(() => {
        Animated.sequence([
          // First, nudge the ball down quickly
          Animated.timing(moveAnim, {
            toValue: 10, // Move ball 10px down
            duration: 50, // Make it quick
            useNativeDriver: true,
          }),
          // Then, move it back up immediately
          Animated.timing(moveAnim, {
            toValue: 0, // Move ball back to original position
            duration: 180, // Make it less quick
            useNativeDriver: true,
          }),
        ]).start();
      }, randomTime - 1000); // Start the animation 1 second before the random time ends

      setTimer(biteTimer);
    } else if (buttonTitle === "Pull") {
      const now = new Date().getTime(); // Get current timestamp for comparison

      if (now >= correctPullTime && now <= correctPullTime + 1000) {
        const result = fish(); // Get the fish result
        setCatchResult(result.name); // Update the catch result
        setCaughtItems([...caughtItems, result]); // Add the fish to the caught items
      } else {
        //
        setCatchResult("Too early or too late! No fish caught."); //
      }
      setButtonTitle("Throw");
      setIsBiteTime(false);
      setCorrectPullTime(null); // Reset the correct pull time
    }
  };

  const deleteItem = () => {
    if (selectedItem !== null) {
      const updatedItems = caughtItems.filter((item) => item !== selectedItem);
      setCaughtItems(updatedItems);
      setSelectedItem(null); // Clear selection
    }
  };

  function fish() {
    const randomNum = Math.floor(Math.random() * 101); // 0-100
    setRandomNumber(randomNum); // Update state with the new random number

    let selectedFish = fishData.find(
      (fish) => fish.probability >= randomNum
    ) || { name: "Something went wrong", probability: 0 };

    return selectedFish;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "blue",
          position: "absolute",
          top: 10,
          transform: [{ translateY: moveAnim }],
        }}
      />
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>{catchResult}</Text>
        <View style={styles.buttonContainer}>
          <Button title={buttonTitle} onPress={handlePress} />
        </View>
        <FlatList
          style={styles.flatListStyle}
          data={caughtItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => setSelectedItem(item)}
            >
              <Text
                style={[
                  styles.text,
                  selectedItem === item ? styles.selectedItem : null,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
        {selectedItem && (
          <View style={styles.buttonContainer}>
            <Button title="Delete" onPress={deleteItem} />
          </View>
        )}
        <StatusBar style="auto" />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container fills the screen
    alignItems: "center", // Center-align items
    padding: 50,
  },
  scrollContainer: {
    width: "100%", // Use percentage for responsiveness
  },
  flatListStyle: {
    maxHeight: 400, // Use numbers for pixel values
  },
  text: {
    textAlign: "center",
    fontSize: 12,
  },
  item: {
    width: 200,
    padding: 2,

    alignSelf: "center",
  },
  selectedItem: {
    fontWeight: "bold",
  },
  buttonContainer: {
    width: 200,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
});
