const defaultState = {
	handlingSubscribeClick: false,
	handlingRateButtonClick: false
};

export default function reducer(state, action) {
    if (action.type === "SUBSCRIBE_CLICK_PENDING") {
        return Object.assign({}, state, {
        	handlingSubscribeClick: true
        });
    }
    else if (action.type === "SUBSCRIBE_CLICK_FULFILLED") {
        return Object.assign({}, state, {
        	handlingSubscribeClick: false
        });
    }
    else if (action.type === "SUBSCRIBE_CLICK_REJECTED") {
        return Object.assign({}, state, {
        	handlingSubscribeClick: false
        });
    }
    else if (action.type === "RATE_BUTTON_CLICK_PENDING") {
        return Object.assign({}, state, {
            handlingRateButtonClick: true
        });
    }
    else if (action.type === "RATE_BUTTON_CLICK_FULFILLED") {
        return Object.assign({}, state, {
            handlingRateButtonClick: false
        });
    }
    else if (action.type === "RATE_BUTTON_CLICK_REJECTED") {
        return Object.assign({}, state, {
            handlingRateButtonClick: false
        });
    }
    return state ? state : defaultState;
}