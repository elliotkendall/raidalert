<?php
$config = array(
  'API endpoint' => 'https://discordapp.com/api/v6',
  'Client ID' => '...',
  'Client secret' => '...',
  'Redirect URI' => '...',
  'App URL' => '...',
  'Database user' => '...',
  'Database password' => '...',
  'Database name' => '...',
  'Session cookie name' => 'raidalert_session',
  'Admin permissions' => array(
    Discord::MANAGE_CHANNELS,
    Discord::VIEW_AUDIT_LOG,
    Discord::MANAGE_ROLES,
    Discord::MANAGE_MESSAGES
  )
);
