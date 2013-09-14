<div class="row">
	<div class="col-lg-4">
		<div class="row-fluid">
			<label class="col-lg-12" for="">Supports</label>
		</div>
		<div class="row-fluid" data-bind="checkboxList: supports">
			<div class="col-lg-6">
				<div class="checkbox">
					<label>
						<input type="checkbox" value="title"> <?php _e( 'Title', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="editor"> <?php _e( 'Content', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="excerpt"> <?php _e( 'Excerpt', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="author"> <?php _e( 'Author', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="thumbnail"> <?php _e( 'Featured Image', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="comments"> <?php _e( 'Comments', $this->plugin_slug ); ?>
					</label>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="checkbox">
					<label>
						<input type="checkbox" value="trackbacks"> <?php _e( 'Trackbacks', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="revisions"> <?php _e( 'Revisions', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="custom-fields"> <?php _e( 'Custom Fields', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="page-attributes"> <?php _e( 'Page Attributes', $this->plugin_slug ); ?>
					</label>
				</div>
				<div class="checkbox">
					<label>
						<input type="checkbox" value="post-formats"> <?php _e( 'Post Formats', $this->plugin_slug ); ?>
					</label>
				</div>
			</div>
		</div>
	</div>
	<div class="col-lg-4" data-bind="checkboxList: taxonomies">
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
					<input type="checkbox" value="<?php echo $taxonomy->name; ?>"> <?php echo $taxonomy->labels->name; ?>
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
		<p data-bind="selectWithOther: has_archive, selectWithOtherOptions: { selectField: '#post-type-has_archive', textField: '#post-type-has_archive_slug' }">
			<label for="post-type-has_archive"><?php _e( 'Has Archive', $this->plugin_slug ); ?></label>
			<select id="post-type-has_archive" class="form-control">
				<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
				<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
				<option value="other"><?php _e( 'Custom', $this->plugin_slug ); ?></option>
			</select>
			<span class="help-block"><?php _e( 'Enables post type archives.', $this->plugin_slug ); ?></span>
		</p>
		<p>
			<label for="post-type-has_archive_slug"><?php _e( 'Custom Archive Slug', $this->plugin_slug ); ?></label>
			<input id="post-type-has_archive_slug" type="text" class="form-control">
			<span class="help-block"><?php _e( 'Creates a custom slug for the archive.', $this->plugin_slug ); ?></span>
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