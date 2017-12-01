function saveOptions() {
    const form = document.forms["iv-options"];
    
    if (!form) {
        document.write("There was an error");
        return;
    }

    const data = new FormData(form);

    const newOptions = {};

    for (let opt of data.entries()) {
        newOptions[opt[0]] = opt[1];
    }

    newOptions["christmas"] = form.christmas.checked;
    newOptions["compact"] = form.compact.checked;

    localStorage.setItem("iv_options", JSON.stringify(newOptions));

    // https://stackoverflow.com/questions/29926598/sendmessage-from-popup-to-content-js-not-working-in-chrome-extension
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {message: "optionChange", data: newOptions});
    });
}

function loadOptions() {
    if (!localStorage.getItem("iv_options")) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, {message: "optionChange", data});
        });
        return;
    }

    const form = document.forms["iv-options"];
    
    if (!form) {
        document.write("There was an error");
        return;
    }

    const data = JSON.parse(localStorage.getItem("iv_options"));

    form[`theme-${data.theme}`].checked = true;
    form[`infopos-${data.infopos}`].checked = true;

    form.compact.checked = data.compact;
    form.christmas.checked = data.christmas;

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {message: "optionChange", data});
    });

}

loadOptions();
document.getElementsByClassName("save-options")[0].addEventListener("click", saveOptions);