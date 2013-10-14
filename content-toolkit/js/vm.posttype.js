/* globals ko: {}, DEBUG: true */
var PostTypeValues = function( data ) {
	this.postType = ko.observable( data.name );
	this.label = ko.observable( data.label );
	this.labels = {
		name: ko.observable( data.labels.name ),
		singularName: ko.observable( data.labels.singular_name ),
		menuName: ko.observable( data.labels.menu_name ),
		allItems: ko.observable( data.labels.all_items ),
		addNew: ko.observable( data.labels.add_new ),
		addNewItem: ko.observable( data.labels.add_new_item ),
		editItem: ko.observable( data.labels.edit_item ),
		newItem: ko.observable( data.labels.new_item ),
		viewItem: ko.observable( data.labels.view_item ),
		searchItems: ko.observable( data.labels.search_items ),
		notFound: ko.observable( data.labels.not_found ),
		notFoundInTrash: ko.observable( data.labels.not_found_in_trash ),
		parentItemColon: ko.observable( data.labels.parent_item_colon )
	};
	this.description = ko.observable( data.description );
	this.public = ko.observable( data.public );
	this.excludeFromSearch = ko.observable( data.exclude_from_search );
	this.publiclyQueryable = ko.observable( data.publicly_queryable );
	this.showUI = ko.observable( data.show_ui );
	this.showInNavMenus = ko.observable( data.show_in_nav_menus );
	this.showInMenu = ko.observable( data.show_in_menu );
	this.showInAdminBar = ko.observable( data.show_in_menu_bar );
	this.menuPosition = ko.observable( data.menu_position );
	this.menuIcon = ko.observable( data.menu_icon );
	this.capabilityType = ko.observable( data.capability_type );
	this.capabilities = {
		createPosts: ko.observable( data.cap.create_posts ),
		deleteOthersPosts: ko.observable( data.cap.delete_others_posts ),
		deletePost: ko.observable( data.cap.delete_post ),
		deletePosts: ko.observable( data.cap.delete_posts ),
		deletePrivatePosts: ko.observable( data.cap.delete_private_posts ),
		deletePublishedPosts: ko.observable( data.cap.delete_published_posts ),
		editOthersPosts: ko.observable( data.cap.edit_others_posts ),
		editPost: ko.observable( data.cap.edit_post ),
		editPosts: ko.observable( data.cap.edit_posts ),
		editPrivatePosts: ko.observable( data.cap.edit_private_posts ),
		editPublishedPosts: ko.observable( data.cap.edit_published_posts ),
		publishPosts: ko.observable( data.cap.publish_posts ),
		read: ko.observable( data.cap.read ),
		readPost: ko.observable( data.cap.read_post ),
		readPrivatePosts: ko.observable( data.cap.read_private_posts )
	};
	this.mapMetaCap = ko.observable( data.map_meta_cap );
	this.hierarchical = ko.observable( data.hierarchical );
	this.supports = ko.observableArray( data.supports );
	this.hasArchive = ko.observable( data.has_archive );
	this.rewrite = ko.observable( data.rewrite );
	this.rewriteArgs = {
		slug: ko.observable( data.rewrite_slug ),
		withFront: ko.observable( data.rewrite_with_front ),
		feeds: ko.observable( data.rewrite_feeds ),
		pages: ko.observable( data.rewrite_pages )
	};
	this.queryVar = ko.observable( data.query_var );
	this.canExport = ko.observable( data.can_export );
	this.dirtyFlag = ko.dirtyFlag( this, false );
	this.source = ko.observable( data.source );
	this.taxonomies = ko.observableArray( data.taxonomies );
	// this.originalPostData = ko.observable( data );
};
var PostType = function( data ) {
	var self = this;
	self.originalPostData = data;
	self.actualValue = ko.observable( new PostTypeValues( data ) );
	self.tempValue = ko.observable( new PostTypeValues( data ) );
	self.isDirty = ko.computed( function() {
		console.log( 'Update comparison!', ko.toJSON( self.actualValue ) !== ko.toJSON( self.tempValue ) );
		return ( ko.toJSON( self.actualValue ) !== ko.toJSON( self.tempValue ) );
	});
};
PostType.prototype.revertPostType = function( koObject, event ) {
	if ( window.confirm( 'Are you sure you want to revert this item?' ) ) {
		this.tempValue( new PostTypeValues( koObject.originalPostData ) );
	}
};