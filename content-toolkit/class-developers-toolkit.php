<?php
/**
 * Developers Toolkit
 *
 * @package   Developers_Toolkit
 * @author    Gabe Shackle <gabe@hereswhatidid.com>
 * @license   GPL-2.0+
 * @link      http://hereswhatidid.com
 * @copyright 2013 Gabe Shackle
 */

/**
 * Plugin class.
 *
 * TODO: Rename this class to a proper name for your plugin.
 *
 * @package Developers_Toolkit
 * @author  Gabe Shackle <gabe@hereswhatidid.com>
 */
class Developers_Toolkit {

	/**
	 * Plugin version, used for cache-busting of style and script file references.
	 *
	 * @since   1.0.0
	 *
	 * @var     string
	 */
	protected $version = '1.0.0';

	/**
	 * Unique identifier for your plugin.
	 *
	 * Use this value (not the variable name) as the text domain when internationalizing strings of text. It should
	 * match the Text Domain file header in the main plugin file.
	 *
	 * @since    1.0.0
	 *
	 * @var      string
	 */
	protected $plugin_slug = 'developers-toolkit';

	/**
	 * Instance of this class.
	 *
	 * @since    1.0.0
	 *
	 * @var      object
	 */
	protected static $instance = null;

	/**
	 * Slug of the plugin screen.
	 *
	 * @since    1.0.0
	 *
	 * @var      string
	 */
	protected $plugin_screen_hook_suffix = null;
	/**
	 * Current post type supports options
	 *
	 * @since 		1.0.0
	 * 
	 * @var 		array
	 */	
	protected $support_types = array( 'title',
									  'editor',
									  'author',
									  'thumbnail',
									  'excerpt',
									  'trackbacks',
									  'custom-fields',
									  'comments',
									  'revisions',
									  'page-attributes',
									  'post-formats' );

	/**
	 * Initialize the plugin by setting localization, filters, and administration functions.
	 *
	 * @since     1.0.0
	 */
	private function __construct() {

		// Load plugin text domain
		add_action( 'init', array( $this, 'load_plugin_textdomain' ) );

		// Add the options page and menu item.
		add_action( 'admin_menu', array( $this, 'add_plugin_admin_menu' ) );

		// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		// Load public-facing style sheet and JavaScript.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		add_action( 'registered_post_type', array( $this, 'get_post_type_source' ), 900, 2 );

		// Define custom functionality. Read more about actions and filters: http://codex.wordpress.org/Plugin_API#Hooks.2C_Actions_and_Filters
		add_action( 'wp_ajax_getposttypes', array( $this, 'ajax_get_post_types' ) );
		add_filter( 'TODO', array( $this, 'filter_method_name' ) );

	}

	/**
	 * Return an instance of this class.
	 *
	 * @since     1.0.0
	 *
	 * @return    object    A single instance of this class.
	 */
	public static function get_instance() {

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	public function get_post_type_source( $post_type = NULL, $args = array() ) {
		$backtrace = debug_backtrace();

		// var_dump( $post_type );
		// var_dump( plugin_dir_path( $backtrace[3]['file'] ) );
	}

	/**
	 * Fired when the plugin is activated.
	 *
	 * @since    1.0.0
	 *
	 * @param    boolean    $network_wide    True if WPMU superadmin uses "Network Activate" action, false if WPMU is disabled or plugin is activated on an individual blog.
	 */
	public static function activate( $network_wide ) {
		// TODO: Define activation functionality here
	}

	/**
	 * Fired when the plugin is deactivated.
	 *
	 * @since    1.0.0
	 *
	 * @param    boolean    $network_wide    True if WPMU superadmin uses "Network Deactivate" action, false if WPMU is disabled or plugin is deactivated on an individual blog.
	 */
	public static function deactivate( $network_wide ) {
		// TODO: Define deactivation functionality here
	}

	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain() {

		$domain = $this->plugin_slug;
		$locale = apply_filters( 'plugin_locale', get_locale(), $domain );

		load_textdomain( $domain, WP_LANG_DIR . '/' . $domain . '/' . $domain . '-' . $locale . '.mo' );
		load_plugin_textdomain( $domain, FALSE, dirname( plugin_basename( __FILE__ ) ) . '/lang/' );
	}

	/**
	 * Register and enqueue admin-specific style sheet.
	 *
	 * @since     1.0.0
	 *
	 * @return    null    Return early if no settings page is registered.
	 */
	public function enqueue_admin_styles() {

		if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $screen->id == $this->plugin_screen_hook_suffix ) {
			wp_enqueue_style( $this->plugin_slug .'-admin-styles', plugins_url( 'css/styles.dev.css', __FILE__ ), array(), $this->version );
		}

	}

