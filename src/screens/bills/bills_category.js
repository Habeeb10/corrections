import React, { Component } from "react";
import { BackHandler, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";

import { showToast } from "_actions/toast_actions";
import { updateBillPayment } from "_actions/bills_actions";

import { Dictionary, Util } from "_utils";
import { SharedStyle, FormStyle } from "_styles";
import { SubHeader, ScrollView, ProgressBar } from "_atoms";
import { PrimaryButton, SelectListItem } from "_molecules";
import { MainHeader } from "_organisms";

class BillsCategory extends Component {
  constructor(props) {
    super(props);

    const categories = this.props.bills.categories;
    this.state = {
      categories,
      category: null,
      category_value: "",
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.goBack();

      return true;
    }
  };

  setScrollRef = (scrollRef) => {
    this.scrollRef = scrollRef;
  };

  handleSelectedCategory = (category) => {
    this.setState(
      {
        category,
        category_value: category.id,
      },
      () => {
        setTimeout(() => {
          this.scrollRef.scrollToEnd({ animated: true });
        }, 50);
      }
    );
  };

  handleSubmit = () => {
    let { category } = this.state;
    this.props.updateBillPayment({ category });

    this.props.navigation.navigate("BillsBiller");
    Util.logEventData("transactions_start_bills");
  };

  render() {
    let categories = this.state.categories.filter(
      (item) => item.slug != "data_bundle" && item.slug != "airtime"
    );
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.BILL_PAYMENT}
        />
        <ScrollView
          {...this.props}
          hasButtomButtons={true}
          setScrollRef={this.setScrollRef}
        >
          <SubHeader text={Dictionary.BILL_CATEGORY_SUB_HEADER} />
          <ProgressBar progress={0.2} />
          {categories.map((category, index) => {
            return (
              <SelectListItem
                key={index}
                image={{ uri: category.logo_url }}
                title={category.name}
                description={category.description}
                onPress={() => this.handleSelectedCategory(category)}
                selected={this.state.category_value === category.id}
              />
            );
          })}
          {!!this.state.category_value && (
            <View style={SharedStyle.bottomPanel}>
              <View style={FormStyle.formButton}>
                <PrimaryButton
                  title={Dictionary.CONTINUE_BTN}
                  icon="arrow-right"
                  onPress={this.handleSubmit}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    bills: state.bills,
  };
};

const mapDispatchToProps = {
  showToast,
  updateBillPayment,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(BillsCategory));
