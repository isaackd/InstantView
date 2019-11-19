export function setOptions(newOptions) {
    if (!newOptions) throw new Error("Options must be provided to set");
    instantview.log(`SET_OPTIONS: ${JSON.stringify(newOptions)}`);

    return {
        type: "SET_OPTIONS",
        payload: newOptions
    };
}
