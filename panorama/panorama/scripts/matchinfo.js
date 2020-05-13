'use strict';

                 
               
                                   
                             
     

                     
             

var matchInfo = ( function() {

    var PLAYERSTATS = [ 'kills', 'assists', 'deaths', 'mvps', 'score' ];
    var TEAMS =[ 'CT', 'TERRORIST' ];
    var TEAMSIZE = 5;
    
    function _ShowMatchSpinner( value, tab )
    {
        if ( tab == undefined )
        {
            tab = _m_activeTab;
        }
        if ( tab )
        {
            var elSpinner = tab.FindChildInLayoutFile( "id-match-spinner" );
            if ( elSpinner )
            {
                if ( value )
                {
                    elSpinner.RemoveClass( 'hide' );
                }
                else
                {
                    elSpinner.AddClass( 'hide' );
                }
            }
        }
    }
    
    function _SetMatchMessage( value, show, tab )
    {
        if ( tab == undefined )
        {
            tab = _m_activeTab;
        }
        if ( tab )
        {
            var elMessage = tab.FindChildInLayoutFile( "id-match-message" );
            if ( elMessage )
            {
                elMessage.text = value;
            }
            var elMessageContainer = tab.FindChildInLayoutFile( "id-match-message-container" );
            if ( elMessageContainer )
            {
                if ( show )
                {
                    elMessageContainer.RemoveClass( 'hide' );
                }
                else
                {
                    elMessageContainer.AddClass( 'hide' );
                }
            }
        }
    }

    function _IsMatchMetadataFullyLoaded( elParentPanel )
    {
        return ( ( ( elParentPanel.matchListDescriptor == 'live' ) && ( elParentPanel.matchId != 'gotv' ) ) || ( MatchInfoAPI.GetMatchMetadataFullState( elParentPanel.matchId ) ) );
    }

    function _DownloadMatch( elParentPanel )
    {
        MatchInfoAPI.Delete( elParentPanel.matchId );
        MatchInfoAPI.Download( elParentPanel.matchId );
        _UpdateMatchMenu( elParentPanel );
    }

    function _DownloadFailedNotify( elParentPanel )
    {
        var canDownload = !( elParentPanel.matchListDescriptor === 'downloaded' )
                          && ( ( MatchInfoAPI.GetMatchState( elParentPanel.matchInfo ) === 'recent' ) || ( elParentPanel.isTournament ) );
        if ( canDownload )
        {
            UiToolkitAPI.ShowGenericPopupYesNo( $.Localize( "#WatchMenu_Info_Download_Failed" ), $.Localize( "#WatchMenu_Info_Download_Failed_Retry" ), '', function() { _DownloadMatch( elParentPanel ) }, function() {} );
        }
        else
        {
            UiToolkitAPI.ShowGenericPopupOk( $.Localize( "#WatchMenu_Info_Download_Failed" ), $.Localize( "#WatchMenu_Info_Download_Failed_Info" ), '', function() {} );
        }
    }

    function _DeleteDemo( elParentPanel )
    {
        MatchInfoAPI.Delete( elParentPanel.matchId )
        if ( elParentPanel.matchListDescriptor === 'downloaded' )
        {
            mainmenu_watch.UpdateActiveTab();
        }
        else
        {
            _UpdateMatchMenu( elParentPanel );
        }
    }

    function _Watch( elParentPanel )
    {
        MatchInfoAPI.Watch( elParentPanel.matchId );
    }

    function _WatchHighlights( elParentPanel )
    {
        MatchInfoAPI.WatchHighlights( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid );
	}
	
	function _WatchLowlights( elParentPanel )
    {
        MatchInfoAPI.WatchLowlights( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid );
    }
    
    function _ShareMatch( elParentPanel )
    {
        SteamOverlayAPI.CopyTextToClipboard( MatchInfoAPI.GetMatchShareToken( elParentPanel.matchId, "copyurl" ) );
        var elShareLinkButton = elParentPanel.FindChildInLayoutFile( 'id-mi-copy' );
        UiToolkitAPI.HideTextTooltip();
        UiToolkitAPI.ShowTextTooltipOnPanel( elShareLinkButton, $.Localize("#WatchMenu_Share_Link_Copied") );
    }

    function _UpdateMatchMenu( elParentPanel )
    {   
        var matchState = MatchInfoAPI.GetMatchState( elParentPanel.matchId );

        var elDownloadButton = elParentPanel.FindChildInLayoutFile( 'id-mi-download' );
        var elShareLinkButton = elParentPanel.FindChildInLayoutFile( 'id-mi-copy' );
        var elWatchButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch' );
		var elWatchHighlightsButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch-highlights' );
		var elWatchLowlightsButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch-lowlights' );
        var elDeleteButton = elParentPanel.FindChildInLayoutFile( 'id-mi-delete' );
        var elDownloadingButton = elParentPanel.FindChildInLayoutFile( 'id-mi-downloading' );
        var elDownloadFailedButton = elParentPanel.FindChildInLayoutFile( 'id-mi-error-delete' );

        function _ShowButton( elButton, value )
        {
            if ( elButton )
            {
                if ( value )
                {
                    elButton.RemoveClass( 'hide' );
                }
                else
                {
                    elButton.AddClass( 'hide' );
                }
            }
        }

        function _EnableButton( elButton, value )
        {
            if ( elButton )
            {
                if ( value )
                {
                    elButton.enabled = true;
                }
                else
                {
                    elButton.enabled = false;
                }
            }
        }

        var canWatch = MatchInfoAPI.CanWatch( elParentPanel.matchId );
		_EnableButton( elWatchButton, canWatch );
		
        if ( elParentPanel.matchListDescriptor != 'live' )
        {
			_ShowButton( elWatchButton, canWatch );
			_ShowButton( elWatchHighlightsButton, canWatch );
			_ShowButton( elWatchLowlightsButton, canWatch );
			_ShowButton( elDownloadButton, !canWatch );

			if ( elParentPanel.matchListDescriptor != 'downloaded' )
            {
				var szDownloadButtonHint = '#WatchMenu_Download_Demo';

                if ( matchState === "downloaded" )
                {
                    _EnableButton( elDownloadButton, false );
                    _ShowButton( elDownloadingButton, false );
					_ShowButton( elDownloadFailedButton, false );
                }
                else if ( matchState === "downloading" )
                {
                    _EnableButton( elDownloadButton, false );
                    _ShowButton( elDownloadingButton, true );
					_ShowButton( elDownloadFailedButton, false );
					_ShowButton( elWatchHighlightsButton, false );
					_ShowButton( elWatchLowlightsButton, false );
					_ShowButton( elWatchButton, false );
                }
                else if ( MatchInfoAPI.CanDownload( elParentPanel.matchId ) )
                {
                    _EnableButton( elDownloadButton, true );
                    _ShowButton( elDownloadingButton, false );
                    _ShowButton( elDownloadFailedButton, false );
                }
                else
                {
					szDownloadButtonHint = '#WatchMenu_Download_Disabled_Hint';
                    _EnableButton( elDownloadButton, false );
                    _ShowButton( elDownloadingButton, false );
                    _ShowButton( elDownloadFailedButton, false );
				}
				
                _EnableButton( elShareLinkButton, ( elParentPanel.matchShareToken != "" ) && ( elParentPanel.matchShareToken != undefined ) );
                
				
				elDownloadButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elDownloadButton, szDownloadButtonHint ); } );
				elDownloadButton.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
            }
            else
            {
                _ShowButton( elDownloadButton, false );
                _ShowButton( elDownloadingButton, false );
                _ShowButton( elDownloadFailedButton, false );
            }

			var bEnabledReelLightsButton = ( ( elParentPanel.activePlayerRow ) && ( MatchInfoAPI.CanWatchHighlights( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid ) ) );
			_EnableButton( elWatchHighlightsButton, bEnabledReelLightsButton );
			_EnableButton( elWatchLowlightsButton, bEnabledReelLightsButton );

            var canDelete = MatchInfoAPI.CanDelete( elParentPanel.matchId );
            _EnableButton( elDeleteButton, canDelete );
            
            if ( !canWatch && canDelete )
            {
                _ShowButton( elDownloadFailedButton, true );
            }
        }
        else
        {
            _ShowButton( elDownloadButton, false );
            _ShowButton( elDownloadingButton, false );
            _ShowButton( elDownloadFailedButton, false );
			_ShowButton( elWatchHighlightsButton, false );
			_ShowButton( elWatchLowlightsButton, false );
            _ShowButton( elShareLinkButton, false );
            _ShowButton( elDeleteButton, false );
        }
    }

    function _Refresh( elParentPanel )
    {
        function _ShowLoadingError( elBoundParentPanel )
        {
            _ShowMatchSpinner( false, elBoundParentPanel );
            _SetMatchMessage( $.Localize( 'CSGO_Watch_NoMatchData'), true, elBoundParentPanel );
            if ( elBoundParentPanel.updateMatchInfoHandler )
            {
                $.UnregisterForUnhandledEvent( 'PanoramaComponent_MatchInfo_StateChange', elBoundParentPanel.updateMatchInfoHandler );
            }
            elParentPanel.downloadFailedHandler = undefined;
        }
        
        if ( _IsMatchMetadataFullyLoaded( elParentPanel ) )
        {
            _PopulateMatchInfo( elParentPanel );
        }
        else if ( !elParentPanel.downloadFailedHandler )
        {
            MatchInfoAPI.DownloadWithShareToken( elParentPanel.matchId );
            elParentPanel.downloadFailedHandler = $.Schedule(  3.0, _ShowLoadingError.bind( undefined, elParentPanel ) );
            elParentPanel.updateMatchInfoHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_MatchInfo_StateChange', _PopulateMatchInfo.bind( undefined, elParentPanel ) );
        }
    }

    function _PopulateMatchInfo( elParentPanel )
    {  
        if ( elParentPanel.downloadFailedHandler )
        {
            $.CancelScheduled( elParentPanel.downloadFailedHandler )
            elParentPanel.downloadFailedHandler = undefined;
        }
        _FillScoreboard( elParentPanel );
        _UpdateMatchMenu( elParentPanel );
        if ( elParentPanel.matchListDescriptor != 'live' )
        {
            _FillRoundStats( elParentPanel, elParentPanel.activePlayerRow );
        }
        _Show( elParentPanel );
    }

    function _UpdateName( elParentPanel, elPlayerName )
    {
        if ( elParentPanel.isTournament )
        {
            elPlayerName.text = MatchInfoAPI.GetMatchPlayerStat( elParentPanel.matchId, elPlayerName.playerXuid, 'name' );
        }
        else
        {
            elPlayerName.text = FriendsListAPI.GetFriendName( elPlayerName.playerXuid );
        }
    }

    function _UpdateTitle( elParentPanel, playerXuid )
    {
        if ( elParentPanel.isTournament )
        {
            elParentPanel.SetDialogVariable( 'playerNameTitle', MatchInfoAPI.GetMatchPlayerStat( elParentPanel.matchId, playerXuid, 'name' ) );
        }
        else
        {
            elParentPanel.SetDialogVariable( 'playerNameTitle', FriendsListAPI.GetFriendName( playerXuid ) );
        }

		var elWatchHighlightsButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch-highlights' );
		var elWatchLowlightsButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch-lowlights' );
        if ( elWatchHighlightsButton )
        {
			elWatchHighlightsButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elWatchHighlightsButton, UiToolkitAPI.MakeStringSafe( $.Localize( '#WatchMenu_Watch_Highlights_Player_Selected', elParentPanel) ) ); } );
			elWatchLowlightsButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elWatchLowlightsButton, UiToolkitAPI.MakeStringSafe( $.Localize( '#WatchMenu_Watch_Lowlights_Player_Selected', elParentPanel) ) ); } );
        }
    }

    function _Show( elParentPanel )
    {
        elParentPanel.SetReadyForDisplay( true );
        elParentPanel.visible = true;
        elParentPanel.RemoveClass( 'mi-sb--hidden' );

        elParentPanel.updateMatchMenuHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_MatchInfo_StateChange', _UpdateMatchMenu.bind( undefined, elParentPanel) );

    }

    function _OnFadeOutEnd( elParentPanel, propertyName )
    {
        if( elParentPanel.visible === true && elParentPanel.BIsTransparent() )
        {
                                                           
            elParentPanel.visible = false;
            elParentPanel.SetReadyForDisplay( false );
        }
    }

    function _Hide( elParentPanel )
    {
        for ( var teamId in TEAMS )
        {
            var elTeam = elParentPanel.FindChildInLayoutFile( 'players-table-' + TEAMS[teamId] );
            for ( var i = 0; i < TEAMSIZE; i++ )
            {
                var elPlayerName = elTeam.GetChild( i ).FindChildTraverse( 'name__label');
                $.UnregisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', elPlayerName.nameUpdateHandler );
                elPlayerName.nameUpdateHandler = undefined;
            }
        }
        if ( elParentPanel.downloadFailedHandler )
        {
            $.CancelScheduled( elParentPanel.downloadFailedHandler );
            elParentPanel.downloadFailedHandler = undefined;
        }

        if ( elParentPanel.updateMatchInfoHandler )
        {
            $.UnregisterForUnhandledEvent( 'PanoramaComponent_MatchInfo_StateChange', elParentPanel.updateMatchInfoHandler );
            elParentPanel.updateMatchInfoHandler = undefined;
        }

        var elTitle = elParentPanel.FindChildInLayoutFile( 'id-mi-player-stats-title' );
        if ( elTitle.nameUpdateHandler )
        {
            $.UnregisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', elTitle.nameUpdateHandler );
            elTitle.nameUpdateHandler = undefined;
        }

        elParentPanel.AddClass( 'mi-sb--hidden' );
    }

                                                         
    function _ResizeRoundStatBars( elParentPanel )
    {
        if ( elParentPanel.matchListDescriptor === 'live' )
        {
            return;
        }

        var elStatsContainer = elParentPanel.FindChildInLayoutFile( 'id-mi-round-stats__container' );
        var elTickLabels = elParentPanel.FindChildInLayoutFile( 'id-mi-round-stats__tick-labels' );

        var totalBars = elStatsContainer.Children().length;

        if ( totalBars == 0 )
        {
            return;
        }

        var statsContainerWidth = 900;
        var elRoot = $.GetContextPanel().Data().elMainMenuRoot;
        if ( elRoot && ( elRoot.BHasClass( "AspectRatio4x3" ) || elRoot.BHasClass( "AspectRatio5x4" ) ) ) 
        {
            statsContainerWidth = 750;
        }

        var totalBars = elStatsContainer.Children().length;

        var barWidth = Math.floor( statsContainerWidth/totalBars );
        var labelContainerWidth = ( totalBars + 2 ) * barWidth + 'px';
        barWidth = barWidth + 'px';
        
        elTickLabels.style.width = labelContainerWidth;

        for ( var i = 1; i <= totalBars; i++ )
        {
            var elRoundStats = elStatsContainer.GetChild( i-1 );
            var elRoundBar = elRoundStats.FindChildTraverse( 'id-mi-round-summary-bar__container' );
            var elIconContainer = elRoundStats.FindChildTraverse( 'id-mi-icons__container');
            elRoundBar.style.width = barWidth;
            elIconContainer.style.width = barWidth;
        }
    }

    function _FillRoundStats( elParentPanel, elPlayerRow )
    {
        var tickPattern = [ 
            'mi-round-tick--major',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--minor',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--minor',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--left-of-team-switch',
            'mi-round-tick--right-of-team-switch',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--minor',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--minor',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--major'
        ]
        var tickPatternOvertime = [
            'mi-round-tick--right-of-team-switch',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--sub',
            'mi-round-tick--major'
        ]

        function flipBit( n )
        {
            if ( n == 0 ) return 1;
            return 0;
        }

        var elTitle = elParentPanel.FindChildInLayoutFile( 'id-mi-player-stats-title' );
        if ( elTitle.nameUpdateHandler == undefined )
        {
            elTitle.nameUpdateHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', _UpdateTitle.bind( undefined, elParentPanel, elPlayerRow.playerXuid ) );
        }
        _UpdateTitle( elParentPanel, elPlayerRow.playerXuid );

        var currentTeamId = elPlayerRow.teamId;
        
        if ( MatchInfoAPI.GetTeamsAreSwitchedFromStart( elParentPanel.matchId ) )
        {
            currentTeamId = flipBit( currentTeamId );
        }

        if ( elParentPanel.activePlayerRow )
        {
            elParentPanel.activePlayerRow.checked = false;
            elParentPanel.activePlayerRow.RemoveClass( 'no-hover' );
        }
        elPlayerRow.checked = true;
        elPlayerRow.AddClass( 'no-hover' );
        elParentPanel.activePlayerRow = elPlayerRow;

        elParentPanel.FindChildInLayoutFile( 'id-mi-player-stats' ).RemoveClass( 'mi-player-stats__collapse' );

        var elStatsContainer = elParentPanel.FindChildInLayoutFile( 'id-mi-round-stats__container' );
        var elTickLabels = elParentPanel.FindChildInLayoutFile( 'id-mi-round-stats__tick-labels' );
		var playedRounds = MatchInfoAPI.GetMatchRoundScoreForTeam( elParentPanel.matchId, 0 ) + MatchInfoAPI.GetMatchRoundScoreForTeam( elParentPanel.matchId, 1 );
        var totalRounds = 30 >= playedRounds ? 30 : playedRounds;
        var nOvertime = Math.ceil( ( totalRounds - 30 ) / 6 );
        if ( nOvertime > 0 )
        {
            totalRounds = 30 + 6 * nOvertime;
        }
        var totalBars = elStatsContainer.Children().length;

                               

        if ( ( totalBars === 0 ) && ( totalRounds > 30 ) )
        {
                                                                          
            elTickLabels.FindChildInLayoutFile('id-mi-tick-label--last').AddClass( 'hide' );

            var elOTStartContainer = $.CreatePanel( 'Panel', elTickLabels, "" );
            var elOTStart = $.CreatePanel( 'Label', elOTStartContainer, "" );
            elOTStart.AddClass( 'mi-tick-label' );
            for ( var i = 0; i < nOvertime; i++ )
            {
                elOTStartContainer.AddClass( 'mi-tick-label__container--large' );
                if ( nOvertime > 1 )
                {
                    elOTStart.text = $.Localize( '#MatchInfo_Overtime' ) + ' ' + ( i + 1 );
                }
                else
                {
                    elOTStart.text = $.Localize( '#MatchInfo_Overtime' );
                }
                $.CreatePanel( 'Panel', elTickLabels, "" ).AddClass( 'mi-tick-label__spacer--double' );
                var elLabelContainer = $.CreatePanel( 'Panel', elTickLabels, "" );
                elLabelContainer.AddClass( 'mi-tick-label__container' );
                var elOTEnd = $.CreatePanel( 'Label', elLabelContainer, 'id-mi-ot-end' );
                elOTEnd.AddClass( 'mi-tick-label' );
                elOTEnd.text = totalRounds;            
                elOTStart = elOTEnd;
                elOTStartContainer = elLabelContainer;
            }
        }

		                        
		var roundWins = MatchInfoAPI.GetMatchPlayerRoundStats( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid, "round_wins" );
		roundWins = roundWins ? roundWins.split( ',' ) : Array( totalRounds ).fill( 0 );
		var mvps = MatchInfoAPI.GetMatchPlayerRoundStats( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid, "mvps" );
		mvps = mvps ? mvps.split( ',' ) : Array( totalRounds ).fill( 0 );
		var kills = MatchInfoAPI.GetMatchPlayerRoundStats( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid, "enemy_kills" );
		kills = kills ? kills.split( ',' ) : Array( totalRounds ).fill( 0 );
		var headshots = MatchInfoAPI.GetMatchPlayerRoundStats( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid, "enemy_headshots" );
		headshots = headshots ? headshots.split( ',' ) : Array( totalRounds ).fill( 0 );
		var deaths = MatchInfoAPI.GetMatchPlayerRoundStats( elParentPanel.matchId, elParentPanel.activePlayerRow.playerXuid, "deaths" );
		deaths = deaths ? deaths.split( ',' ) : Array( totalRounds ).fill( 0 );

                   
        var canWatch = MatchInfoAPI.CanWatch( elParentPanel.matchId );

        for ( var i = 1; i <= totalRounds; i++ )
        {
            var elRoundStats = undefined;
            if ( i > totalBars )
            {
                elRoundStats = $.CreatePanel( 'Button', elStatsContainer, 'id-stat-bar-round' + i );
                elRoundStats.BLoadLayoutSnippet( 'snippet_mi-round-summary-bar' );
                elRoundStats.AddClass( 'round-selection-button' );
            }
            else
            {
               elRoundStats = elStatsContainer.GetChild( i-1 );
            }
            
            var elRoundBar = elRoundStats.FindChildTraverse( 'id-mi-round-summary-bar__container' );
            var elIconContainer = elRoundStats.FindChildTraverse( 'id-mi-icons__container');

            if ( i > totalBars )
            {                
                var elTick = elRoundBar.GetChild( 2 ).GetChild( 1 );

                if ( i <= 30 )                   
                {
                    elTick.AddClass( tickPattern[i-1] );
                }
                else            
                {
                    var c = tickPatternOvertime[ ( i - 31 ) % 6 ];
                    elTick.AddClass( c );
                }
                                      
                if ( ( i >= 30 ) && ( ( ( i - 30 ) % 6 ) == 0 ) && ( i != totalRounds ) )
                {
                    elTick.AddClass(  'mi-round-tick--left-of-team-switch' );
                }
                
            }
            else
            {
                elRoundBar.RemoveClass( 'hide' );
            }
            var elWinBar = elRoundBar.GetChild( 0 ).GetChild( 0 );
            var elWinLossBorder = elRoundBar.GetChild( 1 );
            var elLossBar = elRoundBar.GetChild( 2 ).GetChild( 0 );
            if ( i > playedRounds )
            {
                elWinLossBorder.RemoveClass( 'sb-tint--CT' )
                elWinLossBorder.RemoveClass( 'sb-tint--TERRORIST' )
                elWinBar.AddClass( 'mi-round-summary-bar--EMPTY' );
                elLossBar.AddClass( 'mi-round-summary-bar--EMPTY' );
                elIconContainer.AddClass( 'hide' );
                elRoundStats.AddClass( 'no-hover' );
            }
            else
            {
                if ( !canWatch ) 
                {
                    elRoundStats.AddClass( 'no-hover' );
                }
                else
                {
                    elRoundStats.style.tooltipPosition = "bottom";
                    elRoundStats.style.tooltipBodyPosition = "50% 0%"
                    function _OnRoundMouseOver( elButton )
                    {
                        UiToolkitAPI.ShowTextTooltipOnPanel( elButton, $.Localize( "#CSGO_Watch_Round" ) );
                    }

                    function _OnRoundActivate( nMatch, nRound )
                    {
                        MatchInfoAPI.Watch( nMatch, nRound );
                    }

                    elRoundStats.SetPanelEvent( 'onmouseover', _OnRoundMouseOver.bind( undefined, elRoundStats ) );
                    elRoundStats.SetPanelEvent( 'onmouseout', function(){ UiToolkitAPI.HideTextTooltip(); } );
                    elRoundStats.SetPanelEvent( 'onactivate', _OnRoundActivate.bind( undefined, elParentPanel.matchId, i ) );
                    
                }
                elIconContainer.RemoveClass( 'hide' );

                var n = i-1;

                var elMVPStarImg = elRoundStats.FindChildTraverse( 'id-mvp-star' );
                                                
                if ( mvps[n] != 0)
                {
                    elMVPStarImg.RemoveClass( 'hide' );
                    elMVPStarImg.RemoveClass( 'sb-tint--' + TEAMS[ flipBit( currentTeamId ) ] );
                    elMVPStarImg.AddClass( 'sb-tint--' + TEAMS[ currentTeamId ] );
                }
                else
                {
                    elMVPStarImg.AddClass( 'hide' );
                }

                                     
                var nKills = parseInt( kills[n] );
                var nHeadshots = parseInt( headshots[n] );

                var elEliminationWinIcons = elRoundStats.FindChildTraverse( 'id-mi-eliminations-win' );
                for ( var k = 0; k < 5; k++ )
                {
                    var kIcon = elEliminationWinIcons.FindChildTraverse( 'id-mi-icon-elimination_' + k );
                    var hIcon = elEliminationWinIcons.FindChildTraverse( 'id-mi-icon-elimination--headshot_' + k );
                    if ( k >= ( nKills ) )
                    {
                        kIcon.AddClass( 'hide' );
                        hIcon.AddClass( 'hide' );
                    }
                    else if ( k >= nHeadshots )
                    {
                        kIcon.RemoveClass( 'hide' );
                        hIcon.AddClass( 'hide' );
                    }
                    else
                    {
                        kIcon.AddClass( 'hide' );
                        hIcon.RemoveClass( 'hide' );
                    }
                }

                        
                var elDeathIcon = elIconContainer.FindChildTraverse( 'id-mi-elimination-death' );
                if ( deaths[n] == 1 )
                {
                    elDeathIcon.RemoveClass( 'hide' );
                }
                else
                {
                    elDeathIcon.AddClass( 'hide' );
                }

                if ( roundWins[n] == 1 )
                {
                    elWinBar.RemoveClass( 'mi-round-summary-bar--EMPTY' );
                    elLossBar.AddClass( 'mi-round-summary-bar--EMPTY' );
                }
                else
                {
                    elWinBar.AddClass( 'mi-round-summary-bar--EMPTY' );
                    elLossBar.RemoveClass( 'mi-round-summary-bar--EMPTY' );
                }
                elWinBar.RemoveClass( 'sb-tint--' + TEAMS[ flipBit( currentTeamId ) ] );
                elWinBar.AddClass( 'sb-tint--' + TEAMS[ currentTeamId ] );
                elWinLossBorder.RemoveClass( 'sb-tint--' + TEAMS[ flipBit( currentTeamId ) ] );
                elWinLossBorder.AddClass( 'sb-tint--' + TEAMS[ currentTeamId ] );
                elEliminationWinIcons.RemoveClass( 'sb-tint--' + TEAMS[ flipBit( currentTeamId ) ] );
                elEliminationWinIcons.AddClass( 'sb-tint--' + TEAMS[ currentTeamId ] );
            }
            if ( ( i == 15 ) || ( i == 30 ) || ( ( i > 30 ) && ( ( ( i - 30 ) % 3 ) == 0 ) ) )
            {
                currentTeamId = flipBit( currentTeamId );
            }
        }
        _ResizeRoundStatBars( elParentPanel );
	}
	
	function _OpenPlayerCard( xuid )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.sidemenu_select', 'MOUSE' );
		var elPlayerCardContextMenu = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			'id-player-' + xuid,
			'',
			'file://{resources}/layout/context_menus/context_menu_playercard.xml', 
			'xuid='+xuid,
			function(){}
		)

		elPlayerCardContextMenu.AddClass( "ContextMenu_NoArrow" );
	}

    function _FillScoreboard( elParentPanel )                              
    {

        var elScoreboard = elParentPanel.FindChildInLayoutFile( 'Scoreboard' );
        elScoreboard.visible = true;
        _ShowMatchSpinner( false, elParentPanel );                           
        _SetMatchMessage( "", false, elParentPanel );                           

        function Helper_FillTeamStats( teamId )
        {
            var elTeam = elParentPanel.FindChildInLayoutFile( 'players-table-' + TEAMS[teamId] );
            var elScoreboxBackdrop = elParentPanel.FindChildInLayoutFile( 'id-sb-scorebox_backdrop--' + TEAMS[teamId] );
            if ( elParentPanel.isTournament )
            {
                elScoreboxBackdrop.SetImage( 'file://{images}/tournaments/teams/' + MatchInfoAPI.GetMatchTournamentTeamTag( elParentPanel.matchId, teamId ).toLowerCase() + '.svg' );
                elScoreboxBackdrop.AddClass( 'scorebox_backdrop--tournament' );
                elParentPanel.SetDialogVariable( 'sb_team_name--' + TEAMS[teamId], MatchInfoAPI.GetMatchTournamentTeamName( elParentPanel.matchId, teamId ) );
            }
            else
            {
                elParentPanel.SetDialogVariable( 'sb_team_name--' + TEAMS[teamId], $.Localize( '#teamname_' + TEAMS[teamId] ) );
            }
            elParentPanel.SetDialogVariable( 'score_' + TEAMS[teamId], MatchInfoAPI.GetMatchRoundScoreForTeam( elParentPanel.matchId, teamId ) );
            for ( var i = 0; i < TEAMSIZE; i++ )
            {
                var elPlayerRow = elTeam.GetChild( i );
                var playerXuid = elPlayerRow.playerXuid;
                var elPlayerName = elPlayerRow.FindChildTraverse( 'name__label');
				var elAvatarImage = elPlayerRow.FindChildTraverse( 'avatar' );
				var elAvatarTeamLogo = elPlayerRow.FindChildTraverse( 'avatarteamlogo' );
                if ( !elParentPanel.teamsFilled )
                {
                    elPlayerName.matchId = elParentPanel.matchId;
                    elPlayerName.playerXuid = playerXuid;
					elAvatarImage.SetPanelEvent( 'onactivate', _OpenPlayerCard.bind( undefined, playerXuid ) );
					elAvatarTeamLogo.SetPanelEvent( 'onactivate', _OpenPlayerCard.bind( undefined, playerXuid ) );
                }
                if ( elPlayerName.nameUpdateHandler == undefined )
                {
                    elPlayerName.nameUpdateHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', _UpdateName.bind( undefined, elParentPanel, elPlayerName ) );
                }
                _UpdateName( elParentPanel, elPlayerName );
                
                    
                if ( !elParentPanel.teamsFilled )
                {
					elAvatarImage.visible = !elParentPanel.isTournament;
					elAvatarTeamLogo.visible = elParentPanel.isTournament;
					if ( elParentPanel.isTournament )
					{
						elAvatarTeamLogo.SetImage( 'file://{images}/tournaments/teams/' + MatchInfoAPI.GetMatchTournamentTeamTag( elParentPanel.matchId, teamId ).toLowerCase() + '.svg' );
					}
                    else if ( elAvatarImage.steamid !== playerXuid )
                    {
                        elAvatarImage.steamid = playerXuid;
                    }
                }

                for ( var p in PLAYERSTATS )
                {
                    var elStat = elPlayerRow.FindChildTraverse( PLAYERSTATS[p] )
                    var elStatData = MatchInfoAPI.GetMatchPlayerStat( elParentPanel.matchId, playerXuid, PLAYERSTATS[p] );
                    elStat.text = elStatData;
                    if ( PLAYERSTATS[p] === 'mvps' )
                    {
                        if ( elStatData == 0 )
                        {
                            elPlayerRow.FindChildTraverse( 'mvps__panel' ).AddClass( 'hide-mvps' );
                        }
                        else
                        {
                            elPlayerRow.FindChildTraverse( 'mvps__panel' ).RemoveClass( 'hide-mvps' );
                        }
                    }
                }
            }
        }

        Helper_FillTeamStats( 0 );
        Helper_FillTeamStats( 1 );
        elParentPanel.teamsFilled = true;

        var rawMapName = MatchInfoAPI.GetMatchMap( elParentPanel.matchId );
        var mapStringPrefix = 'SFUI_Map_';
        var mapName = $.Localize( mapStringPrefix + rawMapName );
        if ( mapName === mapStringPrefix + rawMapName ) mapName = rawMapName;
        elParentPanel.SetDialogVariable( 'map_name', mapName );
        var elMatchMapIcon = elParentPanel.FindChildTraverse( "id-mi-map-icon" );

        var setDefaultMapImage = function ( mapIcon )
        {
            mapIcon.SetImage( "file://{images}/map_icons/map_icon_NONE.png" );
        }

        if ( elMatchMapIcon )
        {
            $.RegisterEventHandler( 'ImageFailedLoad', elMatchMapIcon, setDefaultMapImage.bind( undefined, elMatchMapIcon ) );
            elMatchMapIcon.SetImage( "file://{images}/map_icons/map_icon_"+rawMapName+".png" );
        }

        var matchDuration = MatchInfoAPI.GetMatchDuration( elParentPanel.matchId );
        matchDuration = ( matchDuration / 60 ).toFixed( 0 );
        var minuteString = 'CSGO_Watch_Minutes'
        if ( matchDuration === 1 )
            minuteString = 'CSGO_Watch_Minute';
        matchDuration = matchDuration + ' ' + $.Localize( minuteString );
        elParentPanel.SetDialogVariable( 'duration', matchDuration );
        
        if ( elParentPanel.matchListDescriptor === 'live' )
        {
            var round = 1 + MatchInfoAPI.GetMatchRoundScoreForTeam( elParentPanel.matchId, 0 ) + MatchInfoAPI.GetMatchRoundScoreForTeam( elParentPanel.matchId, 1 );
            var progressionStateString = 'WatchMenu_FirstHalf';
            if ( round > 15 )
            {
                progressionStateString = 'WatchMenu_SecondHalf';
            }
            else if ( round > 30 )
            {
                progressionStateString = 'WatchMenu_Overtime';
            }
            elParentPanel.SetDialogVariable( 'dateOrRound', $.Localize( progressionStateString ) );
            elParentPanel.SetDialogVariable( 'dateOrRoundLabel', $.Localize( '#CSGO_Watch_Info_4' ) );
            elParentPanel.SetDialogVariable( 'durationLabel', $.Localize( "CSGO_Watch_Info_5" ) );
        }
        else
        {
            elParentPanel.SetDialogVariable( 'dateOrRound', MatchInfoAPI.GetMatchTimestamp( elParentPanel.matchId ) );
            elParentPanel.SetDialogVariable( 'dateOrRoundLabel', $.Localize( '#CSGO_Watch_Info_2' ) );
            elParentPanel.SetDialogVariable( 'durationLabel', $.Localize( "CSGO_Watch_Info_1" ) );
        }
    }


    function _Init( elParentPanel )
    {
        _ShowMatchSpinner( true, elParentPanel );                           
        _SetMatchMessage( "", false, elParentPanel );                           

        var myXuid = MyPersonaAPI.GetXuid();

        function Helper_CreateScoreboard( teamId )
        {
            var elRowToActivate = undefined;
            var elTeam = elParentPanel.FindChildInLayoutFile( 'players-table-' + TEAMS[teamId] );
            for ( var i = 0; i < TEAMSIZE; i++ )
            {   
                var playerXuid = MatchInfoAPI.GetMatchPlayerXuidByIndexForTeam( elParentPanel.matchId, teamId, i );
                var elPlayerRow = $.CreatePanel( 'Panel', elTeam, 'id-player-' + playerXuid );
                elPlayerRow.playerXuid = playerXuid;
                elPlayerRow.teamId = teamId;
                if ( elParentPanel.matchListDescriptor != 'live' )
                {
                    elPlayerRow.SetPanelEvent( 'onactivate', _FillRoundStats.bind( undefined, elParentPanel, elPlayerRow ) );
                    if ( ( ( i == 0 ) && ( teamId == 0 ) ) || ( myXuid === playerXuid ) )
                    {
                        elParentPanel.activePlayerRow = elPlayerRow;
                    }
                }
                elPlayerRow.BLoadLayoutSnippet( 'snippet_scoreboard-classic__row--comp' );
                var elAvatarImage = elPlayerRow.FindChildTraverse( 'avatar' );
				elAvatarImage.AddClass( 'sb-row__cell--avatar--' + TEAMS[teamId] );
				
				var elPlayerNameLabel = elPlayerRow.FindChildTraverse( 'name__label' );
				elPlayerNameLabel.AddClass( 'sb-tint--' + TEAMS[teamId] );
				elPlayerNameLabel.SetPanelEvent( 'onactivate',
					function( elParentPanel, elPlayerRow, playerXuid )
					{	                                                  
						if ( elParentPanel.matchListDescriptor != 'live' )
							_FillRoundStats( elParentPanel, elPlayerRow );
						_OpenPlayerCard( playerXuid );
					}
					.bind( undefined, elParentPanel, elPlayerRow, playerXuid ) );

                var elStatsContainer = elPlayerRow.FindChildTraverse( 'id-sb-row-stats' );

                for ( var p in PLAYERSTATS )
                {
                    var elStat;
                    if ( PLAYERSTATS[p] ==='mvps' )
                    {
                        var elMvpsPanel = $.CreatePanel( 'Panel', elStatsContainer, 'mvps__panel' );
                        var elStar = $.CreatePanel( "Image", elMvpsPanel, 'mvps--image' );
                        elStar.SetImage( 'file://{images}/icons/ui/star.svg' );
						elStar.text = $.Localize( 'Scoreboard_MVP_Star' );
                        elStat = $.CreatePanel( 'Label', elMvpsPanel, PLAYERSTATS[p] );
                        elStat.AddClass( 'mi-mvps-shrink-overflow' );
                        elMvpsPanel.AddClass( 'sb-row__cell' );
                        elMvpsPanel.AddClass( 'sb-row__cell--mvps' );
                        elStar.AddClass( 'sb-row__cell--mvps__star' );
						elStat.AddClass( 'sb-row__cell--mvps__count'  );
						elStat = elMvpsPanel;                                                   
                    }
                    else
                    {
                        elStat = $.CreatePanel( 'Panel', elStatsContainer, "" );
                        elStat.AddClass( 'sb-row__cell' );
                        elStat.AddClass( 'sb-row__cell--' + PLAYERSTATS[p] );
                        elStat = $.CreatePanel( 'Label', elStat, PLAYERSTATS[p] );
					}
					
					elStat.AddClass( 'sb-tint--' + TEAMS[teamId] );
                }
            }
        }
        
        Helper_CreateScoreboard( 0 );
        Helper_CreateScoreboard( 1 );

        var tournamentName = MatchInfoAPI.GetMatchTournamentName( elParentPanel.matchId );
        elParentPanel.isTournament = ( ( tournamentName != "" ) && ( tournamentName != undefined ) );
        elParentPanel.matchShareToken = MatchInfoAPI.GetMatchShareToken( elParentPanel.matchId, "text" );

        elParentPanel.downloadFailedTest = undefined;
        elParentPanel.updateMatchInfoHandler = undefined;
        elParentPanel.teamsFilled = false;
        var elColumnLabels = elParentPanel.FindChildInLayoutFile( 'players-table__labels-row' )
        for ( var p in PLAYERSTATS )
        {
            var elStatContainter = $.CreatePanel( 'Panel', elColumnLabels, "" );
            elStatContainter.AddClass( 'sb-row__cell' );
			elStatContainter.AddClass( 'sb-row__cell--' + PLAYERSTATS[p] );
			elStatContainter.AddClass( 'matchinfo-scoreboard-header-stat-cell' );
            var elStatLabel = $.CreatePanel( 'Label', elStatContainter, PLAYERSTATS[p] );
            elStatLabel.text = $.Localize( '#Scoreboard_' + PLAYERSTATS[p] );
        }

        $.RegisterEventHandler( 'PropertyTransitionEnd', elParentPanel, _OnFadeOutEnd.bind( undefined, elParentPanel ) );

        var elDownloadButton = elParentPanel.FindChildInLayoutFile( 'id-mi-download' );
        var elShareLinkButton = elParentPanel.FindChildInLayoutFile( 'id-mi-copy' );
        var elWatchButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch' );
		var elWatchHighlightsButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch-highlights' );
		var elWatchLowlightsButton = elParentPanel.FindChildInLayoutFile( 'id-mi-watch-lowlights' );
        var elDeleteButton = elParentPanel.FindChildInLayoutFile( 'id-mi-delete' );
        var elDownloadingButton = elParentPanel.FindChildInLayoutFile( 'id-mi-downloading' );
        var elDownloadFailedButton = elParentPanel.FindChildInLayoutFile( 'id-mi-error-delete' );

        if ( elWatchButton && ( elParentPanel.matchListDescriptor == 'live' ) )
        {
            var elWatchLabel = elWatchButton.GetChild( 0 );
            elWatchLabel.text = $.Localize(  "#WatchMenu_Watch_Live" );
            elWatchLabel.style.textTransform = "uppercase";
        }

        elDownloadButton.SetPanelEvent( 'onactivate', _DownloadMatch.bind( undefined, elParentPanel ) );
        elShareLinkButton.SetPanelEvent( 'onactivate', _ShareMatch.bind( undefined, elParentPanel ) );
        elShareLinkButton.SetDialogVariable( 'matchcode', elParentPanel.matchShareToken );
        elShareLinkButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elShareLinkButton, $.Localize( '#WatchMenu_Get_Share_Link') ); } );
        elShareLinkButton.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
        elWatchButton.SetPanelEvent( 'onactivate', _Watch.bind( undefined, elParentPanel ) );
        elWatchHighlightsButton.SetPanelEvent( 'onactivate', _WatchHighlights.bind( undefined, elParentPanel ) );
        elWatchHighlightsButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elWatchHighlightsButton, $.Localize( '#WatchMenu_Watch_Highlights') ); } );
        elWatchHighlightsButton.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
        elWatchLowlightsButton.SetPanelEvent( 'onactivate', _WatchLowlights.bind( undefined, elParentPanel ) );
        elWatchLowlightsButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elWatchLowlightsButton, $.Localize( '#WatchMenu_Watch_Lowlights') ); } );
        elWatchLowlightsButton.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );
        elDeleteButton.SetPanelEvent( 'onactivate', _DeleteDemo.bind( undefined, elParentPanel ) );
        elDeleteButton.SetPanelEvent( 'onmouseover', function(){ UiToolkitAPI.ShowTextTooltipOnPanel( elDeleteButton, $.Localize( '#WatchMenu_Delete') ); } );
        elDeleteButton.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );

        elDownloadFailedButton.SetPanelEvent( 'onactivate', _DownloadFailedNotify.bind( undefined, elParentPanel ) );

        _Refresh( elParentPanel );
    }

                          
	return {
        Init                    : _Init,
        Hide                    : _Hide,
        Refresh                 : _Refresh,
        ResizeRoundStatBars     : _ResizeRoundStatBars
    };

})();

                                                                                                    
                                           
                                                                                                    
(function()
{
})();

