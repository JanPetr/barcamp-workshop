function getMatchingAttributes(data) {
	var highlightedResults = data._highlightResult;
	if (!highlightedResults) {
		return {};
	}
	
	var matchingAttributes = {};
	_.each(highlightedResults, function (highlightValue, attributeName) {
		// Matching in a string attribute
		if (_.isObject(highlightValue) && highlightValue.matchLevel === 'full') {
			matchingAttributes[attributeName] = highlightValue.value;
			return;
		}
		// Matching in an array
		if (_.isArray(highlightValue)) {
			matchingAttributes[attributeName] = _.compact(_.map(highlightValue, function (matchValue) {
				if (matchValue.matchLevel === 'none') {
					return null;
				}
				return matchValue.value;
			}));
		}
	});
	
	return _.omitBy(matchingAttributes, _.isEmpty);
}

function getHighlightedValue(object, property) {
	if (!_.has(object, '_highlightResult.' + property + '.value')) {
		return object[property];
	}
	return object._highlightResult[property].value;
}

function cloudinary(url, options) {
	var baseUrl = 'http://res.cloudinary.com/pixelastic-marvel/image/fetch/';
	var stringOptions = [];
	
	// Handle common Cloudinary options
	if (options.width) {
		stringOptions.push('w_' + options.width);
	}
	if (options.height) {
		stringOptions.push('h_' + options.height);
	}
	if (options.quality) {
		stringOptions.push('q_' + options.quality);
	}
	if (options.crop) {
		stringOptions.push('c_' + options.crop);
	}
	if (options.format) {
		stringOptions.push('f_' + options.format);
	}
	if (options.colorize) {
		stringOptions.push('e_colorize:' + options.colorize);
	}
	if (options.color) {
		stringOptions.push('co_rgb:' + options.color);
	}
	if (options.gravity) {
		stringOptions.push('g_' + options.gravity);
	}
	
	// Fix remote urls
	url = url.replace(/^\/\//, 'http://');
	
	return '' + baseUrl + stringOptions.join(',') + '/' + url;
}