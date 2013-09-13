<div class="row">
	<div class="col-lg-4">
		<div class="row-fluid">
			<label class="col-lg-12" for="">Supports</label>
		</div>
		<div class="row-fluid">
			<div class="col-lg-6">
				<div class="checkbox">
					<label>
						<input type="checkbox" value="title" data-bind="checked: supports().indexOf( 'title' ) !== -1, click: $parent.addSupports"> <?php _e( 'Title', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="editor" data-bind="checked: supports().indexOf( 'editor' ) !== -1, click: $parent.addSupports"> <?php _e( 'Content', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="excerpt" data-bind="checked: supports().indexOf( 'excerpt' ) !== -1, click: $parent.addSupports"> <?php _e( 'Excerpt', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="author" data-bind="checked: supports().indexOf( 'author' ) !== -1, click: $parent.addSupports"> <?php _e( 'Author', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="thumbnail" data-bind="checked: supports().indexOf( 'thumbnail' ) !== -1, click: $parent.addSupports"> <?php _e( 'Featured Image', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="comments" data-bind="checked: supports().indexOf( 'comments' ) !== -1, click: $parent.addSupports"> <?php _e( 'Comments', $this->plugin_slug ); ?>
					</label>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="checkbox">
					<label>
						<input type="checkbox" value="trackbacks" data-bind="checked: supports().indexOf( 'trackbacks' ) !== -1, click: $parent.addSupports"> <?php _e( 'Trackbacks', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="revisions" data-bind="checked: supports().indexOf( 'revisions' ) !== -1, click: $parent.addSupports"> <?php _e( 'Revisions', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="custom-fields" data-bind="checked: supports().indexOf( 'custom-fields' ) !== -1, click: $parent.addSupports"> <?php _e( 'Custom Fields', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="page-attributes" data-bind="checked: supports().indexOf( 'page-attributes' ) !== -1, click: $parent.addSupports"> <?php _e( 'Page Attributes', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="post-formats" data-bind="checked: supports().indexOf( 'post-formats' ) !== -1, click: $parent.addSupports"> <?php _e( 'Post Formats', $this->plugin_slug ); ?>
					</label>
				</div>
			</div>
		</div>
	</div>
	<div class="col-lg-4">
		<label for=""><?php _e( 'Taxonomies', $this->plugin_slug ); ?></label>
		<?php
		$taxonomiesBuiltin = get_taxonomies( array( '_builtin' => true ), 'objects' );
		$taxonomiesCustom = get_taxonomies( array( '_builtin' => false ), 'objects' );
		$taxonomies = array_merge( $taxonomiesBuiltin, $taxonomiesCustom );
		// $taxonomies = get_taxonomies( array( '_builtin' => true ), 'objects' );
		foreach( $taxonomies as $taxonomy ) {
		?>
			<div class="checkbox">
				<label>
					<input type="checkbox" value="<?php echo $taxonomy->name; ?>" data-bind="checked: taxonomies().indexOf( '<?php echo $taxonomy->name; ?>' ) !== -1, click: $parent.addTaxonomy"> <?php echo $taxonomy->labels->name; ?>
				</label>
			</div>
		<?php
		}
		?>
	</div>
	<div class="col-lg-4">
		<p>
			<label for="post-type-hierarchical"><?php _e( 'Hierarchical', $this->plugin_slug ); ?></label>
			<select id="post-type-hierarchical" class="form-control" data-bind="booleanValue: hierarchical">
				<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
				<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
			</select>
			<span class="help-block"><?php _e( 'Whether the post type is hierarchical.', $this->plugin_slug ); ?></span>
		</p>
		<p>
			<label for="post-type-can_export"><?php _e( 'Can Be Exported', $this->plugin_slug ); ?></label>
			<select id="post-type-can_export" class="form-control" data-bind="booleanValue: can_export">
				<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
				<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
			</select>
			<span class="help-block"><?php _e( 'Can this post_type be exported.', $this->plugin_slug ); ?></span>
		</p>
		<p>
			<label for="post-type-has_archive"><?php _e( 'Has Archive', $this->plugin_slug ); ?></label>
			<select id="post-type-has_archive" class="form-control" data-bind="booleanValue: has_archive">
				<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
				<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
			</select>
			<span class="help-block"><?php _e( 'Enables post type archives.', $this->plugin_slug ); ?></span>
		</p>
		<p>
			<label for="post-type-exclude_from_search"><?php _e( 'Exclude from Search', $this->plugin_slug ); ?></label>
			<select id="post-type-exclude_from_search" class="form-control" data-bind="booleanValue: exclude_from_search">
				<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
				<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
			</select>
			<span class="help-block"><?php _e( 'Whether to exclude posts with this post type from front end search results.', $this->plugin_slug ); ?></span>
		</p>
	</div>
</div>