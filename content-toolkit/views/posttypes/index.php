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
		<tr data-bind="css: { warning: isDirty }">
			<td data-bind="text: tempValue().label"></td>
			<td data-bind="text: tempValue().public"></td>
			<td data-bind="text: tempValue().source"></td>
			<td>
				<div class="btn-group pull-right">
					<a class="btn btn-xs btn-success" data-bind="page-href: '/editposttype/' + tempValue().postType() + '/general'"><?php _e( 'Edit', $this->plugin_slug ); ?></a>
					<a class="btn btn-xs btn-warning" data-bind="visible: isDirty, click: revertPostType"><?php _e( 'Revert', $this->plugin_slug ); ?></a>
					<!-- ko if: tempValue().source() !== '<?php _e( 'Content Toolkit', $this->plugin_slug ); ?>' -->
					<a class="btn btn-xs btn-danger"><?php _e( 'Disable', $this->plugin_slug ); ?></a>
					<!-- /ko -->
					<!-- ko if: tempValue().source() === '<?php _e( 'Content Toolkit', $this->plugin_slug ); ?>' -->
					<a class="btn btn-xs btn-danger"><?php _e( 'Delete', $this->plugin_slug ); ?></a>
					<!-- /ko -->
				</div>
			</td>
		</tr>
	</tbody>
</table>