import { createStackNavigator } from 'react-navigation-stack';

import ProductTour from '_screens/onboarding/product_tour';

const TourNavigator = createStackNavigator({ ProductTour }, { header: null, headerMode: 'none' });

export default TourNavigator;