const fs = require("fs");

fs.rename("manifest.json", "manifest.json.orig", err => {
	if (err) {
		throw err;
	}

	console.log("renamed it hhahah");
	const manifest = fs.readFileSync("manifest.json.orig", "utf8");
	const manifestJson = JSON.parse(manifest);

	delete manifestJson["key"];
	delete manifestJson["oauth2"];
	delete manifestJson["optional_permissions"];
	delete manifestJson["background"]["persistent"];

	const result = JSON.stringify(manifestJson, null, 4);
	fs.writeFileSync("manifest.json", result);
});