	/**
	 * Register and enqueue admin-specific JavaScript.
	 *
	 * @since     1.0.0
	 *
	 * @return    null    Return early if no settings page is registered.
	 */
	public function enqueue_admin_scripts() {

		if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $screen->id == $this->plugin_screen_hook_suffix ) {
			// wp_enqueue_script( $this->plugin_slug . '-knockout', plugins_url( 'js/vendor/knockout-2.3.0.js', __FILE__ ), array(), '2.3.0' );
			// wp_enqueue_script( $this->plugin_slug . '-knockout-mapping', plugins_url( 'js/vendor/knockout.mapping-2.4.1.js', __FILE__ ), array( $this->plugin_slug . '-knockout' ), '2.4.1' );
			// wp_enqueue_script( $this->plugin_slug . '-admin-pager', plugins_url( 'js/vendor/pager.js', __FILE__ ), array( ), $this->version );
			wp_enqueue_script( $this->plugin_slug . '-admin-script', plugins_url( 'js/scripts.dev.js', __FILE__ ), array( 'jquery' ), $this->version );
		}

	}

	/**
	 * Register and enqueue public-facing style sheet.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {
		wp_enqueue_style( $this->plugin_slug . '-plugin-styles', plugins_url( 'css/public.css', __FILE__ ), array(), $this->version );
	}

	/**
	 * Register and enqueues public-facing JavaScript files.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( $this->plugin_slug . '-plugin-script', plugins_url( 'js/public.js', __FILE__ ), array( 'jquery' ), $this->version );
	}

	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 *
	 * @since    1.0.0
	 */
	public function add_plugin_admin_menu() {

		/*
		 * TODO:
		 *
		 * Change 'Page Title' to the title of your plugin admin page
		 * Change 'Menu Text' to the text for menu item for the plugin settings page
		 * Change 'developers-toolkit' to the name of your plugin
		 */
		add_menu_page(
			__( 'Content Toolkit', $this->plugin_slug ),
			__( 'Content Toolkit', $this->plugin_slug ),
			'read',
			$this->plugin_slug,
			array( $this, 'display_plugin_admin_page' )
		);
		$this->plugin_screen_hook_suffix = add_submenu_page(
			$this->plugin_slug,
			__( 'Custom Post Types', $this->plugin_slug ),
			__( 'Custom Post Types', $this->plugin_slug ),
			'read',
			$this->plugin_slug . '-cpt',
			array( $this, 'display_cpt_admin_page' )
		);

	}
	/**
	 * Render the settings page for this plugin.
	 *
	 * @since    1.0.0
	 */
	public function display_plugin_admin_page() {
		// include_once( 'views/admin.php' );
	}
	public function display_cpt_admin_page() {
		include_once( 'views/admin.php' );
	}

	/**
	 * NOTE:  Actions are points in the execution of a page or process
	 *        lifecycle that WordPress fires.
	 *
	 *        WordPress Actions: http://codex.wordpress.org/Plugin_API#Actions
	 *        Action Reference:  http://codex.wordpress.org/Plugin_API/Action_Reference
	 *
	 * @since    1.0.0
	 */
	public function action_method_name() {
		// TODO: Define your action hook callback here
	}

	/**
	 * NOTE:  Filters are points of execution in which WordPress modifies data
	 *        before saving it or sending it to the browser.
	 *
	 *        WordPress Filters: http://codex.wordpress.org/Plugin_API#Filters
	 *        Filter Reference:  http://codex.wordpress.org/Plugin_API/Filter_Reference
	 *
	 * @since    1.0.0
	 */
	public function filter_method_name() {
		// TODO: Define your filter hook callback here
	}

	public function ajax_get_post_types() {
		$postTypes = get_post_types();
		$result = array();
		foreach( $postTypes as $postType ) {

			$post_type_object = get_post_type_object( $postType );
			$post_type_object->supports = array();

			foreach( $this->support_types as $support_type ) {
				if ( post_type_supports( $postType, $support_type ) ) {
					$post_type_object->supports[] = $support_type;
				}
			}

			$taxonomies = get_object_taxonomies( $postType );

			$post_type_object->taxonomies = $taxonomies;

			$post_type_object->rewrite_slug = $postType;			
			$post_type_object->rewrite_with_front = false;
			$post_type_object->rewrite_feeds = false;
			$post_type_object->rewrite_pages = false;

			$post_type_object->source = 'core';


			if ( $post_type_object->menu_position === null ) {
				$post_type_object->menu_position = '5';
			}

			$result[] = $post_type_object;
		}
		echo json_encode( array( 'postTypes' => $result ) );
		die();
	}

}