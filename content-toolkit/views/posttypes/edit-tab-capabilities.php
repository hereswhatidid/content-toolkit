<div class="row">
	<div class="col-lg-3">
		<label for="post-type-capability_type"><?php _e( 'Capability Type', $this->plugin_slug ); ?></label>
		<select id="post-type-capability_type" class="form-control" data-bind="value: capability_type">
			<option value="default"><?php _e( 'Default', $this->plugin_slug ); ?></option>
			<option value="none"><?php _e( 'None', $this->plugin_slug ); ?></option>
			<option value="custom"><?php _e( 'Custom', $this->plugin_slug ); ?></option>
			<?php
			$post_types = get_post_types();
			foreach( $post_types as $post_type ) {
				$post_type_object = get_post_type_object( $post_type );
				?>
				<option value="<?php echo $post_type; ?>"><?php echo $post_type_object->name; ?></option>
				<?php
			}
			?>
		</select>
		<span class="help-block"><?php _e( 'Triggers the handling of rewrites for this post type. To prevent rewrites, set to false.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3" data-bind="with: cap">
		<div class="form-group">
			<label for="post_type-create_posts"><?php _e( 'Create Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-create_posts" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) },
			value: create_posts" type="text" class="form-control">
		</div>
		<div class="form-group">
			<label for="post_type-edit_published_posts"><?php _e( 'Edit Published Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-edit_published_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: edit_published_posts">
		</div>
		<div class="form-group">
			<label for="post_type-publish_posts"><?php _e( 'Publish Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-publish_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: publish_posts">
		</div>
		<div class="form-group">
			<label for="post_type-read"><?php _e( 'Read', $this->plugin_slug ); ?></label>
			<input id="post-type-read" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: read">
		</div>
		<div class="form-group">
			<label for="post_type-read_post"><?php _e( 'Read Post', $this->plugin_slug ); ?></label>
			<input id="post-type-read_post" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: read_post">
		</div>
		<div class="form-group">
			<label for="post_type-read_private_posts"><?php _e( 'Read Private Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-read_private_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: read_private_posts">
		</div>
	</div>
	<div class="col-lg-3" data-bind="with: cap">
		<div class="form-group">
			<label for="post_type-delete_others_posts"><?php _e( 'Delete Others Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-delete_others_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: delete_others_posts">
		</div>
		<div class="form-group">
			<label for="post_type-delete_post"><?php _e( 'Delete Post', $this->plugin_slug ); ?></label>
			<input id="post-type-delete_post" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: delete_post">
		</div>
		<div class="form-group">
			<label for="post_type-delete_posts"><?php _e( 'Delete Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-delete_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: delete_posts">
		</div>
		<div class="form-group">
			<label for="post_type-delete_private_posts"><?php _e( 'Delete Private Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-delete_private_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: delete_private_posts">
		</div>
		<div class="form-group">
			<label for="post_type-delete_published_posts"><?php _e( 'Delete Published Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-delete_published_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: delete_published_posts">
		</div>
	</div>
	<div class="col-lg-3" data-bind="with: cap">
		<div class="form-group">
			<label for="post_type-edit_others_posts"><?php _e( 'Edit Others Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-edit_others_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: edit_others_posts">
		</div>
		<div class="form-group">
			<label for="post_type-edit_post"><?php _e( 'Edit Post', $this->plugin_slug ); ?></label>
			<input id="post-type-edit_post" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: edit_post">
		</div>
		<div class="form-group">
			<label for="post_type-edit_posts"><?php _e( 'Edit Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-edit_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: edit_posts">
		</div>
		<div class="form-group">
			<label for="post_type-edit_private_posts"><?php _e( 'Edit Private Posts', $this->plugin_slug ); ?></label>
			<input id="post-type-edit_private_posts" type="text" class="form-control" data-bind="attr: { disabled: ( $parent.capability_type() !== 'custom' ) }, value: edit_private_posts">
		</div>
	</div>
</div>