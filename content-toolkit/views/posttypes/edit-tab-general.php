<div class="row">
	<div class="col-lg-3">
		<label for="post-type-name"><?php _e( 'Post Type Name', $this->plugin_slug ); ?></label>
		<input id="post-type-name" type="text" class="form-control" data-bind="value: name">
		<span class="help-block"><?php _e( 'Post type. (max. 20 characters, can not contain capital letters or spaces)', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-label"><?php _e( 'Post Type Label', $this->plugin_slug ); ?></label>
		<input id="post-type-label" type="text" class="form-control" data-bind="value: label">
		<span class="help-block"><?php _e( 'A plural descriptive name for the post type marked for translation.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-6">
		<label for="post-type-description"><?php _e( 'Description', $this->plugin_slug ); ?></label>
		<textarea id="post-type-description" class="form-control" name="post-type-description" rows="3" data-bind="value: description"></textarea>
		<span class="help-block"><?php _e( 'A short descriptive summary of what the post type is.', $this->plugin_slug ); ?></span>
	</div>
</div>