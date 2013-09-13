<div class="row-fluid">
	<table class="table table-striped table-bordered">
		<thead>
			<tr>
				<th><?php _e( 'ID', $this->plugin_slug ); ?></th>
				<th><?php _e( 'Title', $this->plugin_slug ); ?></th>
				<th><?php _e( 'Content', $this->plugin_slug ); ?></th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			<?php for ( $i=0; $i<10; $i++) { ?>
			<tr>
				<td>Unique ID</td>
				<td>Title</td>
				<td>Content</td>
				<td>
					<div class="btn-group pull-right">
						<button class="btn btn-xs btn-success">Edit</button>
						<button class="btn btn-xs btn-danger">Delete</button>
					</div>
				</td>
			</tr>
			<?php } ?>
		</tbody>
	</table>
</div>