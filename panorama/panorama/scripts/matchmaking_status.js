'use strict';

                                                     
                                                                    
                                                     

var MatchmakingStatus = ( function()
{
	var _m_searchTimeUpdateHandle = false;
	var _m_elStatusPanel = $( "#MatchStatusContainer" );

	var _Init = function()
	{
		_ActionsForInotBtn();
		_UpdateMatchmakingStatus();
	};

	var _SessionUpdate = function()
	{
		_UpdateMatchmakingStatus();
		_TintBgForSearch();
	};

	var _UpdateMatchmakingStatus = function()
	{
		var lobbySettings = LobbyAPI.GetSessionSettings().game;

		if ( !LobbyAPI.IsSessionActive() )
		{
			_m_elStatusPanel.SetHasClass( 'hidden', true );
			return;
		}

		_m_elStatusPanel.SetHasClass( 'hidden', false );

		 _UpdateStatusPanel( lobbySettings );
	};

	var _UpdateStatusPanel = function( lobbySettings )
	{
		_CancelSearchTimeUpdate();

		_UpdateSearchWaitPanel( lobbySettings );
		_SearchPanelSearching( lobbySettings );
		_ShowMatchmakingWarnings( lobbySettings );
	};

	var _UpdateSearchWaitPanel = function( lobbySettings )
	{
		var elStatusWait = _m_elStatusPanel.FindChildInLayoutFile( 'MatchStatusWait' );

		if ( !lobbySettings || _IsHost() || _IsSeaching() )
		{
			elStatusWait.AddClass( 'hidden' );
			return;
		}

		                                                          
		                      

		                                        
		    
		   	                                                                                       
		       

		                                                                                                    
		                                                                       

		                                                                                

		elStatusWait.RemoveClass( 'hidden' );
		elStatusWait.FindChildInLayoutFile( 'MatchStatusWaitLabel' ).text = $.Localize( "#party_waiting_lobby_leader" );
	};

	var _SearchPanelSearching = function( lobbySettings )
	{
		var elStatusSearching = _m_elStatusPanel.FindChildInLayoutFile( 'MatchStatusSearching' );

		if ( !lobbySettings || !_IsSeaching() )
		{
			elStatusSearching.AddClass( 'hidden' );
			_CancelSearchTimeUpdate();
			return;
		}

		elStatusSearching.RemoveClass( 'hidden' );
		var unavailableMatch = _GetSearchStatus().indexOf( 'unavailable' ) !== -1 ? true : false;

		var elWarningIcon = elStatusSearching.FindChildInLayoutFile( 'MatchStatusFailIcon' );
		elWarningIcon.SetHasClass( 'hidden', !unavailableMatch );

		var elSearchTime = elStatusSearching.FindChildInLayoutFile( 'MatchStatusTime' );
		elSearchTime.SetHasClass( 'hidden', unavailableMatch );

		var elLabel= elStatusSearching.FindChildInLayoutFile( 'MatchStatusSearchingLabel' );
		elLabel.text = $.Localize( _GetSearchStatus() );

		if ( unavailableMatch )
			return;
		
		_UpdateSearchTime();
	};

	var _ShowMatchmakingWarnings = function( lobbySettings )
	{
		var elStatusWarnings = _m_elStatusPanel.FindChildInLayoutFile( 'MatchStatusWarning' );

		if ( !lobbySettings || !_IsSeaching() )
		{
			elStatusWarnings.AddClass( 'hidden' );
			return;
		}
		
		                  
		elStatusWarnings.RemoveClass( 'hidden' );
		var serverWarning = NewsAPI.GetCurrentActiveAlertForUser();
		var isWarning = serverWarning !== '' && serverWarning !== undefined ? true : false;

		elStatusWarnings.SetHasClass( 'hidden', !isWarning );
		if( isWarning )
			elStatusWarnings.FindChild( 'MatchStatusWarningLabel' ).text = $.Localize( serverWarning );
	};

	var _TintBgForSearch = function()
	{	
		var serverWarning = NewsAPI.GetCurrentActiveAlertForUser();
		var isWarning = serverWarning !== '' && serverWarning !== undefined ? true : false;
	
		$.GetContextPanel().FindChildInLayoutFile( 'MatchStatusBackground' ).SetHasClass( 'party-list__bg--warning',( isWarning && _IsSeaching() ) );
		$.GetContextPanel().FindChildInLayoutFile( 'MatchStatusBackground' ).SetHasClass( 'party-list__bg--searching', _IsSeaching() );
	};

	var _ActionsForInotBtn = function()
	{
		var btnSettings = $.GetContextPanel().FindChildInLayoutFile( 'MatchStatusInfo' );
		btnSettings.SetPanelEvent( 'onmouseover', function()
		{
			UiToolkitAPI.ShowCustomLayoutParametersTooltip( 'MatchStatusInfo',
				'LobbySettingsTooltip',
				'file://{resources}/layout/tooltips/tooltip_lobby_settings.xml',
				'xuid=' + ''
			);
		} );

		btnSettings.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideCustomLayoutTooltip('LobbySettingsTooltip'); } );
	};

	                                                                                                    
	                          
	                                                                                                    
	var _IsHost = function()
	{
		return LobbyAPI.BIsHost();
	};

	var _GetSearchStatus = function()
	{
		return LobbyAPI.GetMatchmakingStatusString();
	};

	var _IsSeaching = function()
	{
		var StatusString = _GetSearchStatus();
		return ( StatusString !== '' && StatusString !== null ) ? true : false;
	};

	                                                                                                  
	var _UpdateSearchTime = function()
	{
		var seconds = LobbyAPI.GetTimeSpentMatchmaking();
		var elSearchTime = _m_elStatusPanel.FindChildInLayoutFile( 'MatchStatusTime' )
		elSearchTime.text = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( seconds );

		_m_searchTimeUpdateHandle = $.Schedule( 1.0, _UpdateSearchTime );
	};

	var _CancelSearchTimeUpdate = function()
	{
		if ( _m_searchTimeUpdateHandle !== false )
		{
			$.CancelScheduled( _m_searchTimeUpdateHandle );
			_m_searchTimeUpdateHandle = false;
		}
	};

	var _ShowMatchAcceptPopUp = function( map )
	{
		UiToolkitAPI.ShowGlobalCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_accept_match.xml', 'map_and_isreconnect=' + map + ',false' );
	};

	var _OnHideMainMenu = function()
	{
		_CancelSearchTimeUpdate();
	};

	var _OnHidePauseMenu = function()
	{
		_CancelSearchTimeUpdate();
	};

	return {
		Init										: _Init,
		SessionUpdate								: _SessionUpdate,
		ShowMatchAcceptPopUp						: _ShowMatchAcceptPopUp,
		OnHideMainMenu								: _OnHideMainMenu,
		OnHidePauseMenu								: _OnHidePauseMenu
	};

})();

                                                                                                    
                                           
                                                                                                    
(function()
{
	MatchmakingStatus.Init();
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", MatchmakingStatus.SessionUpdate );
	
	                                                                                                                             
	$.RegisterForUnhandledEvent( 'PanoramaComponent_GC_Hello', MatchmakingStatus.SessionUpdate );

	  	                                                                                                                            
	$.RegisterForUnhandledEvent( "ServerReserved", MatchmakingStatus.ShowMatchAcceptPopUp );
	$.RegisterForUnhandledEvent( "CSGOHideMainMenu", MatchmakingStatus.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOHidePauseMenu", MatchmakingStatus.OnHidePauseMenu );

})();
