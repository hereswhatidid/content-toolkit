<table class="table table-striped table-bordered">
	<thead>
		<tr>
			<th><?php _e( 'Post Type', $this->plugin_slug ); ?></th>
			<th><?php _e( 'Public', $this->plugin_slug ); ?></th>
			<th><?php _e( 'Source', $this->plugin_slug ); ?></th>
			<th>&nbsp;</th>
		</tr>
	</thead>
	<tbody data-bind="foreach: postTypes">
		<tr data-bind="css: { warning: dirtyFlag.isDirty() }">
			<td data-bind="text: label"></td>
			<td data-bind="text: public"></td>
			<td data-bind="text: source"></td>
			<td>
				<div class="btn-group pull-right">
					<a class="btn btn-xs btn-success" data-bind="page-href: '/editposttype/' + postType() + '/general', click: $root.editPostType">Edit</a>
					<a class="btn btn-xs btn-warning" data-bind="visible: dirtyFlag.isDirty(), click: revertPostType">Revert</a>
					<a class="btn btn-xs btn-danger" data-bind="visible: source() !== 'Content Toolkit'">Disable</a>
					<a class="btn btn-xs btn-danger" data-bind="visible: source() === 'Content Toolkit'">Delete</a>
				</div>
			</td>
		</tr>
	</tbody>
</table>