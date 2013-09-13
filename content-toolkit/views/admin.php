<?php
/**
 * Represents the view for the administration dashboard.
 *
 * This includes the header, options, and other information that should provide
 * The User Interface to the end user.
 *
 * @package   Plugin_Name
 * @author    Your Name <email@example.com>
 * @license   GPL-2.0+
 * @link      http://example.com
 * @copyright 2013 Your Name or Company Name
 */
?>
<div class="wrap">

	<?php screen_icon(); ?>
	
	<div class="bootstrap-wrapper" id="devToolkitApp">
		<div class="container">
			<div class="row-fluid">
				<div class="col-lg-12">
					<div class="page-header">
						<h2><?php echo esc_html( get_admin_page_title() ); ?>
							<small data-bind="visible: ( isDetailView() === false )">View All</small>
							<small data-bind="visible: isDetailView">Edit</small>
						</h2>
					</div>
				</div>
			</div>
			<div class="row-fluid">
				<div class="col-lg-12" data-bind="page: { id: 'viewall', role: 'start', beforeShow: setEditMode }">
					<?php include_once( 'posttypes/index.php' ); ?>
				</div>
				<form action="#" data-bind="page: { id: 'editposttype', title: 'Edit Post Type', beforeShow: setEditMode }">
					<p><a data-bind="page-href: '/viewall'" class="btn btn-xs btn-success">&laquo; View All Post Types</a></p>
					<div data-bind="page: { id: '?', nameParam: postTypeName }">
						<div data-bind="with: posttypeedit">
							<h3>Editing: <span class="text-success" data-bind="text: label"></span></h3>
							<ul class="nav nav-tabs" data-bind="foreach: $page.children">
								<li data-bind="css: {active: isVisible}"><a data-bind="text: $data.val('title'), page-href: $data"></a></li>
							</ul>
							<div class="tab-pane" data-bind="page: { id: 'general', title: '<?php _e( 'General', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-general.php' ); ?>
							</div>
							<div class="tab-pane" data-bind="page: { id: 'features', title: '<?php _e( 'Features', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-features.php' ); ?>
							</div>
							<div class="tab-pane" data-bind="page: { id: 'query', title: '<?php _e( 'Query', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-query.php' ); ?>
							</div>
							<div class="tab-pane" data-bind="page: { id: 'labels', title: '<?php _e( 'Labels', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-labels.php' ); ?>
							</div>
							<div class="tab-pane" data-bind="page: { id: 'adminui', title: '<?php _e( 'Admin UI', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-adminui.php' ); ?>
							</div>
							<div class="tab-pane" data-bind="page: { id: 'permalinks', title: '<?php _e( 'Permalinks', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-permalinks.php' ); ?>
							</div>
							<div class="tab-pane" data-bind="page: { id: 'capabilities', title: '<?php _e( 'Capabilities', $this->plugin_slug ); ?>' }">
								<?php include_once( 'posttypes/edit-tab-capabilities.php' ); ?>
							</div>

						</div>
					</div>

				</form>
			</div>
		</div>
	</div>
	<!-- TODO: Provide markup for your options page here. -->

</div>
