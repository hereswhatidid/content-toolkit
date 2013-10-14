<div data-bind="with: labels">
<div class="row">
	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-labelname">
			<?php _e( 'Name', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-labelname" name="post-type-labelname" class="form-control" data-bind="value: name">
		<span class="help-block"><?php _e( 'General name for the post type, usually plural.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-singular_name">
			<?php _e( 'Singular Name', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-singular_name" name="post-type-singular_name" class="form-control" data-bind="value: singularName">
		<span class="help-block"><?php _e( 'Name for one object of this post type.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-menu_name">
			<?php _e( 'Menu Name', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-menu_name" name="post-type-menu_name" class="form-control" data-bind="value: menuName">
		<span class="help-block"><?php _e( 'The menu name text.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-parent_item_colon">
			<?php _e( 'Parent Item', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-parent_item_colon" name="post-type-parent_item_colon" class="form-control" data-bind="value: parentItemColon">
		<span class="help-block"><?php _e( 'The parent text.', $this->plugin_slug ); ?></span>
	</div>

</div>
<div class="row">

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-all_items">
			<?php _e( 'All Items', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-all_items" name="post-type-all_items" class="form-control" data-bind="value: allItems">
		<span class="help-block"><?php _e( 'General name for the post type, usually plural.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-view_item">
			<?php _e( 'View Item', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-view_item" name="post-type-view_item" class="form-control" data-bind="value: viewItem">
		<span class="help-block"><?php _e( 'The view item text.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-add_new_item">
			<?php _e( 'Add New Item', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-add_new_item" name="post-type-add_new_item" class="form-control" data-bind="value: addNewItem">
		<span class="help-block"><?php _e( 'The add new item text.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-add_new">
			<?php _e( 'Add New', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-add_new" name="post-type-add_new" class="form-control" data-bind="value: addNew">
		<span class="help-block"><?php _e( 'The add new text.', $this->plugin_slug ); ?></span>
	</div>

</div>
<div class="row">

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-edit_item">
			<?php _e( 'Edit Item', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-edit_item" name="post-type-edit_item" class="form-control" data-bind="value: editItem">
		<span class="help-block"><?php _e( 'General name for the post type, usually plural.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-search_items">
			<?php _e( 'Search Items', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-search_items" name="post-type-search_items" class="form-control" data-bind="value: searchItems">
		<span class="help-block"><?php _e( 'The search items text.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-not_found">
			<?php _e( 'Not Found', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-not_found" name="post-type-not_found" class="form-control" data-bind="value: notFound">
		<span class="help-block"><?php _e( 'The not found text.', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">
		<label for="post-type-not_found_in_trash">
			<?php _e( 'Not Found in Trash', $this->plugin_slug ); ?>
		</label>
		<input type="text" id="post-type-not_found_in_trash" name="post-type-not_found_in_trash" class="form-control" data-bind="value: notFoundInTrash">
		<span class="help-block"><?php _e( 'The not found in trash text.', $this->plugin_slug ); ?></span>
	</div>

</div>
</div>