
var search = instantsearch({
	appId: 'Y0GJQYP2P4',
	apiKey: '0857228f7871c2e81c6e86135a14ddbd',
	indexName: 'marvel',
	urlSync: true
});

search.addWidget(instantsearch.widgets.searchBox({
	container: '#q',
	placeholder: 'Search for any character, power, secret identity'
}));

var hitTemplate = $('#hitTemplate').html();
search.addWidget(instantsearch.widgets.hits({
	container: '#hits',
	hitsPerPage: 10,
	templates: {
		item: hitTemplate
	},
	transformData: {
		item: transformItem
	}
}));

function transformItem(data) {
	// Thumbnail
	var thumbnail = _.get(data, 'images.thumbnail');
	if (thumbnail) {
		thumbnail = cloudinary(thumbnail, {
			width: 200,
			quality: 90,
			crop: 'scale',
			format: 'auto'
		});
	} else {
		thumbnail = './css/img/hit-default.jpg';
	}
	
	// Background image
	var background = _.get(data, 'images.background');
	if (background) {
		var backgroundOptions = {
			width: 450,
			quality: 90,
			crop: 'scale',
			format: 'auto'
		};
		background = cloudinary(background, backgroundOptions);
	} else {
		background = './css/img/profile-bg-default.gif';
	}
	
	// If the match is not obvious (not in the name of description), we display
	// where it is found
	var matchingAttributes = getMatchingAttributes(data);
	var readableMatchingAttributes = [];
	var isFoundInName = _.has(matchingAttributes, 'name');
	var isFoundInDescription = _.has(matchingAttributes, 'description');
	if (!isFoundInName && !isFoundInDescription) {
		(function () {
			// Merging aliases and secret identities
			var hasAliases = _.has(matchingAttributes, 'aliases');
			var hasSecretIdentities = _.has(matchingAttributes, 'secretIdentities');
			if (hasAliases || hasSecretIdentities) {
				matchingAttributes.aliases = _.concat(_.get(matchingAttributes, 'aliases', []), _.get(matchingAttributes, 'secretIdentities', []));
				delete matchingAttributes.secretIdentities;
			}
			
			var readableTitles = {
				aliases: 'Also known as',
				authors: 'Authors',
				powers: 'Powers',
				teams: 'Teams'
			};
			_.each(matchingAttributes, function (value, key) {
				if (_.isArray(value)) {
					value = value.join(', ');
				}
				readableMatchingAttributes.push({
					label: readableTitles[key],
					value: value
				});
			});
		})();
	}
	var isMatchingInNotDisplayedAttributes = !_.isEmpty(readableMatchingAttributes);
	
	return {
		uuid: data.objectID,
		highlightedName: getHighlightedValue(data, 'name'),
		highlightedDescription: getHighlightedValue(data, 'description'),
		thumbnail: thumbnail,
		background: background,
		matchingAttributes: readableMatchingAttributes,
		isMatchingInNotDisplayedAttributes: isMatchingInNotDisplayedAttributes
	};
}

search.addWidget(instantsearch.widgets.refinementList({
	container: '#teams',
	attributeName: 'teams',
	operator: 'and',
	limit: 10,
	sortBy: ['isRefined', 'count:desc', 'name:asc'],
	showMore: {
		limit: 20
	}
}));

search.addWidget(instantsearch.widgets.refinementList({
	container: '#powers',
	attributeName: 'powers',
	operator: 'and',
	limit: 10,
	sortBy: ['isRefined', 'count:desc', 'name:asc'],
	showMore: {
		limit: 20
	}
}));

search.addWidget(instantsearch.widgets.refinementList({
	container: '#authors',
	attributeName: 'authors',
	operator: 'and',
	limit: 10,
	sortBy: ['isRefined', 'count:desc', 'name:asc'],
	showMore: {
		limit: 20
	}
}));

search.addWidget(instantsearch.widgets.refinementList({
	container: '#species',
	attributeName: 'species',
	operator: 'or',
	limit: 10,
	sortBy: ['isRefined', 'count:desc', 'name:asc']
}));

search.addWidget(instantsearch.widgets.currentRefinedValues({
	container: '#current-refined-values',
	clearAll: 'before'
}));

search.addWidget(instantsearch.widgets.pagination({
	container: '#pagination',
	labels: {
		previous: '‹ Previous',
		next: 'Next ›'
	},
	showFirstLast: false
}));

search.addWidget(instantsearch.widgets.stats({
	container: '#stats'
}));

search.start();
