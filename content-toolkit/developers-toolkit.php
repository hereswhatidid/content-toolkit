<?php
/**
 * @package   Developers_Toolkit
 * @author    Gabe Shackle <gabe@hereswhatidid.com>
 * @license   GPL-2.0+
 * @link      http://hereswhatidid.com
 * @copyright 2013 Gabe Shackle
 *
 * @wordpress-plugin
 * Plugin Name: Developers Toolkit
 * Plugin URI:  http://hereswhatidid.com/developers-toolkit/
 * Description: A plugin to aid in the customization of a WordPress web site
 * Version:     1.0.0
 * Author:      Gabe Shackle
 * Author URI:  http://hereswhatidid.com/
 * Text Domain: developers-toolkit-locale
 * License:     GPL-2.0+  
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path: /lang
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

require_once( plugin_dir_path( __FILE__ ) . 'class-developers-toolkit.php' );

// Register hooks that are fired when the plugin is activated, deactivated, and uninstalled, respectively.
register_activation_hook( __FILE__, array( 'Developers_Toolkit', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Developers_Toolkit', 'deactivate' ) );

Developers_Toolkit::get_instance();