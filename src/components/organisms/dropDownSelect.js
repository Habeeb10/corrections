import React, { Component } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { TouchItem } from "_atoms";

class SelectItemModal extends Component {
  handleItemSelected = (dataPackage) => {
    const { onSelect, onItemSelected } = this.props;
    onSelect(dataPackage);
    onItemSelected(); // Call the onItemSelected prop to close the modal
  };

  render() {
    const { visible, packages, onClose } = this.props;

    return (
      <Modal
        animationIn={"slideInUp"}
        onBackdropPress={() => this.closeModal()}
        isVisible={this.state.showModal}
        style={{ margin: 0 }}
        onRequestClose={onClose}
      >
        <View style={{}}>
          <View
            style={{
              height: Mixins.scaleSize(48),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingLeft: Mixins.scaleSize(20),
              paddingRight: Mixins.scaleSize(5),
            }}
          >
            {packages.map((dataPackage, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => this.handleItemSelected(dataPackage)}
                style={{ paddingVertical: 8 }}
              >
                <Text>{dataPackage.billerName}</Text>
              </TouchableOpacity>
            ))}
            <TouchItem
              onPress={this.closeModal}
              style={{ paddingHorizontal: Mixins.scaleSize(15) }}
            >
              <Ionicons
                name="ios-close"
                size={Mixins.scaleSize(20)}
                color={"rgba(0, 0, 0, 0.5400000214576721)"}
              />
            </TouchItem>
          </View>
        </View>
      </Modal>
    );
  }
}

export default SelectItemModal;
