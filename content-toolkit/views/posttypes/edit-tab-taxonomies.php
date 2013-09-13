<div class="row">
	<div class="col-lg-6">
		<div class="row-fluid">
			<label class="col-lg-12" for="">Supports</label>
		</div>
		<div class="row-fluid">
			<div class="col-lg-6">
			<?php
			$taxonomies = get_taxonomies( array( '_builtin' => true ), 'obojects' );
			foreach( $taxonomies as $taxonomy ) {
//				var_dump( $taxonomy );
			?>

				<div class="checkbox">

					<label>
						<input type="checkbox" value="title" data-bind="checked: taxonomies().indexOf( '<?php echo $taxonomy->name; ?>' ) !== -1, click: $parent.addSupports"> <?php echo $taxonomy->labels->name; ?>
					</label>
				</div>

			<?php
			}
			?>
			</div>

		</div>
	</div>
</div>