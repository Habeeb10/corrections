import {
    START_LOAD_SAVINGS_PRODUCTS, LOAD_SAVINGS_PRODUCTS, LOAD_SAVINGS_PRODUCTS_FAILED,
    START_LOAD_SAVINGS_COLLECT_MODES, LOAD_SAVINGS_COLLECT_MODES, LOAD_SAVINGS_COLLECT_MODES_FAILED,
    START_LOAD_SAVINGS_FREQUENCIES, LOAD_SAVINGS_FREQUENCIES, LOAD_SAVINGS_FREQUENCIES_FAILED,
    START_LOAD_USER_SAVINGS, LOAD_USER_SAVINGS, LOAD_USER_SAVINGS_FAILED,
    UPDATE_APPLICATION, RESET_APPLICATION, UPDATE_SAVINGS_ARCHIVED_STATUS
} from '../types/savings_types';

const initialState = {
    savings_products: [],
    loading_savings_products: false,
    savings_products_error: null,
    collection_modes: [],
    loading_collection_modes: false,
    collection_modes_error: null,
    saving_frequencies: [],
    loading_saving_frequencies: false,
    saving_frequencies_error: null,
    savings_application: {},
    user_savings: [],
    loading_user_savings: false,
    user_savings_error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_SAVINGS_PRODUCTS: {
            return {
                ...state,
                loading_savings_products: true,
                savings_products_error: null
            }
        }
        case LOAD_SAVINGS_PRODUCTS: {
            let savings_product_data = [...action.options];
            let savings_products = [];

            savings_product_data.forEach(product => {
                
                let product_data = {
                    id: product.id,
                    name: product.name||"",
                    min_amount: product.min_amount||0,
                    max_amount: product.max_amount||0,
                    description: product.description||"",
                    interest_rate: product.interest_rate||0,
                    withholding_tax_rate: parseFloat(product.taxRate),
                    penal_charge: product.penal_charge || product.penal_charge_rate||0,
                    lock_on_create: product.lock_on_create||false,
                    is_fixed: product.is_fixed||false,
                    logo_url: product.logo_url,
                    tenor: [],
                    offers:[]
                   
                };
                
                    product.savingsProductRangeDtos.forEach(ofer=>{
                        product_data.offers.push( {
                            min_amount:ofer.minimumAmount||0,
                            max_amount:ofer.maximumAmount||0,
                            interest_rate:parseFloat(ofer.interestRate||0),
                            tenor_period:ofer.tenorPeriod||"days",
                            interest_period:ofer.interestPeriod||"years",
                            interestPeriod:ofer.interestPeriod||"years",
                            tenorPeriod:ofer.tenorPeriod||"days",
                            tenordescription:ofer.tenordescription||"",
                            is_fixed:ofer.isFixed||false,
                            min_tenor:parseInt(ofer.tenorStart||0),
                            max_tenor:parseInt(ofer.tenorEnd||0),
                            is_locked:ofer.isLocked||false,
                            // withholding_tax:ofer.
                            ...ofer
                        } )
                    })

                // let product_tenors = product.tenor.sort((a, b) => a.value - b.value);
                // product_tenors.forEach(tenor => {
                //     product_data.tenor.push({
                //         id: tenor.id,
                //         value: tenor.value
                //     });
                // });

                savings_products.push(product_data);
            });


            return {
                ...state,
                savings_products,
                loading_savings_products: false,
                savings_products_error: null
            }
        }
        case LOAD_SAVINGS_PRODUCTS_FAILED: {
            return {
                ...state,
                loading_savings_products: false,
                savings_products_error: action.error_message
            }
        }
        case START_LOAD_SAVINGS_COLLECT_MODES: {
            return {
                ...state,
                loading_collection_modes: true,
                collection_modes_error: null
            }
        }
        case LOAD_SAVINGS_COLLECT_MODES: {
            let collection_mode_data = [...action.options];
            let collection_modes = [];

            console.log("few#RR",collection_mode_data);

            collection_mode_data.forEach(mode => {
                let mode_data = {
                    id: mode.id,
                    name: mode.name,
                    description: mode.description,
                    slug: mode.name.toLowerCase().trim()
                };

                collection_modes.push(mode_data);
            });

            return {
                ...state,
                collection_modes,
                loading_collection_modes: false,
                collection_modes_error: null
            }
        }
        case LOAD_SAVINGS_COLLECT_MODES_FAILED: {
            return {
                ...state,
                loading_collection_modes: false,
                collection_modes_error: action.error_message
            }
        }
        case START_LOAD_SAVINGS_FREQUENCIES: {
            return {
                ...state,
                loading_saving_frequencies: true,
                saving_frequencies_error: null
            }
        }
        case LOAD_SAVINGS_FREQUENCIES: {
            let frequency_data = [...action.options];
            let saving_frequencies = [];

            frequency_data.forEach(frequency => {
                let mode_data = {
                    id: frequency.id,
                    name: frequency.frequency,
                    description: frequency.description||"",
                    slug: frequency.frequency.toLowerCase().trim()
                };

                saving_frequencies.push(mode_data);
            });

            return {
                ...state,
                saving_frequencies,
                loading_saving_frequencies: false,
                saving_frequencies_error: null
            }
        }
        case LOAD_SAVINGS_FREQUENCIES_FAILED: {
            return {
                ...state,
                loading_saving_frequencies: false,
                saving_frequencies_error: action.error_message
            }
        }
        case UPDATE_APPLICATION: {
            let savings_application = { ...state.savings_application, ...action.application_data }
            return {
                ...state,
                savings_application
            }
        }
        case RESET_APPLICATION: {
            return {
                ...state,
                savings_application: {}
            }
        }
        case START_LOAD_USER_SAVINGS: {
            return {
                ...state,
                loading_user_savings: true,
                user_savings_error: null
            }
        }
        case LOAD_USER_SAVINGS: {
            let user_savings_data = [...action.user_savings];
            let user_savings = [];

            user_savings_data.forEach(savings => {
                let archived=savings.achieveStatus && savings.achieveStatus=="A"?true:false;
                let status=savings.status ==="ACTIVE" ? 1 : savings.status === "IN_ARREARS" ? 2 : 0;
                let savings_data = {
                    id: savings.ID,
                    status,
                    name: savings.savingsName ?? savings.productName,
                    periodic_amount: savings.periodic_amount||0,
                    target: savings.target||0,
                    isCollectionAuto:savings.isCollectionAuto,
                    balance: savings.balance||0,
                    interest_rate: savings.interestRate||10,
                    // status: savings.status||true,
                    start_date: savings.startDate||"18-08-2022",
                    end_date: savings.endDate||"18-08-2022",
                    locked: savings.isLocked||false,
                    archived,
                    is_fixed: savings.isFixed||false,
                    is_matured: savings.is_matured||false,
                    frequency: savings.frequency,
                    card: null,
                    account: savings.account||"",
                    penal_charge: savings.penal_charge || savings.penal_charge_rate||0,
                    data_sources: savings.data_sources||"",
                    tenor: savings.tenor_period||"year",
                    tenor_period: savings.tenor_period||"year",
                    interest_due_at_maturity: savings.interest_due_at_maturity||"0",
                    amount_at_maturity: savings.amountAtMaturity||"0",
                    witholding_tax: savings.WHT||"10%",
                    accrued_interest: savings.accruedInterest||0,
                    depositAmount: savings.depositAmount||0
                };
                user_savings.push(savings_data);
            });

            return {
                ...state,
                user_savings,
                loading_user_savings: false,
                user_savings_error: null
            }
        }
        case LOAD_USER_SAVINGS_FAILED: {
            return {
                ...state,
                loading_user_savings: false,
                user_savings_error: action.error_message
            }
        }
        case UPDATE_SAVINGS_ARCHIVED_STATUS: {
            let { user_savings } = state;
            user_savings.forEach((savings) => {
                if (savings.id === action.savings_id) {
                    savings.archived = action.archived ? 1 : 0;
                }
            });

            return {
                ...state,
                user_savings
            }
        }
        default: {
            return state;
        }
    }
};