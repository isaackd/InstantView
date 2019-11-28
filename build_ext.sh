
#!/bin/bash

printf "Building for firefox or chrome? "
read browser

if [ $browser == "chrome" ] || [ $browser == "firefox" ]
then
	echo "Building for $browser..."
	# Remove any old builds
	rm dist.zip

	# Build the modal
	if [ $browser == "chrome" ]
	then
		cd src/modal && npm run build-cr
	else
		cd src/modal && npm run build-ff
	fi

	# Build the options page
	cd ../options && npm run build

	# Get back to the root
	cd ../..

	# Zip the result
	if [ $browser == "chrome" ]
	then
		zip -r dist.zip _locales icons images \
			libs manifest.json src/background.js \
			src/background_video_info.js src/datasource \
			src/iv.js src/modal/dist/js/bundle.js src/options/dist
	else
		node create_ff_manifest.js

		zip -r dist.zip _locales icons images \
			libs manifest.json src/background.js \
			src/background_video_info.js src/datasource \
			src/iv.js src/modal/dist/js/bundle.js src/options/dist

		rm -f manifest.json
		mv manifest.json.orig manifest.json
	fi

else
	echo "Invalid browser: '$browser'..."
fi
