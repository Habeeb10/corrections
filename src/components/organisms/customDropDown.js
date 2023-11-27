import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

class CustomDropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      selectedItem: null,
    };
  }

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  handleItemPress = (item) => {
    this.setState({ selectedItem: item });
    this.closeModal();
  };

  render() {
    const { data } = this.props;
    const { modalVisible, selectedItem } = this.state;
    return (
      // <View
      //   style={{ flex: 1, backgroundColor: "white", height: 50, width: "100%" }}
      // >
      //   <View
      //     style={{
      //       flexDirection: "row",
      //       alignItems: "center",
      //       justifyContent: "space-between",
      //       width: "100%",
      //       height: "100%",
      //       backgroundColor: "white",
      //     }}
      //   >
      //     <TextInput
      //       placeholder="Select an item"
      //       value={selectedItem ? selectedItem.label : ""}
      //       onFocus={this.openModal}
      //       style={styles.input}
      //     />
      //     <TouchableOpacity onPress={this.openModal}>
      //       <Text>Open Dropdown</Text>
      //     </TouchableOpacity>
      //   </View>

      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => this.handleItemPress(item)}>
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={this.closeModal}>
            <Text>Close Dropdown</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      // </View>
    );
  }
}

export default CustomDropDown;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "yellow",
    borderRadius: 7,
    width: "70%",
  },
});

// class YourComponent extends Component {
//   render() {
//     const data = [
//       { id: 1, label: "Option 1" },
//       { id: 2, label: "Option 2" },
//       { id: 3, label: "Option 3" },
//     ];

//     return <CustomDropdown data={data} />;
//   }
// }
