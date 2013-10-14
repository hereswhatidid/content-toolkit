ko.bindingHandlers.slideVisible = {
	init  : function (element, valueAccessor) {
		// Initially set the element to be instantly visible/hidden depending on the value
		var value = valueAccessor();
		$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
	},
	update: function (element, valueAccessor) {
		// Whenever the value subsequently changes, slowly fade the element in or out
		var value = valueAccessor();
		ko.utils.unwrapObservable(value) ? $(element).slideDown(200) : $(element).slideUp(200);
	}
};

ko.bindingHandlers.fadeVisible = {
	init  : function (element, valueAccessor) {
		// Initially set the element to be instantly visible/hidden depending on the value
		var value = valueAccessor();
		$(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
	},
	update: function (element, valueAccessor) {
		// Whenever the value subsequently changes, slowly fade the element in or out
		var value = valueAccessor();
		ko.utils.unwrapObservable(value) ? $(element).stop( true, true ).fadeIn(200) : $(element).hide();
	}
};

var ResultViewModel = function (result) {
	this.selected = ko.observable(false);
	ko.mapping.fromJS(result.data, {}, this);
}

var controlsMappingOptions = {
	'result': {
		create: function (data) {
			return new ResultViewModel(data);
		}
	}
}

var partsMapping = {
	create: function( options ) {
		// console.log( 'new parts mapping' );
		return new partModel( options.data );
	}
}

var partModel = function( data ) {

	ko.mapping.fromJS( data, {}, this );

	this.detailView = ko.observable( false );
	
	this.quantity = ko.observable( 1 );

	this.relatedSeries = ko.computed( function() {
		if ( typeof this.relatedTo !== 'function' ) {
			return null;
		}
		return ko.utils.arrayFilter( this.relatedTo(), function( item ) {
			return item.type() == 1;
		});
	}, this );

	this.relatedModels = ko.computed( function() {
		if ( typeof this.relatedTo !== 'function' ) {
			return null;
		}
		return ko.utils.arrayFilter( this.relatedTo(), function( item ) {
			return item.type() == 2;
		});
	}, this );

	this.relatedParts = ko.computed( function() {
		if ( typeof this.relatedTo !== 'function' ) {
			return null;
		}
		return ko.utils.arrayFilter( this.relatedTo(), function( item ) {
			return item.type() == 3;
		});
	}, this );

	this.image1Thumb = ko.computed( function() {
		if ( typeof this.image1 !== 'function' ) {
			return null;
		}
		if ( this.image1() !== null ) {
			return this.image1().replace( 'orig', '400x200' );
		} else {
			return null;
		}
	}, this);

	this.image2Thumb = ko.computed( function() {
		if ( typeof this.image2 !== 'function' ) {
			return null;
		}
		if ( this.image2() !== null ) {
			return this.image2().replace( 'orig', '400x200' );
		} else {
			return null;
		}

	}, this);

	this.drawingThumb = ko.computed( function() {
		if ( typeof this.drawing !== 'function' ) {
			return null;
		}
		if ( this.drawing() !== null ) {
			return this.drawing().replace( 'orig', '400x200' );
		} else {
			return null;
		}
	}, this);

	this.generateSpecificationsTable = ko.computed( function() {
		var rows = [],
				output = '<table class="table table-bordered"><tbody>',
				arrSpecifications = [],
				rowString = '';

		if ( typeof this.specifications !== 'undefined' ) {
			arrSpecifications = this.specifications();
		}

		$.each( arrSpecifications, function( index, item ) {
			rowString += '<th class="row-title">' + item.label() + '</th><td>' + item.value() + ' ' + item.unit() + '</td>';
			if ( ( index % 2 ) == 1) {
				rows.push( rowString );
				rowString = '';
			}
		})
		if ( ( arrSpecifications.length % 2 ) === 1 ) {
			rowString += '<td colspan="2">&nbsp;</td>';
			rows.push( rowString );
		}
		output += rows.join( '</tr><tr>' ) + '</tbody></table>';
		return output;
//		for( var i= 0, max = arrSpecifications.length; i < max; i++ ) {
//			rows[Math.floor( i / 2 )] = [
//				{ label: arrSpecifications[i].}
//			];
//		}
//		return this.specifications();
	}, this);

}

var ControlsViewModel = function (data) {

	var self = this;

	self.pullingData = false;

//	self.showCustom = ko.observable( false );



	ko.mapping.fromJS(data, controlsMappingOptions, this);

	self.searchType = ko.observable('replacementPart');

	self.searchDelay = 0;

	self.parts = ko.observableArray();

	self.partDetails = ko.observableArray();

	self.partDetailsCache = [];

	self.partDetailsPrint = ko.observableArray( [] );
	self.printOptions = ko.observableArray( ['productdescription', 'specifications', 'drawings'] );



	self.searching = ko.observable(false);
	self.firstLoad = ko.observable(true);
	self.noResults = ko.observable(false);

	self.partType = ko.observable('unipunch');

	self.partTypeNames = {
		'unittool': 'Unittool',
		'strippit': 'Strippit',
		'pierce-all': 'Pierce-All'
	};

	self.systemType = ko.observable('cframetooling');



	self.searchUnitNumber = ko.observable('');
	self.searchPartNumber = ko.observable('');

	self.searchSubmittedPartType = ko.observable( '' );
	self.searchSubmittedTerm = ko.observable( '' );

	self.punchType = ko.observable();
	self.punchShapeType = ko.observable();

	self.materialType = ko.observable();
	self.holeShape = ko.observable();
	self.holeDiameter = ko.observable();
	self.holeShapedType = ko.observable();
	self.thickness = ko.observable();
	self.thicknessUnit = ko.observable('inches');
	self.shapeWidth = ko.observable(0);
	self.shapeHeight = ko.observable(0);

	self.tubingMax = ko.observable();
	self.notchingType = ko.observable();

	self.cutoffType = ko.observable();
	self.specialtyType = ko.observable();

	self.matchedHolders = ko.observableArray();

	self.mountingMethod = ko.observable();

	self.catalogTaxonomy = ko.observable();

	self.favoritesList = ko.observableArray( [] );

	self.favoritesListIds = ko.computed( function() {
		var arrResults = [];

		$.each( self.favoritesList(), function( index, object ) {
			arrResults.push( object.itemId() );
		} );

		return arrResults;
	} );

	self.favoritesListSend = ko.computed( function() {
		var arrResults = [];

		$.each( self.favoritesList(), function( index, object ) {
			arrResults.push( [ object.itemId(), object.quantity() ] );
		} );

		return arrResults;
	} );


	self.interchangeBrands = ko.observableArray();
	self.selectedInterchangeBrand = ko.observable();

	self.thicknessInchesValues = ko.observableArray([
		{ value: '0.03125', label: '0.03125"' },
		{ value: '0.040', label: '0.040"' },		
		{ value: '0.0625', label: '0.0625"' },
		{ value: '0.0937', label: '0.0937"' },
		{ value: '0.1250', label: '0.1250"' },
		{ value: '0.1562', label: '0.1562"' },
		{ value: '0.1875', label: '0.1875"' },
		{ value: '0.2187', label: '0.2187"' },
		{ value: '0.2500', label: '0.2500"' },
		{ value: '0.2812', label: '0.2812"' },
		{ value: '0.3125', label: '0.3125"' },
		{ value: '0.3437', label: '0.3437"' },
		{ value: '0.3750', label: '0.3750"' },
		{ value: '0.4062', label: '0.4062"' },
		{ value: '0.4375', label: '0.4375"' },

		{ value: '0.4687', label: '0.4687"' },
		{ value: '0.5000', label: '0.5000"' },
		{ value: '0.5312', label: '0.5312"' },
		{ value: '0.5625', label: '0.5625"' },
		{ value: '0.5937', label: '0.5937"' },
		{ value: '0.6250', label: '0.6250"' },
		{ value: '0.6562', label: '0.6562"' },
		{ value: '0.6875', label: '0.6875"' },
		{ value: '0.7187', label: '0.7187"' },
		{ value: '0.7500', label: '0.7500"' }
	]);

	self.thicknessInches = ko.observable(self.thicknessInchesValues()[0].value);

	self.thicknessMillimetersValues = ko.observableArray([
		{ value: '1', label: '1 mm' },
		{ value: '2', label: '2 mm' },
		{ value: '3', label: '3 mm' },
		{ value: '4', label: '4 mm' },
		{ value: '5', label: '5 mm' },
		{ value: '6', label: '6 mm' },
		{ value: '7', label: '7 mm' },
		{ value: '8', label: '8 mm' },
		{ value: '9', label: '9 mm' },
		{ value: '10', label: '10 mm' },
		{ value: '11', label: '11 mm' },
		{ value: '12', label: '12 mm' },
		{ value: '13', label: '13 mm' },
		{ value: '14', label: '14 mm' },
		{ value: '15', label: '15 mm' },
		{ value: '16', label: '16 mm' },
		{ value: '17', label: '17 mm' },
		{ value: '18', label: '18 mm' },
		{ value: '19', label: '19 mm' }
	]);

	self.thicknessMillimeters = ko.observable(self.thicknessMillimetersValues()[0].value);

	self.thicknessGaugeValues = ko.observableArray([
		{ value: '3', label: '3 Ga' },
		{ value: '4', label: '4 Ga' },
		{ value: '5', label: '5 Ga' },
		{ value: '6', label: '6 Ga' },
		{ value: '7', label: '7 Ga' },
		{ value: '8', label: '8 Ga' },
		{ value: '9', label: '9 Ga' },
		{ value: '10', label: '10 Ga' },
		{ value: '11', label: '11 Ga' },
		{ value: '12', label: '12 Ga' },
		{ value: '13', label: '13 Ga' },
		{ value: '14', label: '14 Ga' },
		{ value: '15', label: '15 Ga' },
		{ value: '16', label: '16 Ga' },
		{ value: '17', label: '17 Ga' },
		{ value: '18', label: '18 Ga' },
		{ value: '19', label: '19 Ga' },
		{ value: '20', label: '20 Ga' },
		{ value: '21', label: '21 Ga' },
		{ value: '22', label: '22 Ga' },
		{ value: '23', label: '23 Ga' },
		{ value: '24', label: '24 Ga' }
	]);

	self.thicknessGauge = ko.observable(self.thicknessGaugeValues()[0].value);

	self.thicknessUnit.subscribe( function( newValue ) {
		switch( newValue ) {
			case '37':
					self.thickness( self.thicknessInches() );
				break;
			case '38':
				self.thickness( self.thicknessMillimeters() );
				break;
			case '39':
				self.thickness( self.thicknessGauge() );
				break;
		}
	});

	self.thicknessInches.subscribe( function( newValue ) {
//		console.log( 'New inches value: ', newValue );
		self.thickness( newValue );
	});

	self.thicknessMillimeters.subscribe( function( newValue ) {
		self.thickness( newValue );
	});

	self.thicknessGauge.subscribe( function( newValue ) {
		self.thickness( newValue );
	});

	self.roundDiameters = ko.observableArray([
		{ value: '0.0937', label: '0.0937"' },
		{ value: '0.1250', label: '0.1250"' },
		{ value: '0.1562', label: '0.1562"' },
		{ value: '0.1875', label: '0.1875"' },
		{ value: '0.2187', label: '0.2187"' },
		{ value: '0.2500', label: '0.2500"' },
		{ value: '0.2812', label: '0.2812"' },
		{ value: '0.3125', label: '0.3125"' },
		{ value: '0.3437', label: '0.3437"' },
		{ value: '0.3750', label: '0.3750"' },
		{ value: '0.4062', label: '0.4062"' },
		{ value: '0.4375', label: '0.4375"' },
		{ value: '0.4687', label: '0.4687"' },
		{ value: '0.5000', label: '0.5000"' },
		{ value: '0.5312', label: '0.5312"' },
		{ value: '0.5625', label: '0.5625"' },
		{ value: '0.5937', label: '0.5937"' },
		{ value: '0.6250', label: '0.6250"' },
		{ value: '0.6562', label: '0.6562"' },
		{ value: '0.6875', label: '0.6875"' },
		{ value: '0.7187', label: '0.7187"' },
		{ value: '0.7500', label: '0.7500"' },
		{ value: '0.7812', label: '0.7812"' },
		{ value: '0.8125', label: '0.8125"' },
		{ value: '0.8437', label: '0.8437"' },
		{ value: '0.8750', label: '0.8750"' },
		{ value: '0.9062', label: '0.9062"' },
		{ value: '0.9375', label: '0.9375"' },
		{ value: '0.9687', label: '0.9687"' },
		{ value: '1.0000', label: '1.0000"' },
		{ value: '1.1250', label: '1.1250"' },
		{ value: '1.2500', label: '1.2500"' },
		{ value: '1.3750', label: '1.3750"' },
		{ value: '1.5000', label: '1.5000"' },
		{ value: '1.6250', label: '1.6250"' },
		{ value: '1.7500', label: '1.7500"' },
		{ value: '1.8750', label: '1.8750"' },
		{ value: '2.0000', label: '2.0000"' },
		{ value: '2.1250', label: '2.1250"' },
		{ value: '2.2500', label: '2.2500"' },
		{ value: '2.3750', label: '2.3750"' },
		{ value: '2.5000', label: '2.5000"' },
		{ value: '2.6250', label: '2.6250"' },
		{ value: '2.7500', label: '2.7500"' },
		{ value: '2.8750', label: '2.8750"' },
		{ value: '3.0000', label: '3.0000"' },
		{ value: '3.1250', label: '3.1250"' },
		{ value: '3.2500', label: '3.2500"' },
		{ value: '3.3750', label: '3.3750"' },
		{ value: '3.5000', label: '3.5000"' },
		{ value: '3.6250', label: '3.6250"' },
		{ value: '3.7500', label: '3.7500"' },
		{ value: '3.8750', label: '3.8750"' },
		{ value: '4.0000', label: '4.0000"' },
		{ value: '4.1250', label: '4.1250"' },
		{ value: '4.2500', label: '4.2500"' },
		{ value: '4.3750', label: '4.3750"' },
		{ value: '4.5000', label: '4.5000"' },
		{ value: '4.6250', label: '4.6250"' },
		{ value: '4.7500', label: '4.7500"' },
		{ value: '4.8750', label: '4.8750"' },
		{ value: '5.0000', label: '5.0000"' },
		{ value: 'Custom', label: 'Custom' }
	]);

	self.maxTubingDimensions = ko.observableArray([
		{ id: 0.5625, label: '9/16"' },
		{ id: 1, label: '1"' },
		{ id: 1.25, label: '1 1/4"' },
		{ id: 2.375, label: '2 3/8"' },
		{ id: 4, label: 'Custom' }
	]);

	self.notchingTypes = ko.observableArray([
		{ id: 27, label: 'Corner Notching' },
		{ id: 28, label: 'Edge Notching' },
		{ id: 29, label: 'Vee Notching' },
		{ id: 30, label: 'Radius Corners' },
		{ id: 31, label: 'Custom Notching' }
	]);

	self.cutoffTypes = ko.observableArray([
		{ id: 41, label: 'Angled' },
		{ id: 42, label: 'Flat Stock' },
		{ id: 43, label: 'Custom' }
	]);

	self.specialtyTypes = ko.observableArray([
		{ id: 44, label: 'Horizontal Punching' },
		{ id: 45, label: 'Close Center-to-Center' },
		{ id: 46, label: 'Unlimited Depth Punching' },
		{ id: 47, label: 'Feed Clearance Units' }
	]);

	self.accessoriesSharpen = ko.observableArray([
		{ id: '71', label: 'Punch & Die Sharpener' },
		{ id: '72', label: 'Grinding Wheel/Diamond Dresser' },
		{ id: '73', label: 'Spray Mist Attachment' },
		{ id: '74', label: 'Safety Shield' },
		{ id: '75', label: 'Punch & Die Gauges' }
	]);

	self.accessoriesPunchDieLife = ko.observableArray([
		{ id: '77', label: 'Punch Shims' },
		{ id: '78', label: 'Die Shims' }
	]);

	self.accessoriesUse = ko.observable('punchesanddies');

	self.accessoriesType = ko.observable();

	

	self.controlAreas = ko.dependentObservable(function () {
		var areas = ko.utils.arrayMap(self.result(), function (item) {
			return item.area();

		});
		return ko.utils.arrayGetDistinctValues(areas);
	}, self);

	self.searchType.subscribe(function () {
		self.hideDetails();
	});

	self.partType.subscribe(function () {
		self.searchUnitNumber('');
		self.searchPartNumber('');
	});

	self.searchUnitNumber.subscribe(function () {
		if (self.searchUnitNumber() !== '') {
			self.searchPartNumber('');
		}
	});

	self.searchPartNumber.subscribe(function () {
		if (self.searchPartNumber() !== '') {
			self.searchUnitNumber('');
		}

	});

	self.showCustom = ko.computed(function() {
		var holeShapeTrue = ( ( self.holeShapedType() ) && ( self.holeShapedType().taxonomyId() == '18' ) ),
				thicknessUnitTrue = ( ( self.thicknessUnit() ) && ( self.thicknessUnit() == '40' ) );
		return holeShapeTrue || thicknessUnitTrue;

	});

	self.resetSearch = function() {
		document.location.reload(true)
	}

	self.resetValues = function () {
		self.pullingData = false;

		ko.mapping.fromJS(data, controlsMappingOptions, this);

		self.searchType('replacementPart');

		self.parts();

		self.searching(false);
		self.noResults(false);

		self.partType('unipunch');
		self.systemType('cframetooling');

		self.searchUnitNumber('');
		self.searchPartNumber('');

		self.punchType();
		self.punchShapeType();

		self.materialType();
		self.holeShape();
		self.holeDiameter(0);
		self.thickness();
		self.thicknessUnit('37');
		self.shapeWidth(0);

		self.shapeHeight(0);
		self.matchedHolders();
		self.mountingMethod();
		self.accessoriesUse('punchesanddies');

//		console.log( 'reset!' );
	}

	self.hideDetails = function() {
		self.partDetails([]);
		$(document).trigger( 'parts-details-close' );
	}

	self.displayDetails = function( partId ) {
		// console.log( partId );
		postData = { itemId: partId };
		ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/searchResultsDetail';
		$(document).trigger( 'parts-details-start' );
		if ( typeof self.partDetailsCache[postData.itemId] !== 'undefined' ) {
			// console.log( 'load from cache!' );
			var tmpPart = ko.mapping.fromJS(self.partDetailsCache[postData.itemId], partsMapping);
			if ( typeof tmpPart === 'function' ) {
				self.partDetails(tmpPart());
			} else {
				self.partDetails([]);
			}

			console.log( 'Details: ', self.partDetails() );
		} else {
			$.ajax({
				type       : 'POST',
				data       : ko.toJSON( postData ),
				contentType: "application/json",
				dataType   : "json",
				url        : ajaxUrl,
				success    : function (data) {
					console.log( 'Success getting details!', data );

					self.partDetailsCache[postData.itemId] = data.result;
					var tmpPart = ko.mapping.fromJS(data.result, partsMapping);

					if ( typeof tmpPart === 'function' ) {
						self.partDetails(tmpPart());
					} else {
						self.partDetails([]);
					}
				},
				error: function() {
					console.log( 'there was an error!' );
				}
			})
			
		}
		// searchResultsDetail
		// this.detailView( ! this.detailView() );
	}


	self.updateResults = function (data, e) {
//		console.log( 'Update results!' );
		if (!self.pullingData) {
			var params = {},
					ajaxUrl = '';
			self.pullingData = true;
			switch (self.searchType()) {
				case 'replacementPart':
					ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upReplacementPartSearch';
					params.searchUnitNumber = self.searchUnitNumber();
					params.searchPartNumber = self.searchPartNumber();
					params.partType = self.partType();
					self.searchSubmittedPartType( self.partType() );
					self.searchSubmittedTerm( self.searchUnitNumber() );
					break;
				case 'toolingOptions':
					ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upToolingSearch';
					params.punchType = self.punchType().taxonomyId();
					params.materialType = ( self.materialType() ) ? ( self.materialType().taxonomyId() ) : 0;
					params.thickMeasure = self.thicknessUnit();
					params.thickValue = self.thickness();
					params.shapeType = ( self.holeShape() === 'round' ) ? 8 : 9;
					params.holeShape = ( self.holeShapedType() ) ? ( self.holeShapedType().taxonomyId() ) : 0;
					params.roundDiameter = self.holeDiameter();

//				params.holeShape = self.holeShape();
					params.holeWidth = self.shapeWidth();
					params.holeLength = self.shapeHeight();
					params.tubingMax = self.tubingMax().id;
					params.notchingType = self.notchingType().id;
					params.cutoffType = self.cutoffType().id;
					params.specialtyType = self.specialtyType().id;
					self.searchSubmittedPartType( '' );
					self.searchSubmittedTerm( '' );
					break;
				case 'mountingSystem':
					ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upTaxonomySearch';
//				console.log( self.mountingMethod() );
					params.taxonomyId = [ Math.floor( self.mountingMethod().taxonomyId() ) ];
					self.searchSubmittedPartType( '' );
					self.searchSubmittedTerm( '' );
					break;
				case 'accessories':
					ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upTaxonomySearch';
//				console.log( self.mountingMethod() );
					params.taxonomyId = [ Math.floor( self.accessoriesType().id )];
					self.searchSubmittedPartType( '' );
					self.searchSubmittedTerm( '' );
					break;
				case 'catalog':

					if ( typeof self.catalogTaxonomy() === 'string' ) {
						ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upInterchangeBrandSearch';
						params.brand = self.catalogTaxonomy();
					} else {
						ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upTaxonomySearch';
						params.taxonomyId = self.getTaxonomyIds( self.catalogTaxonomy() );
					}

					self.searchSubmittedPartType( '' );
					self.searchSubmittedTerm( '' );

					break;
			}

//			public int punchType { get; set; }
//			public int materialType { get; set; }
//			public int thickMeasure { get; set; }
//			public double thickValue { get; set; }
//			public int shapeType { get; set; }
//			public double roundDiameter { get; set; }
//			public int holeShape { get; set; }
//			public double holeWidth { get; set; }
//			public double holeLength { get; set; }
//			public double tubingMax { get; set; }
//			public int notchingType { get; set; }
//			public int cutoffType { get; set; }
//			public int specialtyType { get; set; }

//			console.log('Params: ', params);
//			console.log('URL: ', ajaxUrl);

//            console.log( self.searchUnitNumber() );


//			if (( self.searchUnitNumber() !== '' ) || ( self.searchPartNumber() !== '' )) {

//							self.searching( true );
			$(document).trigger('parts-data-start');
			// console.log( ko.toJSON( params ) );
			// console.log( 'AJAX Url: ', ajaxUrl );
			self.firstLoad( false );
			self.searching(true);
			$.ajax({
				type       : 'POST',
				data       : ko.toJSON(params),
				contentType: "application/json",
				dataType   : "json",
				url        : ajaxUrl,
				success    : function (data) {
					console.log( 'Results: ', data );

					var tmpParts = ko.mapping.fromJS(data.result, partsMapping);
					self.searching(false);

					if ( typeof tmpParts === 'function' ) {
						self.parts(tmpParts());
					} else {
						self.parts([]);
					}

					if ( self.parts().length === 1 ) {
						self.parts()[0].detailView( true );
					}

//					console.log( 'Length of results: ', self.parts().length );

					self.pullingData = false;
//					console.log('Found data: ', data);
					$(document).trigger('parts-data-loaded');
//						console.log('search complete');
				},
				error: function() {
					console.log( 'there was an error!' );
				}
			})
		} else {
			self.pullingData = false;
		}

	}

	self.getByArea = function (areaLabel) {
		var results = [],
				isArraySearch = areaLabel instanceof Array;

		ko.utils.arrayForEach(this.result(), function (item) {
			if ( isArraySearch ) {
				for (var i= 0, max = areaLabel.length; i< max; i += 1) {
					if ( item.area() == areaLabel[i] ) {
						results.push( item );
					}
				}
			} else {
				if ( ( item.area() === areaLabel ) || ( areaLabel === 'all' ) ) {
					results.push( item );
				}
			}
		});

		return results;
	}

	self.getById = function( taxonomyId ) {
		var results = [];

		ko.utils.arrayForEach( this.result(), function( item ) {
//			console.log( 'Tax: ', item.taxonomyId() === taxonomyId );
			if ( item.taxonomyId() === taxonomyId ) {
//				results.push( item );
				results = item;
			}
		})

		return results;
	}

	self.getTaxonomyIds = function( objectArray ) {
		var result = [];
		result.push( objectArray.taxonomyId() );
		// if ( typeof objectArray === 'object' ) {
		// 	$.each( objectArray, function( index, value ) {
		// 		result.push( value.taxonomyId() );
		// 	});
		// } else {
		// 	return false;
		// }

		return result;
	}

	self.setPunchShapeType = function (controlItem) {
		self.punchShapeType(controlItem);
	}

	self.setMountingMethod = function (controlItem) {
		self.mountingMethod(controlItem);
	}

	self.setPunchType = function (controlItem) {
		self.punchType(controlItem);
	}

	self.setThickness = function (controlItem) {
		self.thickness(controlItem);
	}

	self.setTubingMax = function (controlItem) {
		self.tubingMax(controlItem);
	}

	self.setNotchingType = function (controlItem) {
		self.notchingType(controlItem);
	}

	self.setCutoffType = function (controlItem) {
		self.cutoffType(controlItem);
	}

	self.setSpecialtyType = function (controlItem) {
		self.specialtyType(controlItem);
	}

	self.setAccessoriesType = function (controlItem) {
		self.accessoriesType(controlItem);
	}

	self.selectedControls = ko.computed(function () {
		return ko.utils.arrayFilter(this.result(), function (item) {
			return item.selected();
		});
	}, self);

	self.setCatalogTaxonomies = function( controlItem, e ) {
		switch( controlItem.taxonomyId() ) {
			case 25:
				location = '/SystemCapabilities/TypicalWorkDone/Forming.aspx';
				return;
				break;
		}
		if ( ( typeof controlItem ) === 'string' ) {

		}

//		console.log( 'Test value: ', controlItem );
//		
		self.catalogTaxonomy( controlItem );

		// if ( self.catalogTaxonomy.indexOf( controlItem ) !== -1 ) {
		// 	self.catalogTaxonomy.remove( controlItem );
		// } else {
		// 	self.catalogTaxonomy.push( controlItem );
		// }

//		self.getTaxonomyIds( self.catalogTaxonomy() );

		clearTimeout( self.searchDelay );
		self.searchDelay = setTimeout( function() {
			self.updateResults();
		}, 500);

	}

	self.addToFavorites = function( controlItem, e ) {

		console.log( 'Add to favorites: ', self.favoritesListIds().indexOf( controlItem.itemId() ) );

		var tmpPart = ko.mapping.fromJS(controlItem, partsMapping);

		// console.log( 'Add to favorites!', self.favoritesListIds().indexOf( tmpPart.itemId() ) );

		if ( self.favoritesListIds().indexOf( tmpPart.itemId() ) !== -1 ) {
			self.favorites.remove( tmpPart );
		} else {
			self.favorites.add( tmpPart );			
		}

		
		if ( ! auth ) {
			$.cookie( 'partsbook_favorites', self.favoritesListIds() );
		} else {
			$.removeCookie('partsbook_favorites');
		}
		
	}

	/**
	 *
	 * @returns {*}
	 */
	self.getSpecification = function (data, specName, strBefore, strAfter) {
		var result = '';

		if (typeof strBefore === 'undefined') {
			strBefore = '';
		}
		if (typeof strAfter === 'undefined') {
			strAfter = '';
		}
		$.each(data.specifications(), function (index, element) {

			if (element.label() === specName) {

				result = strBefore + element.value() + element.unit() + strAfter;
			}
		});
//        data.specifications() );
		return result;
	}

	self.getItemNumber = function( data, parent ) {
		var result = '';

		switch( parent.type() ) {
				case 1:
				case 3:
					result = data.itemNumber1();
					break;
				case 2:
					result = data.itemNumber2();
					break;
		}

		return result;
	}

	self.favorites = {
		init: function( ) {

			if ( ( auth ) && ( $.cookie( 'partsbook_favorites' ) !== undefined ) ) {

				var ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/searchResults',
					params = { itemIds: $.cookie( 'partsbook_favorites' ).split( ',' ) };

				$.ajax({
					type       : 'POST',
					data       : ko.toJSON( params ),
					contentType: "application/json",
					dataType   : "json",
					url        : ajaxUrl,
					success    : function ( data ) {

						$(document).trigger( 'favorites-initialized' );


						var tmpParts = ko.mapping.fromJS(data.result, partsMapping);
						self.searching(false);

						if ( typeof tmpParts === 'function' ) {
							self.favoritesList( tmpParts() );
						} else {
							self.favoritesList([]);
						}

						// $.removeCookie( 'partsbook_favorites' );

					},
					error: function() {
						// console.log( 'there was an error!' );
					}
				});
				
			} else {
				console.log( 'not cookie!' );
			}

		},
		add: function( model, e ) {
			self.favoritesList.push( model );
		},
		remove: function( model, e ) {
			// console.log( 'Remove item: ', self.favorites.getbyid( model.itemId() ) );
			self.favoritesList.remove( self.favorites.getbyid( model.itemId() ) );
		},
		save: function() {

			var ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upWishlistSave',
				params = { itemIds: self.favoritesListSend() };

			$.ajax({
				type       : 'POST',
				data       : ko.toJSON( params ),
				contentType: "application/json",
				dataType   : "json",
				url        : ajaxUrl,
				success    : function ( data ) {

					$(document).trigger( 'favorites-saved' );

				},
				error: function() {
					// console.log( 'there was an error!' );
				}
			});

		},
		load: function() {

			var ajaxUrl = '/DesktopModules/PartsBookFrontEnd/API/PartsBookFrontEnd/upWishlistSave',
				params = { itemIds: [] };

			$.ajax({
				type       : 'POST',
				data       : ko.toJSON( params ),
				contentType: "application/json",
				dataType   : "json",
				url        : ajaxUrl,
				success    : function ( data ) {

					$(document).trigger( 'favorites-loaded' );

					var tmpParts = ko.mapping.fromJS(data.result, partsMapping);
					self.searching(false);

					if ( typeof tmpParts === 'function' ) {
						self.favoritesList( tmpParts() );
					} else {
						self.favoritesList([]);
					}

				},
				error: function() {
					// console.log( 'there was an error!' );
				}
			});

		},
		getbyid: function( itemId ) {
			var foundItem = false;

			$.each( self.favoritesList(), function( index, object ) {
				if ( object.itemId() === itemId ) {
					foundItem = object;
				}
			} );

			return foundItem;

		},
		email: function() {
			location = '/EmailWishList.aspx';
		}
	}

	self.printDialog = {
		showHideList: function( model, e ) {
			var $self = $( e.target ),
				$parent = $self.parent( 'li' );

			$self
				.toggleClass( 'expanded' );
			$parent
				.find('ul')
				.slideToggle( 200 );
		},
		selectAll: function( model, e ) {
			var $self = $( e.target ),
				$parent = $self.closest( '.print-options' );

			self.printOptions([]);

			$parent
				.find( '.checkbox' )
				.removeClass( 'selected' )
				.addClass( 'selected' )
				.each( function( index, object ) {
					if ( $(object).data( 'option' ) !== undefined ) {
						self.printOptions.push( $(object).data( 'option' ) );
					}
				} );

		},
		deSelectAll: function( model, e ) {
			var $self = $( e.target ),
				$parent = $self.closest( '.print-options' );

			self.printOptions([]);

			$parent
				.find( '.checkbox' )
				.removeClass( 'selected' );

		},
		selectOption: function( model, e ) {
			var $self = $( e.target ),
				option = $self.data( 'option' );

			if ( $self.data( 'option' ) === undefined ) {
				return;
			}

			if ( self.printOptions.indexOf( option ) !== -1 ) {
				self.printOptions.remove( option );
			} else {
				self.printOptions.push( option );
			}

		},
		selectSubOptions: function( model, e ) {
			var $self = $( e.target ),
				$parent = $self.closest( 'li' );

			// self.printOptions([]);

			$self
				.toggleClass( 'selected' );

			if ( $self.hasClass( 'selected' ) ) {
				$parent
					.find( '.checkbox' )
					.removeClass( 'selected' )
					.addClass( 'selected' )
					.each( function( index, object ) {
						if ( $(object).data( 'option' ) !== undefined ) {
							self.printOptions.push( $(object).data( 'option' ) );
						}
					} );
			} else {
				$parent
					.find( '.checkbox' )
					.removeClass( 'selected' )
					.each( function( index, object ) {
						if ( $(object).data( 'option' ) !== undefined ) {
							self.printOptions.remove( $(object).data( 'option' ) );
						}
					} );
			}

		},
		openPrintView: function( model, e ) {
			self.partDetailsPrint( [model] );

			$('#printModal').modal('hide');
		}
	}

	self.findToolingOptions = function () {
//		console.log('Find tooling options!');
	}


	self.doAfterRender = function () {
//		console.log( 'Primary render' );
		setTimeout( function() {
			$(document).trigger('controls-loaded');
		}, 0);

	}

	self.afterDetailsRender = function() {
		$(document).trigger('details-rendered');
	}

	self.afterPartsRender = function () {
//		console.log( 'Rendered!' );

		setTimeout( function() {
			$(document).trigger('parts-rendered');
//			$(document).trigger('controls-loaded');
		}, 0);
	}

	self.afterDetailsPrintRender = function () {
//		console.log( 'Rendered!' );

		setTimeout( function() {
			$(document).trigger('details-print-rendered');
//			$(document).trigger('controls-loaded');
		}, 0);
	}


};