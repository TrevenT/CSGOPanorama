'use strict';

var friendTile = ( function (){

	var _m_xuid = '';
	var _m_tile = null;
	
	var _Init = function( elTile )
	{
		_m_xuid = elTile.GetAttributeString( 'xuid', '(not found)' );
		_m_tile = elTile;

		_SetImage( elTile );
		_SetName( elTile );
		_SetStatus( elTile );
		_SetStatusBar( elTile );
		_SetInvitedFromCallback( elTile );
		_SetCanJoin( elTile );
		_SetCanWatch( elTile );
		_SetOnActivateEvent( elTile );
	};

	var _SetImage = function( elTile )
	{
		var elAvatarImg = elTile.FindChildTraverse( 'JsFriendAvatar' );
		elAvatarImg.steamid = _m_xuid;
	};

	var _SetStatusBar = function( elTile )
	{
		var elStatusBar = elTile.FindChildTraverse( 'JsFriendStatusBar' );
		var statusBucket = FriendsListAPI.GetFriendStatusBucket( _m_xuid );
		var isFriend = FriendsListAPI.GetFriendRelationship( _m_xuid );

		                                                
		                                                                                                  
		if ( TeammatesAPI.GetCoPlayerInCSGO( _m_xuid ) && isFriend !== "friend" )
			statusBucket = "PlayingCSGO";
		else if ( isFriend !== "friend" )
		{
			statusBucket = "Offline";
			elStatusBar.RemoveClass( 'ingame' );
			elStatusBar.RemoveClass( 'online' );
		}

		if ( statusBucket === "Online" )
		{
			elStatusBar.RemoveClass( 'ingame' );
			elStatusBar.AddClass( 'online' );
		}

		if ( statusBucket === "PlayingCSGO" )
		{
			elStatusBar.RemoveClass( 'online' );
			elStatusBar.AddClass( 'ingame' );
		}
	};

	var _SetName = function( elTile )
	{
		var elLabel = elTile.FindChildTraverse( 'JsFriendName' );
		elLabel.text = FriendsListAPI.GetFriendName( _m_xuid );
	};

	var _SetStatus = function( elTile )
	{
		var friendStatusText = '';

		if ( elTile.Data().type === 'recent' )
		{
			friendStatusText = TeammatesAPI.GetCoPlayerTime( _m_xuid );
		}

		if ( !friendStatusText )
			friendStatusText = FriendsListAPI.GetFriendStatus( _m_xuid );

		var elLabel = elTile.FindChildTraverse( 'JsFriendStatus' );
		elLabel.text = $.Localize( friendStatusText );
	};

	var _SetInvitedFromCallback = function( elTile )
	{
		var isInvited = FriendsListAPI.IsFriendInvited( _m_xuid );
		_SetInvited( elTile, isInvited );
	};

	var _SetInvitedFromContextMenu = function( elTile )
	{
		_SetInvited( elTile, true );
	};

	var _SetInvited = function( elTile, isInvited )
	{
		var elInvited = elTile.FindChildTraverse( 'JsFriendInvited' );

		if ( elInvited !== null )
			elInvited.SetHasClass( 'hidden', !isInvited );
	};

	var _SetCanJoin = function( elTile )
	{
		var canJoin = FriendsListAPI.IsFriendJoinable( _m_xuid );

		elTile.FindChildTraverse( 'JsFriendJoin' ).SetHasClass( 'hidden', !canJoin );
	};

	var _SetCanWatch = function( elTile )
	{
		var canWatch = FriendsListAPI.IsFriendWatchable( _m_xuid );

		elTile.FindChildTraverse( 'JsFriendWatch' ).SetHasClass( 'hidden', !canWatch );
	};


	var _SetOnActivateEvent = function( elTile )
	{
		var OpenContextMenu = function( xuid )
		{
			                                                                                             
			$.DispatchEvent( 'SidebarContextMenuActive', true );
				
			var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
				'',
				'',
				'file://{resources}/layout/context_menus/context_menu_playercard.xml',
				'xuid=' + xuid,
				function()
				{
					$.DispatchEvent( 'SidebarContextMenuActive', false )
				}
			);
			contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
		};

		elTile.FindChildTraverse( 'JsFriendTileBtn' ).SetPanelEvent( 'onactivate', OpenContextMenu.bind( undefined, _m_xuid ) );
		elTile.FindChildTraverse( 'JsFriendTileBtn' ).SetPanelEvent( 'oncontextmenu', OpenContextMenu.bind( undefined, _m_xuid ) );
	};

	return {
		Init			: 	_Init,		                      
		SetInvitedFromContextMenu		:	_SetInvitedFromContextMenu
	};
})();

( function (){
	                                                                                                      

})();


