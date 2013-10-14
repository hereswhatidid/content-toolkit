
<div class="row">
	<div class="col-lg-4">
		<label for="post-type-rewrite"><?php _e( 'Rewrite', $this->plugin_slug ); ?></label>
		<select id="post-type-rewrite" class="form-control" data-bind="booleanValue: rewrite">
			<option value="default"><?php _e( 'Default', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'None', $this->plugin_slug ); ?></option>
			<option value="custom"><?php _e( 'Custom', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Triggers the handling of rewrites for this post type. To prevent rewrites, set to false.', $this->plugin_slug ); ?></span>
	</div>
	<div data-bind="with: rewriteArgs">
		<div class="col-lg-4">
			<label for="post-type-rewrite-slug"><?php _e( 'Slug', $this->plugin_slug ); ?></label>
			<input id="post-type-rewrite-slug" type="text" class="form-control" data-bind="value: slug,
																						   attr: { disabled: ( $parent.rewrite() !== 'custom' ) }">
			<span class="help-block"><?php _e( 'Customize the permastruct slug.', $this->plugin_slug ); ?></span>
		</div>
		<div class="col-lg-4">
			<label for="post-type-rewrite-with_front"><?php _e( 'With Front', $this->plugin_slug ); ?></label>
			<select id="post-type-rewrite-with_front" class="form-control" data-bind="booleanValue: withFront,
																					  attr: { disabled: ( $parent.rewrite() !== 'custom' ) }">
				<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
				<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
			</select>
			<span class="help-block"><?php _e( 'Should the permastruct be prepended with the front base.', $this->plugin_slug ); ?></span>
		</div>
	</div>
</div>
<div class="row" data-bind="with: rewriteArgs">
	<div class="col-lg-4 col-lg-offset-4">
		<label for="post-type-rewrite-feeds"><?php _e( 'Feeds', $this->plugin_slug ); ?></label>
		<select id="post-type-rewrite-feeds" class="form-control" data-bind="booleanValue: feeds,
																			 attr: { disabled: ( $parent.rewrite() !== 'custom' ) }">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Should a feed permastruct be built for this post type.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-4">
		<label for="post-type-rewrite-pages"><?php _e( 'Pagination', $this->plugin_slug ); ?></label>
		<select id="post-type-rewrite-pages" class="form-control" data-bind="booleanValue: pages,
																			 attr: { disabled: ( $parent.rewrite() !== 'custom' ) }">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Should the permastruct provide for pagination.', $this->plugin_slug ); ?></span>
	</div>
</div>
