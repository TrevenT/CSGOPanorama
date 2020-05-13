'use strict';

var TournamentJournal = ( function()
{
    var m_test_challenges = [
                                                                                                                                    
    ];

    var isInMatch = GameStateAPI.IsDemoOrHltv() || GameStateAPI.IsLocalPlayerPlayingMatch(); 

    var _Init = function()
    {
        var journalId = $.GetContextPanel().GetAttributeString( "journalid", '' );
        var tournamentId = InventoryAPI.GetItemAttributeValue( journalId, "tournament event id" );
                           
                              
		
                                     
        var nCampaignID = parseInt( InventoryAPI.GetItemAttributeValue( journalId, "campaign id" ) );
                                                
        var numTotalChallenges = InventoryAPI.GetCampaignNodeCount( nCampaignID );
                                                            
        for ( var jj = 0; jj < numTotalChallenges; ++jj )
        {
            var nMissionNodeID = InventoryAPI.GetCampaignNodeIDbyIndex( nCampaignID, jj );
                                         
            var strNodeState = InventoryAPI.GetCampaignNodeState( nCampaignID, nMissionNodeID, journalId );
                                            
            var nQuestID = InventoryAPI.GetCampaignNodeQuestID( nCampaignID, nMissionNodeID );
            var strFauxQuestItem = InventoryAPI.GetQuestItemIDFromQuestID( nQuestID );
            var strQuestIcon = InventoryAPI.GetQuestIcon( strFauxQuestItem );
            var strQuestName = InventoryAPI.GetItemName( strFauxQuestItem );
                                                      
                                                                                                               
            m_test_challenges.push( {
                text: strQuestName,
                context: ( strQuestIcon === 'watchem' ) ? 'watch' : ( strQuestIcon === 'pickem' ) ?'trophy' : strQuestIcon,                                                   
                value: ( strNodeState === "complete" ) ? 1 : 0                                              
            } );
        }

        _SetTitle( journalId );
        _SetModel( journalId );
        _SetBannerColor( journalId );
        _SetThesholdText( journalId );
        _UpdateChallengesList( journalId );
        _SetUpSpray();
        _SouvenirsEarned( journalId, tournamentId );
        _SetEventSticker( tournamentId );
        _WatchStreamBtn();
        _RedeemBtn();
    };

    var _ClosePopup = function()
    {
        $.DispatchEvent( 'UIPopupButtonClicked', '' );
    };

    var _SetTitle = function( journalId )
    {
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-title' ).text = ItemInfo.GetName( journalId );
    };
    
    var _SetModel = function( id )
    {
        var elModel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-model' );
                                                                   
        var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( id );
        
        var manifest = "resource/ui/econ/ItemModelPanelCharWeaponInspect.res";
        elModel.SetScene( manifest, modelPath, false );
        elModel.SetCameraPreset( 1, false );
        elModel.SetSceneIntroRotation( -10.0, 20, 1 );
    };

    var _SetBannerColor = function( journalId )
    {
        var coinLevel = InventoryAPI.GetItemAttributeValue( journalId, "upgrade level" );
                                                                                                 

        var style = coinLevel <= 1 ? 'bronze' : coinLevel == 2 ? 'silver' : coinLevel < 2 ? 'gold' : 'bronze';
        $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-container' ).AddClass( style );
    };

    var _SetThesholdText = function( journalId )
    {
        var threshold = InventoryAPI.GetItemAttributeValue( journalId, "upgrade threshold" );
        var completedChallenges = m_test_challenges.filter( function( entry ) { return entry.value === 1; } );
        $.GetContextPanel().SetDialogVariableInt( 'challenges', ( threshold - completedChallenges.length ) );

        _SetPoints( completedChallenges );
    };

    var _SetPoints = function( completedChallenges )
    {
        $.GetContextPanel().SetDialogVariableInt( 'challenges_complete', completedChallenges.length );
    };

    var _SouvenirsEarned = function( journalId, tournamentId )
    {
        var redeems = InventoryAPI.GetItemAttributeValue( journalId, "operation drops awarded 0" );
        $.GetContextPanel().SetDialogVariableInt( 'redeems_remain', ( redeems !== undefined ) ? redeems : 0 );

        var elImage = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-ticket-icon' );
        elImage.SetImage( 'file://{images}/tournaments/souvenir/souvenir_blank_tournament_' + tournamentId + '.png' );
    };

    var _SetEventSticker = function( tournamentId )
    {
        var elTitleBar = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-title-bar' );
        
        $.CreatePanel(
            "Image",
            elTitleBar,
            '',
            {
                texturewidth: '98',
                textureheight: '-1',
                src: 'file://{images}/tournaments/events/tournament_logo_' + tournamentId + '.svg',
                class: 'tournament-journal__titlebar__logo'
        });
    };

    var _UpdateChallengesList = function( journalId )
    {
        var elList = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal__challenges-list' );

        m_test_challenges.forEach( function( obj, index )
        {
            var elChallenge = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal__challenges' + index );
            
            if ( !elChallenge )
            {
                elChallenge = _CreateChallenge( elList, index );
            }
            _UpdateChallenge( obj, elChallenge, index );
        } );

        function _CreateChallenge ( elList, index )
        {
            var elChallenge = $.CreatePanel( "Panel", elList, 'id-tournament-journal__challenges' + index );
            elChallenge.BLoadLayoutSnippet( "tournament-challenge" );

            elChallenge.SetHasClass( 'dark', ( index % 2 !== 0 ) );
            return elChallenge;
        }

        function _UpdateChallenge ( objData, elChallenge, index )
        {
            var elName = elChallenge.FindChildInLayoutFile( 'id-tournament-journal__challenge__name' );
            var elIcon = elChallenge.FindChildInLayoutFile( 'id-tournament-journal__challenge__icon' );
            elName.text = objData.text;

            var iconPath = objData.value === 1 ? 'file://{images}/icons/ui/check.svg' :
                'file://{images}/icons/ui/' + objData.context + '.svg';

            elIcon.SetImage( iconPath );
            elChallenge.SetHasClass( 'complete', objData.value === 1 );
            elChallenge.enabled = objData.value !== 1 && !isInMatch;

            if ( objData.context === "trophy" )
            {
                _OnActivatePickemChallenge( elChallenge, index );
            }
            else if ( objData.context === 'watch' )
            {
                _OnWatchStream( elChallenge );
            }
        }

        function _OnActivatePickemChallenge ( elPanel, index )
        {
            var idforTab = '';
            switch ( index )
            {
                case 1: 
                    idforTab = 'id-nav-pick-prelims';
                    break;
                case 3: 
                    idforTab = 'id-nav-pick-group';
                    break;
                case 5: 
                    idforTab = 'id-nav-pick-playoffs';
                    break;
                case 7: 
                    idforTab = 'id-nav-pick-playoffs';
                    break;
                case 9: 
                    idforTab = 'id-nav-pick-playoffs';
                    break;
              }
            
            elPanel.SetPanelEvent( 'onactivate', OnActivate.bind( undefined, idforTab ) );
            
            function OnActivate ( idforTab )
            {
                $.DispatchEvent( 'OpenWatchMenu' );
                $.DispatchEvent( 'ShowActiveTournamentPage', idforTab );
                _ClosePopup();
            }
        }
    };

    var _OnWatchStream = function( elPanel )
    {
        elPanel.SetPanelEvent( 'onactivate', function()
        {
            SteamOverlayAPI.OpenURL( 'https://steam.tv/csgo' );
        } );
    };

    var _SetUpSpray = function()
    {
        var journalId = $.GetContextPanel().GetAttributeString( "journalid", '' );
        var elImage = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-spray' );
        elImage.itemid = ItemInfo.GetFauxReplacementItemID( journalId, 'graffiti' );

                                                
        
        var elIBtn = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-selectspray-btn' );
        elIBtn.SetPanelEvent( 'onactivate', function(){
                UiToolkitAPI.ShowCustomLayoutPopupParameters(
                    '',
                    'file://{resources}/layout/popups/popup_tournament_select_spray.xml',
                    'journalid=' + journalId
                );
            }
        );
    };

    var _OnActivateRedeem = function()
    {
        $.DispatchEvent( 'OpenWatchMenu' );
        $.DispatchEvent( 'ShowActiveTournamentPage', 'id-nav-matches' );
        _ClosePopup();
    };

    var _WatchStreamBtn = function()
    {
        var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-watch-stream' );
        _OnWatchStream( elPanel );
    };

    var _RedeemBtn = function()
    {
        var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'id-tournament-journal-redeem-btn' );
        elPanel.enabled = !isInMatch;
    };

	return{
		Init: _Init,
        ClosePopup: _ClosePopup,
        SetUpSpray: _SetUpSpray,
        OnActivateRedeem: _OnActivateRedeem
	};
} )();

( function()
{
    $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', TournamentJournal.SetUpSpray );
} )();

