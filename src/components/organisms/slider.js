// /** @format */

// import React, { useState, useRef } from "react";
// import {
//   Text,
//   View,
//   FlatList,
//   TouchableOpacity,
//   Dimensions,
//   StatusBar,
//   Image,
//   StyleSheet,
//   Platform,
//   ImageBackground,
// } from "react-native";
// import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
// import Modal from "react-native-modal";
// import * as Icon from "@expo/vector-icons";
// import { SharedStyle, FormStyle, Mixins, Colors, Typography } from "_styles";

// const Banners = (props) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = React.useRef(null);
//   const { width, height } = Dimensions.get("window");

//   // console.log({ height });

//   const handleNext = () => {
//     if (currentIndex < props.banners.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
//     } else {
//       finish();
//     }
//   };

//   const RenderItem = ({ item }) => {
//     // console.log({ item });
//     return (
//       <View>
//         <View style={[styles.slide, { width }]}>
//           <Image
//             style={[styles.imageBackground]}
//             imageStyle={{
//               resizeMode: "cover",
//               borderRadius: Mixins.scaleSize(8),
//             }}
//             source={{ uri: item.url }}
//           />

//           <View style={styles.indicatorContainer}>
//             {props.banners.map((_, index) => {
//               const isActive = index === parseInt(item.key);
//               return (
//                 <TouchableOpacity
//                   key={index}
//                   onPress={() => {
//                     flatListRef.current?.scrollToIndex({ index });
//                     setCurrentIndex(index);
//                   }}
//                   style={styles.indicatorTouchable}
//                 >
//                   <View
//                     style={[
//                       styles.dot,
//                       isActive ? styles.activeDot : styles.notActive,
//                     ]}
//                   />
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const viewConfig = React.useRef({
//     viewAreaCoveragePercentThreshold: 50,
//   }).current;

//   return (
//     <FlatList
//       ref={(ref) => {
//         flatListRef.current = ref;
//       }}
//       data={props.banners}
//       renderItem={(props) => <RenderItem {...props} />}
//       keyExtractor={(item) => item.key}
//       horizontal
//       pagingEnabled
//       scrollEventThrottle={32}
//       showsHorizontalScrollIndicator={false}
//       viewabilityConfig={viewConfig}
//       onMomentumScrollEnd={(event) => {
//         const { contentOffset, layoutMeasurement } = event.nativeEvent;
//         const newIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
//         setCurrentIndex(newIndex);
//       }}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   icon: {
//     alignSelf: "center",
//     display: "flex",
//     justifyContent: "center",
//     width: 50,
//     height: 50,
//     borderRadius: 50,
//     borderColor: "white",
//     backgroundColor: "#DCDCDC",
//     opacity: 0.7,
//     marginTop: Mixins.scaleSize(30),
//   },
//   imageBackground: {
//     // flex: 1,
//     width: 314,
//     height: 650,
//     marginTop: Mixins.scaleSize(20),
//   },

//   slide: {
//     alignItems: "center",
//     // width: "100%",
//     flex: 1,
//     // width: "90%",
//     // height: "90%",
//   },

//   indicatorContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: Mixins.scaleSize(25),
//   },
//   indicatorTouchable: {
//     marginHorizontal: 4,
//   },
//   dot: {
//     width: 20,
//     height: 10,
//     borderRadius: 6,
//     backgroundColor: "gray",
//   },

//   notActive: {
//     width: 8,
//     height: 8,
//     backgroundColor: "#DCDCDC",
//     borderRadius: 6,
//   },
// });

// export default Banners;

// {
//   /* <Image
//             style={[styles.image, { height: 400 }]}
//             // className={"mb-10"}
//             source={{ uri: item.url }}
//             resizeMode="contain"
//           /> */
// }
// {
//   /* <Text style={styles.title}>{item.title}</Text>
//           <Text style={styles.description}>{item.description}</Text> */
// }

// {
//   /* <Modal
//   isVisible={this.state.modal_visible}
//   swipeDirection="down"
//   onSwipeComplete={this.onCloseModal}
//   onBackButtonPress={this.onCloseModal}
//   animationInTiming={500}
//   animationOutTiming={800}
//   backdropTransitionInTiming={500}
//   backdropTransitionOutTiming={800}
//   useNativeDriver={true}
//   style={styles.modal}
// >
//   <ImageBackground
//     style={styles.imageBackground}
//     imageStyle={{
//       resizeMode: "contain",
//       borderRadius: Mixins.scaleSize(8),
//     }}
//     source={{ uri: this.state.image }}
//   />

//   <TouchItem style={styles.icon} onPress={this.onCloseModal}>
//     <Icon.Feather
//       size={Mixins.scaleSize(30)}
//       style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
//       name="x"
//     />
//   </TouchItem>
// </Modal>; */
// }

/** @format */

import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  StyleSheet,
} from "react-native";
import { Mixins } from "_styles";

const Banners = (props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = React.useRef(null);
  const { width, height } = Dimensions.get("window");

  // console.log({ height });

  // const handleNext = () => {
  //   if (currentIndex < props.banners.length - 1) {
  //     setCurrentIndex(currentIndex + 1);
  //     flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
  //   } else {
  //     props.finish();
  //   }
  // };

  const RenderItem = ({ item }) => {
    // console.log({ item });
    return (
      <View>
        <View style={[styles.slide, { width }]}>
          <Image
            style={[styles.imageBackground]}
            imageStyle={{
              resizeMode: "cover",
              borderRadius: Mixins.scaleSize(8),
            }}
            source={{ uri: item.url }}
          />
          <View style={styles.indicatorContainer}>
            {props?.banners?.map((_, index) => {
              const isActive = index === parseInt(item.key);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({ index });
                    setCurrentIndex(index);
                  }}
                  style={styles.indicatorTouchable}
                >
                  <View
                    style={[
                      styles.dot,
                      isActive ? styles.activeDot : styles.notActive,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const viewConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <FlatList
      ref={(ref) => {
        flatListRef.current = ref;
      }}
      data={props.banners}
      renderItem={(props) => <RenderItem {...props} />}
      keyExtractor={(item) => item.key}
      horizontal
      pagingEnabled
      scrollEventThrottle={32}
      showsHorizontalScrollIndicator={false}
      viewabilityConfig={viewConfig}
      onMomentumScrollEnd={(event) => {
        const { contentOffset, layoutMeasurement } = event.nativeEvent;
        const newIndex = Math.floor(contentOffset.x / layoutMeasurement.width);
        setCurrentIndex(newIndex);
      }}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: "white",
    backgroundColor: "#DCDCDC",
    opacity: 0.7,
    marginTop: Mixins.scaleSize(30),
  },
  imageBackground: {
    // flex: 1,
    width: 314,
    height: 650,
    marginTop: Mixins.scaleSize(20),
  },

  slide: {
    alignItems: "center",
    // width: "100%",
    flex: 1,
    // width: "90%",
    // height: "90%",
  },

  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Mixins.scaleSize(25),
  },
  indicatorTouchable: {
    marginHorizontal: 4,
  },
  dot: {
    width: 20,
    height: 10,
    borderRadius: 6,
    backgroundColor: "gray",
  },

  notActive: {
    width: 8,
    height: 8,
    backgroundColor: "#DCDCDC",
    borderRadius: 6,
  },

  activeDot: {
    width: 20,
    height: 10,
    borderRadius: 6,
    backgroundColor: "gray",
  },
});

export default Banners;
