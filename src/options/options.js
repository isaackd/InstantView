function saveOptions() {
    return new Promise((resolve, reject) => {

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

        chrome.storage.local.set({iv_options: JSON.stringify(newOptions)}, function() {
            console.log("hey");
            resolve(newOptions);
        });

    });
}

function loadOptions() {

    return new Promise((resolve, reject) => {
        const form = document.forms["iv-options"];

        if (!form) {
            document.write("error");
            reject("Couldn\'t get form");
        }

        chrome.storage.local.get("iv_options", function(items) {
            console.log(JSON.parse(items.iv_options));

            const data = JSON.parse(items.iv_options);

            form[`theme-${data.theme}`].checked = true;
            form[`infopos-${data.infopos}`].checked = true;

            form.compact.checked = data.compact;
            form.christmas.checked = data.christmas;

        });

    });

}

loadOptions();
document.getElementsByClassName("save-options")[0].addEventListener("click", saveOptions);