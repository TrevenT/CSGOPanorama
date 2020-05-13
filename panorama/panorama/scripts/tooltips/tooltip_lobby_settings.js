"use strict";

var TooltipLobby = ( function ()
{
	var m_GameSettings = {};
	var m_RefreshStatsScheduleHandle = false;

	
	
	var _Init = function ()
	{
		if ( LobbyAPI.IsSessionActive() ) {
			_CancelStatsRefresh();
			_GetLobbySettings();
			_Permissions();
			_SetPrimeStatus();
			_SetMode();
			_SetMaps();
			_GetLobbyStatistics();
		}
		else {
			UiToolkitAPI.HideCustomLayoutTooltip('LobbySettingsTooltip');
		}
	}
	
	var _CancelStatsRefresh = function () {
		if( m_RefreshStatsScheduleHandle !== false ) {
			$.CancelScheduled( m_RefreshStatsScheduleHandle );
			m_RefreshStatsScheduleHandle = false;
		}
	}

	var _GetLobbyStatistics = function ()
	{
		m_RefreshStatsScheduleHandle = $.Schedule( 2, _GetLobbyStatistics );
		
		var searchingStatus = LobbyAPI.GetMatchmakingStatusString();
		var elMatchStats = $.GetContextPanel().FindChildInLayoutFile( 'LobbyTooltipStats' );
		var isSearching = searchingStatus !== '' && searchingStatus !== undefined ? true : false;

		                                          
		                                                                                          
		if( m_GameSettings.mapgroupname )
		{
			var mapsList = m_GameSettings.mapgroupname.split(',');
			var elCompWarning = $.GetContextPanel().FindChildInLayoutFile('LobbyTooltipCompWarning');
			if( mapsList.length < 18 && m_GameSettings.mode === "competitive" && isSearching )
				elCompWarning.RemoveClass( 'hidden' );
			else
				elCompWarning.AddClass( 'hidden' );
		}

		elMatchStats.SetHasClass( 'hidden', !isSearching );

		                                  
		if( !isSearching )
			return;

		                  
		var elMatchStatsLabel = elMatchStats.FindChildInLayoutFile('LobbyTooltipStatsTitle');
		elMatchStatsLabel.text = $.Localize( searchingStatus );

		                              
		var matchmakeingStats = LobbyAPI.GetMatchmakingStatistics();
		var elStats = elMatchStats.FindChildInLayoutFile('LobbyTooltipStatsList');
		elStats.RemoveAndDeleteChildren();

		  
			                        
			                      
			                
			               
			                  
			                  
			               
			                  
		  
		
		var MakeStatsRow = function ( statType, iconName )
		{
			var p = $.CreatePanel( 'Panel', elStats, '' );
			p.BLoadLayoutSnippet("SettingsEntry");

			if( statType === 'avgSearchTimeSeconds' )
			{
				var time = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( matchmakeingStats[ statType ] );
				p.SetDialogVariable( 'stat', time );
			}
			else
				p.SetDialogVariableInt( 'stat', matchmakeingStats[ statType ]);

			p.FindChildInLayoutFile('SettingText').text = $.Localize( 'matchmaking_stat_' + statType, p );
			p.FindChildInLayoutFile('SettingImage').SetImage( 'file://{images}/icons/ui/'+iconName+'.svg' );
			p.FindChildInLayoutFile('SettingImage').AddClass( 'tint' );
		}

		MakeStatsRow( 'avgSearchTimeSeconds', 'clock');
		                                            
		MakeStatsRow( 'playersOnline', 'lobby' );
		MakeStatsRow( 'playersSearching', 'find');
		MakeStatsRow( 'serversOnline', 'servers');
	}

	var _GetLobbySettings = function ()
	{
		m_GameSettings = LobbyAPI.GetSessionSettings().game;
	}

	var _SetPrimeStatus = function ()
	{
		var displayText = m_GameSettings.prime === 1 ? '#prime_only_label' : '#prime_priority_label';
		$.GetContextPanel().FindChildInLayoutFile( 'LobbyTooltipPrime' ).text = $.Localize( displayText );
	}

	var _Permissions = function ()
	{
		var systemSettings = LobbyAPI.GetSessionSettings().system;

		if ( !systemSettings )
			return;
		
		var systemAccess = systemSettings.access;
		var isNearby = m_GameSettings.nby === 1 ? true : false;
		var clanId = m_GameSettings.clanid;
		var displayText = '';

		if( systemAccess === 'public')
		{
			if( m_GameSettings.hasOwnProperty( 'clanid' ) && m_GameSettings.clanid !== '' )
				displayText = '#permissions_group';
			else
				displayText = '#permissions_' + systemAccess;
			
				displayText = isNearby ? displayText + '_nearby' : displayText;
		}
		else
		{
			displayText = '#permissions_' + systemAccess;
		}

		$.GetContextPanel().FindChildInLayoutFile( 'LobbyTooltipPermissions' ).text = $.Localize( displayText );
	}

	var _SetMode = function ()
	{
		var gameMode = m_GameSettings.mode;
		var gameMode = m_GameSettings.type;
	

		var elGameModeTitle = $.GetContextPanel().FindChildInLayoutFile( 'LobbyTooltipGameMode');
		elGameModeTitle.FindChild( 'SettingText' ).text =  $.Localize('SFUI_GameMode' + m_GameSettings.mode );
		elGameModeTitle.FindChild( 'SettingImage' ).SetImage( 'file://{images}/icons/ui/' + m_GameSettings.mode + '.svg' );

		elGameModeTitle.FindChild( 'SettingImage' ).SetHasClass('tint', m_GameSettings.mode !== "competitive" );
	}
	

	var _SetMaps = function ()
	{
		if( !m_GameSettings.mapgroupname )
			return;
		
		var mapsList = m_GameSettings.mapgroupname.split(',');
		var elMapsSection = $.GetContextPanel().FindChildInLayoutFile( 'LobbyTooltipMapsList' );

		elMapsSection.RemoveAndDeleteChildren();

		$.CreatePanel( 'Label', elMapsSection, 'LobbyMapsListTitle', { 
			class:'tooltip-player-xp__title--small',
			text:'#party_tooltip_maps'
		} );

		mapsList.forEach(function(element) {
			var p = $.CreatePanel( 'Panel', elMapsSection, element );
			p.BLoadLayoutSnippet("SettingsEntry");
			p.FindChildInLayoutFile('SettingText').text = $.Localize( GameTypesAPI.GetMapGroupAttribute( element, 'nameID' ));
			
			var maps = GameTypesAPI.GetMapGroupAttributeSubKeys( element, 'maps' ).split(',');
			p.FindChildInLayoutFile('SettingImage').SetImage( 'file://{images}/map_icons/map_icon_'+ maps[0] + '.svg' );
		});
	}

	var _OnHideMainMenu = function () {
		_CancelStatsRefresh();
	}

	var _OnHidePauseMenu = function () {
		_CancelStatsRefresh();
	}

	return{
		Init	: _Init,
		CancelStatsRefresh : _CancelStatsRefresh,
		OnHideMainMenu	   : _OnHideMainMenu,
		OnHidePauseMenu	   : _OnHidePauseMenu
};

})();

(function()
{
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", TooltipLobby.Init );
	$.RegisterForUnhandledEvent( "CSGOHideMainMenu", TooltipLobby.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOHidePauseMenu", TooltipLobby.OnHidePauseMenu );
})();