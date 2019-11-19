const defaultState = {
    theme: "light",
    infoTop: false,

    miniPosition: "br",
    miniSize: 25,
    miniDefault: false,
    showDate: "top",

    customColors: false,
    customPrimary: "#252525",
    customSecondary: "#bababa",

    animationSpeed: 90,
    overlayedVisualizer: false,
    overlayOpacity: 0.7,
    backdropOpacity: 0,
    backdropColor: "#000000",

    titleCentered: false,
    commentBorders: false,
    commentSpacing: false,
    commentSeparation: false

};

export default function reducer(state, action) {
    if (action.type === "SET_OPTIONS" && Object.keys(action.payload).length > 0) {
        return Object.assign({}, state, action.payload);
    }
    return state ? state : defaultState;
}
