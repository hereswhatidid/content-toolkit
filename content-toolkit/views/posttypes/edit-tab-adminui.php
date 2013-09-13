
<div class="row">
	<div class="col-lg-3">
		<label for="post-type-public"><?php _e( 'Public', $this->plugin_slug ); ?></label>
		<select id="post-type-public" class="form-control" data-bind="booleanValue: public">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Whether a post type is intended to be used publicly either via the admin interface or by front-end users.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-show_ui"><?php _e( 'Show UI', $this->plugin_slug ); ?></label>
		<select id="post-type-show_ui" class="form-control" data-bind="booleanValue: show_ui">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Whether to generate a default UI for managing this post type in the admin.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-show_in_nav_menus"><?php _e( 'Show in Nav Menus', $this->plugin_slug ); ?></label>
		<select id="post-type-show_in_nav_menus" class="form-control" data-bind="booleanValue: show_in_nav_menus">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Whether this post type is available for selection in navigation menus.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-show_in_admin_bar"><?php _e( 'Show in Admin Bar', $this->plugin_slug ); ?></label>
		<select id="post-type-show_in_admin_bar" class="form-control" data-bind="booleanValue: show_in_admin_bar">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'Whether to make this post type available in the WordPress admin bar.', $this->plugin_slug ); ?></span>
	</div>
</div>
<div class="row">
	<div class="col-lg-3" data-bind="selectWithOther: show_in_menu, selectWithOtherOptions: { selectField: '#post-type-show_in_menu', textField: '#post-type-show_in_menu_other' }">
		<label for="post-type-show_in_menu"><?php _e( 'Show in Admin Menu', $this->plugin_slug ); ?></label><br>
		<select id="post-type-show_in_menu" class="form-control">
			<option value="true"><?php _e( 'Yes', $this->plugin_slug ); ?></option>
			<option value="false"><?php _e( 'No', $this->plugin_slug ); ?></option>
			<option value="other"><?php _e( 'Custom', $this->plugin_slug ); ?></option>
		</select>		
		<span class="help-block"><?php _e( 'Where to show the post type in the admin menu. show_ui must be true.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-show_in_menu_other"><?php _e( 'If other:', $this->plugin_slug ); ?></label>
		<input id="post-type-show_in_menu_other" type="text" class="form-control">
		<span class="help-block"><?php _e( 'This field is used when the admin page is to appear underneath another custom menu element.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-menu_position"><?php _e( 'Menu Position', $this->plugin_slug ); ?></label>
		<select id="post-type-menu_position" class="form-control" data-bind="value: menu_position,
		attr: { disabled: ( show_in_menu() === false ) }">
			<option value="5"><?php _e( 'Below Posts', $this->plugin_slug ); ?></option>
			<option value="10"><?php _e( 'Below Media', $this->plugin_slug ); ?></option>
			<option value="15"><?php _e( 'Below Links', $this->plugin_slug ); ?></option>
			<option value="20"><?php _e( 'Below Pages', $this->plugin_slug ); ?></option>
			<option value="25"><?php _e( 'Below Comments', $this->plugin_slug ); ?></option>
			<option value="60"><?php _e( 'Below First Separator', $this->plugin_slug ); ?></option>
			<option value="65"><?php _e( 'Below Plugins', $this->plugin_slug ); ?></option>
			<option value="70"><?php _e( 'Below Users', $this->plugin_slug ); ?></option>
			<option value="75"><?php _e( 'Below Tools', $this->plugin_slug ); ?></option>
			<option value="80"><?php _e( 'Below Settings', $this->plugin_slug ); ?></option>
			<option value="100"><?php _e( 'Below Second Separator', $this->plugin_slug ); ?></option>
		</select>
		<span class="help-block"><?php _e( 'The position in the menu order the post type should appear. show_in_menu must be true.', $this->plugin_slug ); ?></span>
	</div>
	<div class="col-lg-3">
		<label for="post-type-menu_icon"><?php _e( 'Menu Icon', $this->plugin_slug ); ?></label>
		<input id="post-type-menu_icon" type="text" class="form-control" data-bind="value: menu_icon">
		<span class="help-block"><?php _e( 'The url to the icon to be used for this menu.', $this->plugin_slug ); ?></span>
	</div>
</div>
