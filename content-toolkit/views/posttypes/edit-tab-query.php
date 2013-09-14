
<div class="row">
	<div class="col-lg-4">
		<label for="post-type-publicly_queryable"><?php _e( 'Publicly Queryable', $this->plugin_slug ); ?></label>
		<select id="post-type-publicly_queryable" class="form-control" data-bind="booleanValue: publicly_queryable">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Whether queries can be performed on the front end as part of parse_request().', $this->plugin_slug ); ?></span>
	</div>

	<div class="col-lg-4" data-bind="selectWithOther: query_var, selectWithOtherOptions: { selectField: '#post-type-query_var', textField: '#post-type-query_var_text' }">
		<label for="post-type-query_var"><?php _e( 'Query Variable', $this->plugin_slug ); ?></label>
		<select id="post-type-query_var" class="form-control">
			<option value="true"><?php _e( 'Default', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'None', $this->plugin_slug ); ?></option>
			<option value="other"><?php _e( 'Custom', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Sets the query_var key for this post type.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-4">
		<label for="post-type-query_var_text"><?php _e( 'Query Variable', $this->plugin_slug ); ?></label>
		<input id="post-type-query_var_text" type="text" class="form-control" data-bind="attr: { disabled: ( query_var() !== 'custom' ) }">
	</div>

</div>