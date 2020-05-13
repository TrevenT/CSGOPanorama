'use strict';

var matchList = ( function() {

    var _m_myXuid = MyPersonaAPI.GetXuid();

    function _ShowListSpinner( value, tab )
    {
        if ( tab )
        {
            var elSpinner = tab.FindChildInLayoutFile( "id-list-spinner" );
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
    
    function _SetListMessage( value, show, tab = undefined )
    {
        if ( tab )
        {
            var elMessage = tab.FindChildInLayoutFile( "id-list-message" );
            if ( elMessage )
            {
                elMessage.text = value;
            }
            var elMessageContainer = tab.FindChildInLayoutFile( "id-list-message-container" );
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

    function _ShowInfoPanel( value, tab = undefined )
    {
        if ( tab )
        {
            var elInfoPanel = tab.FindChildInLayoutFile( "Info" );
            var elMatchList = tab.FindChildInLayoutFile( "JsMatchList" );
            if ( elInfoPanel )
            {
                if ( value )
                {
                    elInfoPanel.AddClass( 'subsection-content__background-color--dark' );
                }
                else
                {
                    elInfoPanel.RemoveClass( 'subsection-content__background-color--dark' );
                }
            }
            if ( elMatchList )
            {
                if ( value )
                {
                    elMatchList.AddClass( "MatchList--Filled" );
                }
                else
                {
                    elMatchList.RemoveClass( "MatchList--Filled" );
                }
            }
        }
    }

    function _ClearList( elListPanel, tournament_id )
    {
        var activeTiles = elListPanel.Children();
        for ( var i = activeTiles.length - 1; i >= 0; i-- )
        {
            if ( activeTiles[i].markForDelete )
            {
                if ( elListPanel.activeButton === activeTiles[i] )
                {
                    elListPanel.activeButton = undefined;
                }
                activeTiles[i].checked = false;
                if ( watchTile.downloadStateHandler )
                {
                    $.UnregisterForUnhandledEvent( 'PanoramaComponent_MatchInfo_StateChange', watchTile.downloadStateHandler );
                    watchTile.downloadStateHandler = undefined;
                }
                if ( tournament_id )
                {
                    activeTiles[i].AddClass( 'MatchTile--Collapse' );
                }
                else
                {
                    watchTile.Delete( activeTiles[i] );
                }
            }
        }
    }

    function _SelectFirstTile( parentPanel, elMatchList, matchListDescriptor )
    {
        if ( elMatchList && !( elMatchList.activeButton ) && ( elMatchList.GetChildCount() > 0 ) )
        {
            var tileIsVisible = false;
            var elFirstTile = undefined;
            var n = 0;                                               
            do
            {
                var elFirstTile = elMatchList.GetChild( n );
                tileIsVisible = ( elFirstTile && !elFirstTile.BHasClass( 'MatchTile--Collapse' ) );
                n = n + 1;
            } while ( ( !tileIsVisible ) && ( elFirstTile != undefined ) )
            if ( elFirstTile )
            {
                elFirstTile.checked = true;
                elMatchList.activeButton = elFirstTile;
                elFirstTile.ScrollParentToMakePanelFit( 2, false );
                _PopulateMatchInfo( parentPanel, matchListDescriptor, elFirstTile.matchId )
            }
        }
    }

    function _ReselectActiveTile( elListRoot )
    {
        var elMatchList = elListRoot.FindChildTraverse("JsMatchList");
        if ( elMatchList && elMatchList.activeButton )
        {
            elMatchList.activeButton.checked = true;
            _PopulateMatchInfo( elListRoot, elListRoot.matchListDescriptor, elMatchList.activeButton.matchId )
        }
        else
        {
            _SelectFirstTile( elListRoot, elMatchList, elListRoot.matchListDescriptor );
        }
    }

    var _OnTournamentSectionSelected = function( elParentPanel, elMatchList, matchListDescriptor )
    {
        elParentPanel.matchListIsPopulated = false;
        _UpdateMatchList( elParentPanel, elParentPanel.tournament_id );
        elMatchList.activeButton = undefined;
        _SelectFirstTile( elParentPanel, elMatchList, matchListDescriptor );
    }

    var _PopulateMatchlistDropdown = function( elParentPanel, tournamentId )
    {
        var elMatchlistDropdown = elParentPanel.FindChildTraverse( "id-match-list-selector" );
        elMatchlistDropdown.ClearPanelEvent( 'oninputsubmit' );
        var nSections = PredictionsAPI.GetEventSectionsCount( tournamentId );
        elMatchlistDropdown.RemoveAllOptions();
        for ( var i = 0; i < nSections; i++ )
        {
            var sectionDesc = PredictionsAPI.GetEventSectionIDByIndex( tournamentId, i );
            var sectionName = PredictionsAPI.GetSectionName( tournamentId, sectionDesc );
            sectionName = $.Localize( "#CSGO_MatchInfo_Stage_" + sectionName.replace(/\s+/g, '') );
            var elSection = $.CreatePanel( 'Label', elMatchlistDropdown, 'group_' + sectionDesc, { text: sectionName } );
            elSection.AddClass( "DropDownMenu" );
            elSection.AddClass( "Width-300" );
            elSection.AddClass( "White" );
            elSection.SetAttributeString('value', i );
            elSection.SetAttributeString('section_id', sectionDesc );
            elMatchlistDropdown.AddOption( elSection );
        }
		elMatchlistDropdown.SetSelectedIndex( 0 );
        elMatchlistDropdown.RemoveClass( 'hide' );
        var elMatchList = elParentPanel.FindChildTraverse( "JsMatchList" );
        elMatchlistDropdown.SetPanelEvent( 'oninputsubmit', _OnTournamentSectionSelected.bind( undefined, elParentPanel, elMatchList, tournamentId ) );
    }

    function _UpdateMatchList( elTab, matchListDescriptor )
    {
		var listState = MatchListAPI.GetState( matchListDescriptor );
        
        if ( listState === 'none')
        {
            _RequestMatchListUpdate( elTab, matchListDescriptor ) 
        }
        if ( listState === 'ready' )
        {
            var okToUpdate = ( MatchListAPI.HowManyMinutesAgoCached( matchListDescriptor ) >= 3 )
            if ( okToUpdate )
            {
                _RequestMatchListUpdate( elTab, matchListDescriptor )
                return;
            }
            if ( elTab )
            {
                _PopulateMatchList( elTab, matchListDescriptor );
            }
        }
    }

    function _PopulateMatchInfo( parentPanel, matchListDescriptor, matchId )
    {
        var elMatchList = parentPanel.FindChildTraverse( "JsMatchList" );
        var elButton = parentPanel.FindChildTraverse( matchListDescriptor + "_" + matchId );

        if ( elMatchList.activeButton )
        {
            watchTile.SetParentActive( elMatchList.activeButton, false );
        }
        if ( elButton )
        {
            elMatchList.activeButton = elButton;
        }

        if ( ( parentPanel.activeMatchInfoPanel ) && ( parentPanel.activeMatchInfoPanel.matchId === matchId ) && ( matchId != 'gotv' ) )
        {
            matchInfo.Refresh( parentPanel.activeMatchInfoPanel );
            return;
        }

        if ( ( parentPanel.activeMatchInfoPanel ) && ( parentPanel.activeMatchInfoPanel.matchId != matchId ) )
        {
            matchInfo.Hide( parentPanel.activeMatchInfoPanel );
            parentPanel.activeMatchInfoPanel = undefined;
        }

        var parentInfoPanel = parentPanel.FindChildTraverse( 'Info' );
        parentPanel.activeMatchInfoPanel = parentInfoPanel.FindChild( 'info_' + matchId );
        if ( parentPanel.activeMatchInfoPanel == undefined )
        {
            parentPanel.activeMatchInfoPanel = $.CreatePanel( 'Panel', parentInfoPanel, 'info_' + matchId );
            parentPanel.activeMatchInfoPanel.matchId = matchId;
            parentPanel.activeMatchInfoPanel.matchListDescriptor = matchListDescriptor;
            parentPanel.activeMatchInfoPanel.BLoadLayout( "file://{resources}/layout/matchinfo.xml", false, false );
        
            matchInfo.Init( parentPanel.activeMatchInfoPanel );
        }
        else
        {
            matchInfo.Refresh( parentPanel.activeMatchInfoPanel );
        }
    }

    function _RequestMatchListUpdate( elTab, matchListDescriptor )
    {
        function _ShowLoadingError( elBoundTab )
        {
            _ShowListSpinner( false, elBoundTab );
            _ShowInfoPanel( false, elBoundTab );
            var msg = "";
            if ( elBoundTab.tournament_id )
            {
                msg = "#CSGO_Watch_NoMatch_Tournament_" + elBoundTab.tournament_id.split(':')[1];
            }
            else
            {
                switch( elTab.id )
                {
                    case "JsLive":
                        msg = "#CSGO_Watch_NoMatch_live";
                        break;
                    case "JsYourMatches":
                        msg = "#CSGO_Watch_NoMatch_your";
                        break;
                }
            }
            _SetListMessage( $.Localize( msg ), true, elBoundTab );
            elBoundTab.downloadFailedHandler = undefined;
        }

        if ( elTab )
        {
            _ShowListSpinner( true, elTab );
            _SetListMessage( "", false, elTab );
            _ShowInfoPanel( false, elTab );
            elTab.matchListIsPopulated = false;
            elTab.downloadFailedHandler = $.Schedule(  3.0, _ShowLoadingError.bind( undefined, elTab ) );
            MatchListAPI.Refresh( matchListDescriptor );
        }
    }

    function _MarkActiveTabUnpopulated()
    {
        _m_activeTab.matchListIsPopulated = false;
    }

    function _PopulateMatchList( parentPanel, matchListDescriptor )
    {
        if ( !parentPanel ) return;

        function OnMouseOverButton( currentParentPanel, buttonId )
        {
            var elButton = currentParentPanel.FindChildTraverse( buttonId );
            watchTile.SetParentActive( elButton, true );
        }

        function OnMouseOutButton( currentParentPanel, buttonId )
        {
            var elButton = currentParentPanel.FindChildTraverse( buttonId );
            if ( !elButton.IsSelected() )
            {
                watchTile.SetParentActive( elButton, false );
            }
        }
        
        function _ClearMatchInfo()
        {
            if ( parentPanel.activeMatchInfoPanel )
            {
                matchInfo.Hide( parentPanel.activeMatchInfoPanel );
                parentPanel.activeMatchInfoPanel = undefined;
            }
        }

        function _ShowGOTVConfirmPopup( elListRoot )
        {
            _ClearMatchInfo();
            UiToolkitAPI.ShowGenericPopupOkCancel( $.Localize( 'CSGO_Watch_Gotv_Theater' ), $.Localize( 'CSGO_Watch_Gotv_Theater_tip' ), '', function() { MatchListAPI.StartGOTVTheater( "live" ); }, _ReselectActiveTile.bind( undefined, elListRoot ) );
        }
           
        if ( parentPanel.downloadFailedHandler )
        {
            $.CancelScheduled( parentPanel.downloadFailedHandler );
            parentPanel.downloadFailedHandler = undefined;
        }
		var nCount = MatchListAPI.GetCount( matchListDescriptor );
		                                                                                              
        var sectionDesc = 0;
        var tournamentIndex = 0;
        if ( ( nCount > 0 ) && ( parentPanel.tournament_id ) )
        {
            tournamentIndex = parentPanel.tournament_id.split(':')[1];
            if ( !parentPanel.matchListDropdownIsPopulated )
            {
                if ( tournamentIndex > 3 )
                {
                    _PopulateMatchlistDropdown( parentPanel, parentPanel.tournament_id );
                }
                parentPanel.matchListDropdownIsPopulated = true;
            }
            
            if ( tournamentIndex > 3 )
            {
                var elDropdown = parentPanel.FindChildTraverse( "id-match-list-selector" );
                sectionDesc = elDropdown.GetSelected().GetAttributeString( 'section_id', 0 );
                nCount = PredictionsAPI.GetSectionMatchesCount( parentPanel.tournament_id, sectionDesc );
            }
            else if ( tournamentIndex == 1 )
            {
                nCount = nCount - 3;                                        
            }
            else if ( tournamentIndex == 3 )
            {
                nCount = nCount - 1;                   
            }
        }
        _ShowListSpinner( false, parentPanel );
                                                     
        if ( nCount <= 0 )
        {
            _ShowInfoPanel( false, parentPanel );
            var msg = "";
            if ( parentPanel.tournament_id )
            {
                msg = "#CSGO_Watch_NoMatch_Tournament_" + parentPanel.tournament_id.split(':')[1];
                _ShowInfoPanel( false, parentPanel );
            }
            else 
            {
                switch( parentPanel.id )
                {
                    case "JsLive":
                        msg = "#CSGO_Watch_NoMatch_live";
                        break;
                    case "JsYourMatches":
                        msg = "#CSGO_Watch_NoMatch_your";
                        break;
                    case "JsDownloaded":
                        msg = "#CSGO_Watch_NoMatch_downloaded";
                        break;
                }
            }
            _SetListMessage( $.Localize( msg ), true, parentPanel );
        }
        else
        {
            _ShowInfoPanel( true, parentPanel );
            _SetListMessage( "", false, parentPanel );
        }

        var displayedMatches = new Array();
        var elMatchList = parentPanel.FindChildTraverse("JsMatchList");

        for ( var i = 0 ; i < elMatchList.GetChildCount(); i ++ )
        {
            elMatchList.GetChild( i ).markForDelete = true;
        }

        function _CreateOrValidateMatchTile( matchId )
        {
            var elMatchButton = elMatchList.FindChildInLayoutFile( matchListDescriptor + "_" + matchId );
            if ( elMatchButton == undefined )
            {
                elMatchButton = $.CreatePanel( 'RadioButton', elMatchList, matchListDescriptor + "_" + matchId );
                elMatchButton.downloadStateHandler = undefined;
                elMatchButton.group = parentPanel.id;
                elMatchButton.myXuid = _m_myXuid;
                elMatchButton.matchId = matchId;
                elMatchButton.matchListDescriptor = matchListDescriptor;
                if ( matchId != 'gotv')
                {
                    elMatchButton.SetPanelEvent('onactivate', _PopulateMatchInfo.bind( undefined, parentPanel, matchListDescriptor, matchId ) );
                }
                else
                {
                    elMatchButton.SetPanelEvent('onactivate', _ShowGOTVConfirmPopup.bind( undefined, parentPanel ) );
                }
                elMatchButton.SetPanelEvent('onmouseover', OnMouseOverButton.bind( undefined, parentPanel, matchListDescriptor + "_" + matchId ) );
                elMatchButton.SetPanelEvent('onmouseout', OnMouseOutButton.bind( undefined, parentPanel, matchListDescriptor + "_" + matchId ) );
                watchTile.Init( elMatchButton );
                elMatchButton.RemoveClass( 'MatchTile--Collapse' );
            }
            elMatchButton.markForDelete = false;

            function _UpdateDownloadState( elBoundMatchButton )
            {
                if ( ( elBoundMatchButton ) && ( !elBoundMatchButton.markForDelete ) )
                {
                    var elDownloadIndicator = elBoundMatchButton.FindChildInLayoutFile( 'id-download-state' );
                    if ( elDownloadIndicator )
                    {
                        var isDownloading = ( MatchInfoAPI.GetMatchState( elBoundMatchButton.matchId ) === "downloading" )
                        var canWatch = MatchInfoAPI.CanWatch( elBoundMatchButton.matchId );
                        elDownloadIndicator.SetHasClass( "download-animation", isDownloading );
                        elDownloadIndicator.SetHasClass( "downloaded", canWatch );
                    }
                }
            }

            if ( ( elMatchButton.downloadStateHandler == undefined ) && elMatchButton.FindChildInLayoutFile( 'id-download-state' ) )
            {
                elMatchButton.downloadStateHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_MatchInfo_StateChange', _UpdateDownloadState.bind( undefined, elMatchButton ) );
                _UpdateDownloadState( elMatchButton );
            }

            elMatchButton.RemoveClass( 'MatchTile--Collapse' );
        }
		
        for ( i = 0; i < nCount; i++ )
        {
            if  ( ( parentPanel.tournament_id ) && ( tournamentIndex > 3 ) )
            {
                _CreateOrValidateMatchTile(  PredictionsAPI.GetSectionMatchByIndex( parentPanel.tournament_id, sectionDesc, i ) );
            }
            else
            {
				var matchbyindex = MatchListAPI.GetMatchByIndex( matchListDescriptor, i );
				                                                                            
                _CreateOrValidateMatchTile( matchbyindex );
            }
        }

		                                               
        if ( ( matchListDescriptor === 'live' ) && ( nCount > 0 ) )
        {
            _CreateOrValidateMatchTile(  'gotv' );
        }

        _ClearList( elMatchList, parentPanel.tournament_id );
        _SelectFirstTile( parentPanel, elMatchList, matchListDescriptor );

        parentPanel.matchListIsPopulated = true;
    }

                          
	return {
        UpdateMatchList             : _UpdateMatchList,
        ShowListSpinner             : _ShowListSpinner,
        SetListMessage              : _SetListMessage,
        ShowInfoPanel               : _ShowInfoPanel,
        ReselectActiveTile          : _ReselectActiveTile
    };

})();

(function()
{

})();