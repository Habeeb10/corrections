import {
    START_LOAD_LOAN_PRODUCTS, LOAD_LOAN_PRODUCTS, LOAD_LOAN_PRODUCTS_FAILED,
    START_LOAD_SCORING_OPTIONS, LOAD_SCORING_OPTIONS, LOAD_SCORING_OPTIONS_FAILED,
    START_LOAD_LOAN_REASONS, LOAD_LOAN_REASONS, LOAD_LOAN_REASONS_FAILED,
    START_LOAD_USER_LOANS, LOAD_USER_LOANS, LOAD_USER_LOANS_FAILED,
} from '../types/loan_types';

const initialState = {
    loan_products: [],
    loading_loan_products: false,
    loan_products_error: null,
    scoring_options: [],
    loading_scoring_options: false,
    scoring_options_error: null,
    loan_reasons: [],
    loading_loan_reasons: false,
    loan_reasons_error: null,
    user_loans: [],
    loading_user_loans: false,
    user_loans_error: null,
    user_loan_profile: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_LOAN_PRODUCTS: {
            return {
                ...state,
                loading_loan_products: true,
                loan_products_error: null
            }
        }
        case LOAD_LOAN_PRODUCTS: {
            let loan_products = [...action.options];
            loan_products = loan_products.sort((a, b) => a.max_amount - b.max_amount);

            return {
                ...state,
                loan_products,
                loading_loan_products: false,
                loan_products_error: null
            }
        }
        case LOAD_LOAN_PRODUCTS_FAILED: {
            return {
                ...state,
                loading_loan_products: false,
                loan_products_error: action.error_message
            }
        }
        case START_LOAD_SCORING_OPTIONS: {
            return {
                ...state,
                loading_scoring_options: true,
                scoring_options_error: null
            }
        }
        case LOAD_SCORING_OPTIONS: {
            return {
                ...state,
                scoring_options: [...action.options],
                loading_scoring_options: false,
                scoring_options_error: null
            }
        }
        case LOAD_SCORING_OPTIONS_FAILED: {
            return {
                ...state,
                loading_scoring_options: false,
                scoring_options_error: action.error_message
            }
        }
        case START_LOAD_LOAN_REASONS: {
            return {
                ...state,
                loading_loan_reasons: true
            }
        }
        case LOAD_LOAN_REASONS: {
            let loan_reason_data = [...action.options];
            let loan_reasons = [];

            loan_reason_data.forEach(loan_reason => {
                try {
                    Image.prefetch(loan_reason.url);
                } catch (error) {
                    console.log(JSON.stringify(error, null, 4));
                }

                loan_reasons.push({
                    /* id: loan_reason.id,
                    code_description: loan_reason.code_description,
                    logo_url: loan_reason.url */
                    id: loan_reason.name,
                    code_description: loan_reason.name,
                    logo_url: loan_reason.url
                });
            });

            return {
                ...state,
                loan_reasons,
                loading_loan_reasons: false,
                loan_reasons_error: null
            }
        }
        case LOAD_LOAN_REASONS_FAILED: {
            return {
                ...state,
                loading_loan_reasons: false,
                loan_reasons_error: action.error_message
            }
        }
        case START_LOAD_USER_LOANS: {
            return {
                ...state,
                loading_user_loans: true,
                user_loans_error: null
            }
        }
        case LOAD_USER_LOANS: {
            let user_loan_data = [...action.user_loans];
            let user_loans = [];

            user_loan_data.forEach(user_loan => {
                let loan_data = {
                    id: user_loan.id,
                    tenor: user_loan.tenor,
                    tenor_period: user_loan.tenor_period,
                    interest_rate: user_loan.interest_rate,
                    loan_amount: user_loan.loan_amount,
                    interest_due: user_loan.interest_due,
                    paid: user_loan.paid,
                    status: user_loan.status.status,
                    status_slug: user_loan.status.status.replace(/\s+/g, '')?.toLowerCase(),
                    created_on: user_loan.created_on,
                    modified_on: user_loan.modified_on,
                    schedule: {
                        id: user_loan.schedule.id,
                        amount_due: user_loan.schedule.amount_due,
                        due_date: user_loan.schedule.due_date,
                        status: user_loan.schedule.status
                    },
                    loan_profile: {
                        purpose: user_loan.loan_profile.purpose,
                        proposed_payday: user_loan.loan_profile.proposed_payday,
                        personal_details: {
                            gender: user_loan.loan_profile.gender,
                            marital_status: user_loan.loan_profile.marital_status,
                            no_of_dependent: user_loan.loan_profile.no_of_dependent,
                            type_of_residence: user_loan.loan_profile.type_of_residence,
                            address: user_loan.loan_profile.address
                        },
                        employment_details: {
                            educational_attainment: user_loan.loan_profile.educational_attainment,
                            employment_status: user_loan.loan_profile.employment_status,
                            sector_of_employment: user_loan.loan_profile.sector_of_employment,
                            work_start_date: user_loan.loan_profile.work_start_date,
                            monthly_net_income: user_loan.loan_profile.monthly_net_income,
                            work_email: user_loan.loan_profile.work_email
                        }
                    }
                };

                if (user_loan.guarantor) {
                    loan_data.guarantor = {
                        id: user_loan.guarantor.id,
                        first_name: user_loan.guarantor.first_name,
                        last_name: user_loan.guarantor.last_name,
                        phone_number: user_loan.guarantor.phone_number,
                        email: user_loan.guarantor.email,
                        relationship: user_loan.guarantor.relationship,
                        loan_approval_link: user_loan.guarantor.loan_approval_link
                    };
                }

                user_loans.push(loan_data);
            });

            let latest_profile;
            if (user_loans.length > 0) {
                latest_profile = user_loans[0].loan_profile;
            }

            return {
                ...state,
                user_loans,
                user_loan_profile: latest_profile,
                loading_user_loans: false,
                user_loans_error: null
            }
        }
        case LOAD_USER_LOANS_FAILED: {
            return {
                ...state,
                loading_user_loans: false,
                user_loans_error: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};