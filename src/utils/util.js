import moment from 'moment';
import analytics from '@react-native-firebase/analytics';

import { store } from '../redux/store/index';
import { AppEventsLogger } from 'react-native-fbsdk'
import { xor } from 'lodash';

if (!String.prototype.replaceAt) {
    String.prototype.replaceAt = function (index, character) {
        return this.substr(0, index) + character + this.substr(index + character.length);
    };
}

export const logEventData = async (event_name, additional_info) => {
    const user_data = store.getState().user.user_data;
    const event_data = { customer_id: user_data?.phone_hash, ...additional_info };

    console.log(
        'Logging event with name\n Name: ',
        event_name,
        ' Data:\n', JSON.stringify(event_data, null, 4)
    );
    await analytics().logEvent(event_name, event_data);
    AppEventsLogger.logEvent(event_name, event_data);
    console.log("EVENTLOGGED", event_name, event_data);
}

export const toTitleCase = (text) => {
    if(!text){
        return "--";
    }
    return text.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

export const toTitleLeadChar = (text) => {
    if(!text){
        return "--";
    }
    return text.split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

export const stripFirstZeroInPhone = (text) => {
    if(text.charAt( 0 ) === '0'){
        text = text.slice( 1 );
        text="234"+text;
    }
    return text;
}

export const returnNarration = (note,amount) => {
    //console.log("sdssds",amount)
    if(note){
        return note;
    }
    if(amount>=-5 && amount<=-0.75){
        return "VAT";
    }
    return "Transaction Charge";
  
}

export const maskToken = (seed) => {
    if (!seed)
        return '';

    var count = seed.length - 1;
    var start = count - 1;
    var marked = start - 7;

    for (var i = count; i >= 0; i--) {
        if (i < start && i > marked) {
            seed = seed.replaceAt(i, "*");
        }
    }

    return seed;
}

export const spacifyToken = (text, interval) => {
    if (!text)
        return '';

    text = text.toString().replace(/\D/g, '').replace(/\s+/g, '').trim();
    interval = isNaN(interval) || parseFloat(interval) < 2 ? 2 : parseFloat(interval);

    let regex = new RegExp(`(.{${interval}})`, 'g');
    return text.replace(regex, "$1 ").trim();
}

export const toCardDateInput = (text) => {
    if (!text)
        return '';

    text = text.toString().replace(/\s+/g, '').replace(/\D/g, '').trim();

    if (text.length > 2) {
        return text.replace(/(.{2})/g, "$1/").substr(0, 5);
    }
    else {
        return text;
    }
}

export const formatAmount = (amount) => {
    if (+amount) {
        return parseFloat(amount).toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    } else {
        return '0.00'
    }
}

export const isValidAmount = (amount) => {
    amount = "" + amount;
    return !isNaN(amount) && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
}

export const isValidEmail = (email) => {
    return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email));
}

export const isValidPhone = (phone) => {
    return (/^\d{11}$/.test(phone));
}

export const normalizeContactPhones = (phones) => {
    if (!phones) {
        return [];
    } else if (phones.length === 1) {
        return phones;
    } else if (phones.length > 1) {
        // Remove similarities
        let contact_phones = phones.filter((phone, index, self) =>
            index === self.findIndex((p) => (
                p.number.toString().replace(/\s+/g, '').trim() === phone.number.toString().replace(/\s+/g, '').trim()
            ))
        );

        return contact_phones;
    } else {
        // phones.length === 0
        return phones;
    }
}

export const fromNowDay = (date, format) => {
    return moment(date, format).calendar(null, {
        sameDay: '[Today] - DD MMM yy',
        lastDay: '[Yesterday] - DD MMM yy',
        lastWeek: 'dddd - DD MMM yy',
        sameElse: function () {
            return "dddd - DD MMM yy";
        }
    });
}

export const capitalizeFirstLetter=(string)=>{

    return string && string.length>0? string.charAt(0).toUpperCase()+string.slice(1):"";
}

export const dateGroupTransactions = (transactions) => {
    let transaction_groups = [];

    // Group per calendar date
    const per_day = transactions
        .reduce((per_day, transaction) => ({
            ...per_day,
            [fromNowDay(transaction.transaction_date)]:
                [...(per_day[fromNowDay(transaction.transaction_date)] || []), transaction]
        }), {});

    for (const calendar_day in per_day) {
        let transaction_group = {
            calendar_day,
            transaction_data: per_day[calendar_day]
        };
        transaction_groups.push(transaction_group);
    }

    return transaction_groups;
}


export const deeplinkRouteHandler = (path) => {

    let route = "Dashboard"
    switch (true) {
        case path.includes("/app"):
            route = "Dashboard"
        break;
        case path.includes("/saving"):
            route = "Savings"
        break;
        case path.includes("/document"):
        case path.includes("/document-kyc"):
        case path.includes("document"):
        case path.includes("kyc"):
            route = "Documents"
        break;
        case path.includes("/loan"):
            route = "Loans"
        break;
        default:
            route = "Login"
          break;
      }

    return route;
}

export const randomId = () =>
  String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );