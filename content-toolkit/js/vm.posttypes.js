var PostTypes = function( postTypes ) {
	this.postTypes = ko.observableArray( ko.utils.arrayMap( postTypes, function( postType ) {
		return new PostType( postType );
	}));
}