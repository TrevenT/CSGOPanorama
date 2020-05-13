'use strict';

var PopupLeaderboards = ( function()
{
	var m_type = '';
	var m_myXuid = MyPersonaAPI.GetXuid();

	var _Init = function()
	{
		var type = $.GetContextPanel().GetAttributeString( 'type', '' );

		if ( type === '' )
		{
			return;
		}

		m_type = type;

		$.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-title' ).text = $.Localize( '#CSGO_' + type );
		_UpdateLeaderboard( type );
	};

	var _UpdateLeaderboard = function( type )
	{
		                                

		var status = LeaderboardsAPI.GetState( type );
		                                         

		var elStatus = $.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-loading' );
		var elData = $.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-nodata' );
		var elLeaderboardList = $.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-list' );

		if ( "none" == status )
		{
			elStatus.SetHasClass( 'hidden', false );
			elData.SetHasClass( 'hidden', true );
			elLeaderboardList.SetHasClass( 'hidden', true );
			LeaderboardsAPI.Refresh( type );
		}
	
		if ( "loading" == status )
		{
			elStatus.SetHasClass( 'hidden', false );
			elData.SetHasClass( 'hidden', true );
			elLeaderboardList.SetHasClass( 'hidden', true );
		}
	
		if ( "ready" == status )
		{
			var count = LeaderboardsAPI.GetCount( type );
			
			if ( count === 0 )
		    {
				elData.SetHasClass( 'hidden', false );
				elStatus.SetHasClass( 'hidden', true );
				elLeaderboardList.SetHasClass( 'hidden', true );
			}
			else
			{
				elLeaderboardList.SetHasClass( 'hidden', false );
				elStatus.SetHasClass( 'hidden', true );
				elData.SetHasClass( 'hidden', true );

				_FillOutEntries( type, count );
			}
			
			if ( 3 <= LeaderboardsAPI.HowManyMinutesAgoCached( type ) )
			{
				LeaderboardsAPI.Refresh( type );
			}
		}
	};

	var _FillOutEntries = function( type, count )
	{
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-entries' );
		elParent.RemoveAndDeleteChildren();

		for ( var i = 0; i < count; i++ )
		{
			var xuid = LeaderboardsAPI.GetEntryXuidByIndex( type, i );
			var score = LeaderboardsAPI.GetEntryScoreByIndex( type, i );
			var rank = LeaderboardsAPI.GetEntryGlobalPctByIndex( type, i );

			var elEntry = $.CreatePanel( "Panel", elParent, xuid );
			elEntry.BLoadLayoutSnippet( "leaderboard-entry" );

			elEntry.FindChildInLayoutFile( 'popup-leaderboard-entry-avatar' ).steamid = xuid;
			elEntry.FindChildInLayoutFile( 'popup-leaderboard-entry-name' ).text = FriendsListAPI.GetFriendName( xuid );
			elEntry.FindChildInLayoutFile( 'popup-leaderboard-entry-points' ).text = score;
			elEntry.FindChildInLayoutFile( 'popup-leaderboard-entry-rank' ).text = rank + '%';
			elEntry.FindChildInLayoutFile( 'popup-leaderboard-entry-position' ).text = i + 1;

			var children = elEntry.FindChildrenWithClassTraverse( 'popup-leaderboard__list__column' );
			
			if ( i % 2 === 0 )
			{
				children.forEach(element => {
					element.AddClass( 'background' );
				});
			}
		}

		_HighightMySelf();
	};

	var _HighightMySelf = function( )
	{
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-entries' );
		var elEntry = elParent.FindChildInLayoutFile( m_myXuid );

		if ( elEntry )
		{
			elEntry.AddClass( 'local-player' );
			elEntry.ScrollParentToMakePanelFit( 1, false );
		}
		
	}

	var _RefreshLeaderBoard = function( type )
	{
		if ( m_type === type )
		{
			_UpdateLeaderboard( type );
			return;
		}

		_ErrorDialog();
	};

	var _ErrorDialog = function()
	{
		_Close();
		
		                                                                         
		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
			$.Localize( '#SFUI_Steam_Error_LinkUnexpected' ),
			'',
			function()
			{
				$.DispatchEvent( 'HideContentPanel' );
			},
			function()
			{
			}
		);
	};

	var _UpdateName = function( xuid )
	{
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'id-popup-leaderboard-entries' );
		var elEntry = elParent.FindChildInLayoutFile( xuid );

		if ( elEntry )
		{
			elEntry.FindChildInLayoutFile( 'popup-leaderboard-entry-name' ).text = FriendsListAPI.GetFriendName( xuid );
		}
	};

	var _Close = function()
	{
		                   
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	};

	return {
		Init: _Init,
		RefreshLeaderBoard: _RefreshLeaderBoard,
		UpdateName: _UpdateName,
		Close: _Close
	};

})();

(function(){

	$.RegisterForUnhandledEvent( 'PanoramaComponent_Leaderboards_StateChange', PopupLeaderboards.RefreshLeaderBoard );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', PopupLeaderboards.UpdateName );
	                                                                                                                             

})();