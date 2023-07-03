import { Image } from 'react-native';
import {
    UPDATE_BILL_PAYMENT, RESET_BILL_PAYMENT,
    START_LOAD_BILLER_CATEGORIES, LOAD_BILLER_CATEGORIES, LOAD_BILLER_CATEGORIES_FAILED
} from '../types/bills_types';

const initialState = {
    categories: [],
    loading_categories: false,
    categories_error: null,
    bill_payment: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_BILL_PAYMENT: {
            let bill_payment = { ...state.bill_payment, ...action.bill_payment }
            return {
                ...state,
                bill_payment
            }
        }
        case RESET_BILL_PAYMENT: {
            return {
                ...state,
                bill_payment: {}
            }
        }
        case START_LOAD_BILLER_CATEGORIES: {
            return {
                ...state,
                loading_categories: true,
                categories_error: null
            }
        }
        case LOAD_BILLER_CATEGORIES: {
            let categories_data = [...action.categories];
            let categories = [];

            categories_data.forEach((category,index) => {
                try {
                    Image.prefetch(category.logo_url);
                } catch (error) {
                    console.log(JSON.stringify(error, null, 4));
                }
                categories.push({
                    id: index,
                    name: category.name,
                    short_code: category.categoryshortcode,
                    logo_url: category.logo_url,
                    slug: category.categoryCode,
                    description:category.description||""
                });
            });

            return {
                ...state,
                categories,
                loading_categories: false,
                categories_error: null
            }
        }
        case LOAD_BILLER_CATEGORIES_FAILED: {
            return {
                ...state,
                loading_categories: false,
                categories_error: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};