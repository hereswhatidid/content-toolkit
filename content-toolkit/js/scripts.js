/*global ajaxurl: '', DEBUG: true, pager: {} */
if (typeof DEBUG === 'undefined') {
	window.DEBUG = true;
}
var PostTypes = '',
	temp;

(function( $, ko ) {

	$(document).ready( function() {
		var params = {
			'action': 'getposttypes'
		};
		$.ajax({
			method: 'POST',
			data: params,
			url: ajaxurl,
			dataType: 'json',
			success: function( result ) {
				temp = ko.mapping.fromJS( result, {} );

				if ( DEBUG ) {
					// console.log( temp );
					console.log( 'Results: ', result );
				}

				PostTypes = new PostTypesViewModel( result );

				pager.extendWithPage( PostTypes );

				ko.applyBindings( PostTypes, document.getElementById( 'devToolkitApp' ) );

				pager.start();
			},
			error: function( jqXHR, textStatus, errorMessage ) {
				console.log( 'Error: ', errorMessage );
			}
		});
	});
	/**
	 * Flags a view model object as dirty if any observable property within it is modified
	 * 
	 * @author Gabe Shackle <gabe@hereswhatidid.com>
	 * @param  object		root				The ViewModel to watch for changes
	 * @param  boolean		isInitiallyDirty	Whether or not the dirty flag should be true upon initialization
	 * @return object							The resulting observable property
	 */
	ko.dirtyFlag = function(root, isInitiallyDirty) {
		var result = function() {},
		_initialState = ko.observable(ko.toJSON(root)),
		_isInitiallyDirty = ko.observable(isInitiallyDirty);

		result.isDirty = ko.computed(function() {
			return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
		});

		result.reset = function() {
			_initialState(ko.toJSON(root));
			_isInitiallyDirty(false);
		};

		return result;
	};
	/**
	 * Creates a checkbox list that is bound to an observable array
	 * 
	 * @type Knockout Binding Handler
	 */
	ko.bindingHandlers.checkboxList = {
		init: function( element, valueAccessor, allBindingsAccessor ) {
			var observable = valueAccessor(),
				options = allBindingsAccessor(),
				inputs = element.getElementsByTagName( 'input' );


			for ( var i=0, max = inputs.length; i < max; i++ ) {
				if ( inputs[i].type === 'checkbox' ) {
					// checkboxes.push( inputs[i] );
					if ( observable.indexOf( inputs[i].value ) > -1 ) {
						inputs[i].checked = true;
					}

					ko.utils.registerEventHandler( inputs[i], "click", function () {
						var observable = valueAccessor(),
							newValue = $( this ).val();

						if ( this.checked ) {
							if ( observable.indexOf( this.value ) < 0 ) {
								observable.push( this.value );
							}
						} else {
							if ( observable.indexOf( this.value ) > -1 ) {
								observable.remove( this.value );
							}
						}
						// observable( newValue );
						if ( DEBUG ) {
							console.log( 'Checked: ', this.checked );
						}
					});
				}
			}

			// if ( DEBUG ) {

			// 	console.log( 'Inputs: ', inputs );
			// 	console.log( 'Element: ', element );
			// 	console.log( 'Observable: ', observable() );
			// 	console.log( 'Fields: ', checkboxes );
			// }

		},
		update: function( element, valueAccessor, allBindingsAccessor ) {
			var observable = valueAccessor(),
				options = allBindingsAccessor(),
				inputs = element.getElementsByTagName( 'input' );


			for ( var i=0, max = inputs.length; i < max; i++ ) {
				if ( inputs[i].type === 'checkbox' ) {
					if ( observable.indexOf( inputs[i].value ) > -1 ) {
						inputs[i].checked = true;
					}
				}
			}

			if ( DEBUG ) {
				console.log( 'Observable: ', observable() );
			}
		}
	}
	/**
	 * Custom binding handler to handle select boxes that contain an "other" option
	 * 
	 * @type Knockout Binding Handler
	 */
	ko.bindingHandlers.selectWithOther = {
		init: function( element, valueAccessor, allBindingsAccessor ) {
			//initialize datepicker with some optional options
			var observable = valueAccessor(),
				options = allBindingsAccessor().selectWithOtherOptions,
				selectInput = {},
				textInput = {},
				interceptor = ko.computed({
					read: function() {
						return observable().toString();
					},
					write: function(newValue) {
						if ( newValue === "true" ) {
							observable( true );
						} else if ( newValue === "false" ) {
							observable( false );
						} else {
							observable( newValue );
						}
					}
				});
			
			if ( options !== 'undefined' ) {
				element.selectInput = $( options.selectField )[0];
				if ( element.selectInput.length === 0 ) {
					element.selectInput = $( element ).find( 'select' )[0];
				}
				element.textInput = $( options.textField )[0];
				if ( element.textInput.length === 0 ) {
					element.textInput = $( element ).find( 'input[type="text"]' )[0];
				}
			} else {
				element.selectInput = $( element ).find( 'select' )[0];
				element.textInput = $( element ).find( 'input[type="text"]' )[0];
			}

			// Set the initial value
			for ( var i=0; i<element.selectInput.options.length; i++ ) {
				if ( element.selectInput.options[i].value === observable().toString() ) {
					element.selectInput.selectedIndex = i;
					element.textInput.disabled = true;
					break;
				}
			}
			if ( element.textInput.disabled ) {
				$( element.selectInput ).val( observable().toString() );
			} else {
				$( element.selectInput ).val( 'other' );
				$( element.textInput ).val( observable().toString() );
			}
			
			// handle the field changing
			ko.utils.registerEventHandler( element.selectInput, "change", function () {
				var observable = valueAccessor(),
					newValue = $( this ).val();

				if ( newValue !== 'other' ) {
					observable( newValue );
					element.textInput.disabled = true;
				} else {
					observable( $( element.textInput ).val() );
					element.textInput.disabled = false;
				}

			});
			ko.utils.registerEventHandler( textInput, "change", function () {
				var observable = valueAccessor(),
					newValue = $( this ).val();

				observable( newValue );
			});

			ko.applyBindingsToNode(element, { value: interceptor });

		},
		update: function( element, valueAccessor, allBindingsAccessor ) {
			var observable = valueAccessor(),
				options = allBindingsAccessor().selectWithOtherOptions,
				selectInput = {},
				textInput = {};

			element.textInput.disabled = false;
			// Set the initial value
			for ( var i=0; i<element.selectInput.options.length; i++ ) {
				if ( element.selectInput.options[i].value === observable().toString() ) {
					element.selectInput.selectedIndex = i;
					element.textInput.disabled = true;
					break;
				}
			}
			if ( element.textInput.disabled ) {
				$( element.selectInput ).val( observable().toString() );
			} else {
				$( element.selectInput ).val( 'other' );
				$( element.textInput ).val( observable() );
			}
		}
	};

	ko.bindingHandlers.booleanValue = {
		init: function(element, valueAccessor, allBindingsAccessor) {
			var observable = valueAccessor(),
				interceptor = ko.computed({
					read: function() {
						return observable().toString();
					},
					write: function(newValue) {
						if ( newValue === "true" ) {
							observable( true );
						} else if ( newValue === "false" ) {
							observable( false );
						} else {
							observable( newValue );
						}
					}
				});
			
			ko.applyBindingsToNode(element, { value: interceptor });
		}
	};

	var PostTypeMapping = {
		'postTypes': {
			create: function( data ) {
				
				return new PostTypeViewModel( data.data );
			}
		}
	}

	var PostTypeViewModel = function( data ) {

		ko.mapping.fromJS( data, {}, this );

		this.originalPostData = data;

		this.editPostType = function( koObject, event ) {
			PostTypes.posttypeedit( koObject );
		}

		this.revertPostType = function( koObject, event ) {
			if ( DEBUG ) {
				console.log( 'Revert data:', ko.mapping.fromJS( this.originalPostData, {}, this ) );
			}

			ko.mapping.fromJS( this.originalPostData, {}, this );
		}

		this.source = ko.computed( function() {
			if ( this._builtin() === true ) {
				return 'Core';
			} else {
				return 'Plugin';
			}
		}, this );

		this.dirtyFlag = ko.dirtyFlag( this, false );
	}

	var PostTypesViewModel = function( data ) {
		var self = this;

		// ko.mapping.fromJS( data, PostTypeMapping, this );

		self.originalPostData = ko.mapping.fromJS( data, PostTypeMapping );

		self.modifiedPostTypes = ko.observableArray();

		self.posttypeedit = ko.observable();

		self.postTypes = ko.observableArray( ko.utils.arrayMap( data.postTypes, function( postType ) {
			return new PostType( postType );
		}));

		// console.log( 'Post types: ', self.postTypes() );

		self.isDetailView = ko.observable( false );

		self.postTypeName = ko.observable();

		self.postTypeName.subscribe( function( newValue ) {
			self.posttypeedit( self.getByName( newValue ) );
			// console.log( 'Update to: ', newValue );
		} );

		self.addSupports = function( koObject, event, d ) {

			if ( self.posttypeedit().supports.indexOf( event.target.value ) !== -1 ) {
				self.posttypeedit().supports.remove( event.target.value );
			} else {
				self.posttypeedit().supports.push( event.target.value );
			}

			return true;

		}

		self.addTaxonomy = function( koObject, event, d ) {

			if ( self.posttypeedit().taxonomies.indexOf( event.target.value ) !== -1 ) {
				self.posttypeedit().taxonomies.remove( event.target.value );
			} else {
				self.posttypeedit().taxonomies.push( event.target.value );
			}

			return true;
		}

		self.getByName = function( postTypeName ) {
			var match = ko.utils.arrayFirst( self.postTypes(), function( item ) {
				return postTypeName === item.postType();
			});

			return match;
		}

		self.editPostType = function( koObject, event ) {
			self.posttypeedit( koObject );
			$('.tooltip-item').tooltip()
			return true;
		}

		self.setEditMode = function( page ) {
			self.isDetailView( page.page.currentId !== 'viewall' );
			// console.log( 'Page is: ', page.page.currentId );
		}

		self.clearEditPostType = function( koObject, event ) {
			self.posttypeedit( null );
		}
	}

})( jQuery, ko );